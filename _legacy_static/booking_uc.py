"""
Booking.com Scraper using undetected-chromedriver
====================================================
Sister script to mmt_uc.py / agoda_uc.py, same defensive patterns
(window-settle guard, non-fatal popup handling, stub/block retry-backoff,
explicit desktop window size, hard navigation verification).

This script:
1. Opens a Chrome window that looks 100% real to Booking.com
2. Searches for hotels in a city, picking explicit check-in/out dates
   (Booking.com has no sensible default dates like Agoda does)
3. Applies Booking.com's "Hot tub/Jacuzzi" facility filter — its closest
   match to our target amenity; Booking.com has no separate "Bathtub" facet
4. Visits each hotel detail page, grabs name/image/"About this property"
   description
5. Saves results to the `hotelcandidates` STAGING collection — NOT the live
   `hotels` collection. Single-source data doesn't auto-publish; a separate
   matching/reconciliation step (against MMT + Agoda) decides what actually
   goes live.

Usage:
    python3 booking_uc.py [city]
    python3 booking_uc.py Gwalior
"""

import sys
import os
import time
import urllib.request
from datetime import datetime, timedelta, timezone

# Import Blob helper for image uploads
sys.path.insert(0, os.path.dirname(__file__))
from blob_helper import upload_image_to_blob

try:
    import undetected_chromedriver as uc
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.common.keys import Keys
    from selenium.webdriver.common.action_chains import ActionChains
except ImportError:
    print("Please run: pip3 install undetected-chromedriver selenium --break-system-packages")
    sys.exit(1)

try:
    from PIL import Image
except ImportError:
    Image = None

workspace_dir = '/Users/karanarora/hotelswithbathtubs'
assets_dir = os.path.join(workspace_dir, 'public', 'assets')

CITY = sys.argv[1] if len(sys.argv) > 1 else "Gwalior"
COUNTRY = sys.argv[2] if len(sys.argv) > 2 else "India"

print(f"\n{'='*60}")
print(f"🏨 BOOKING.COM Undetected Scraper — {CITY}, {COUNTRY}")
print(f"{'='*60}")

def download_image(url, slug):
    """Download, convert to WebP, and upload to Vercel Blob"""
    if not Image:
        return None
    try:
        filename = f"booking-{slug}.webp"
        webp_path = os.path.join(assets_dir, filename)

        # Create assets dir if it doesn't exist (for temp storage during conversion)
        os.makedirs(assets_dir, exist_ok=True)

        # Download image
        img_path = os.path.join(assets_dir, f"booking-{slug}.jpeg")
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Referer': 'https://www.booking.com/'
        })
        with urllib.request.urlopen(req, timeout=10) as resp:
            with open(img_path, 'wb') as f:
                f.write(resp.read())

        # Convert to WebP
        with Image.open(img_path) as img:
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            img.save(webp_path, 'webp', quality=85)
        os.remove(img_path)

        # Upload to Blob and get URL
        blob_url = upload_image_to_blob(filename, workspace_dir)
        return blob_url
    except Exception:
        return None

def is_stub_page(driver):
    try:
        body_text = driver.find_element(By.TAG_NAME, 'body').text.strip()
        return body_text == '200-OK' or len(driver.page_source) < 1000
    except Exception:
        return False

def goto_with_retry(driver, url, max_attempts=4, cooldown=60):
    for attempt in range(1, max_attempts + 1):
        driver.get(url)
        time.sleep(5)
        if not is_stub_page(driver):
            return True
        print(f"  ⚠️ Got a blocked/stub response (attempt {attempt}/{max_attempts})")
        if attempt < max_attempts:
            print(f"     Cooling down {cooldown}s before retrying...")
            time.sleep(cooldown)
            cooldown = min(cooldown * 2, 300)
    return False

def scrape():
    validated_hotels = []
    filter_applied = False

    print("Launching undetected Chrome...")
    if not hasattr(uc.ChromeOptions, 'headless'):
        uc.ChromeOptions.headless = property(lambda self: False)

    options = uc.ChromeOptions()
    options.add_argument('--window-size=1440,900')

    # Window size is set via the --window-size launch arg above. A redundant
    # driver.set_window_size() call here, issued before uc's internal tab
    # churn settles, is exactly what causes "no such window: target window
    # already closed" crashes — so don't call it.
    driver = uc.Chrome(options=options, version_main=151)
    wait = WebDriverWait(driver, 15)

    time.sleep(2)
    for _ in range(10):
        handles = driver.window_handles
        if handles:
            driver.switch_to.window(handles[-1])
            break
        time.sleep(0.5)

    try:
        print("Navigating to Booking.com homepage...")
        if not goto_with_retry(driver, "https://www.booking.com"):
            print("  ❌ Booking.com is still blocking us after retries — likely rate-limited.")
            print("     Try again later.")
            return []

        # Dismiss the "Sign in, save money" popup — best effort, non-fatal.
        print("Closing any popup...")
        try:
            for sel in ['button[aria-label="Dismiss sign-in info."]', 'button[aria-label="Close"]']:
                try:
                    btn = driver.find_element(By.CSS_SELECTOR, sel)
                    driver.execute_script("arguments[0].click();", btn)
                    break
                except Exception:
                    continue
            ActionChains(driver).send_keys(Keys.ESCAPE).perform()
            time.sleep(1)
        except Exception as e:
            print(f"  ⚠️ Popup-close step failed ({str(e)[:80]}), continuing")

        # Set the city
        print(f"Setting city to {CITY}...")
        try:
            city_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'input[name="ss"]')))
            driver.execute_script("arguments[0].click();", city_input)
            city_input.send_keys(Keys.CONTROL, 'a')
            city_input.send_keys(Keys.BACKSPACE)
            city_input.send_keys(CITY)
            time.sleep(2)

            city_lower = CITY.lower()
            country_lower = COUNTRY.lower()
            options_els = [
                li for li in driver.find_elements(By.TAG_NAME, 'li')
                if city_lower in li.text.lower() and 0 < len(li.text) < 100
            ]
            
            country_els = [li for li in options_els if country_lower in li.text.lower()]
            
            if country_els:
                print(f"  Clicking: {country_els[0].text[:50]}")
                driver.execute_script("arguments[0].click();", country_els[0])
            elif options_els:
                print(f"  Clicking: {options_els[0].text[:50]}")
                driver.execute_script("arguments[0].click();", options_els[0])
            else:
                city_input.send_keys(Keys.RETURN)
            time.sleep(1)
        except Exception as e:
            print(f"  ⚠️ City-selection step failed ({str(e)[:80]})")

        # Pick explicit check-in/check-out dates — Booking.com has no
        # sensible default unless a prior session cookie exists. Target
        # calendar day cells by their deterministic data-date attribute.
        checkin_date = datetime.now() + timedelta(days=3)
        checkout_date = datetime.now() + timedelta(days=4)
        print(f"Selecting dates {checkin_date.date()} → {checkout_date.date()}...")
        try:
            for label, d in [('check-in', checkin_date), ('check-out', checkout_date)]:
                date_str = d.strftime('%Y-%m-%d')
                cell = None
                try:
                    cell = driver.find_element(By.CSS_SELECTOR, f'span[data-date="{date_str}"]')
                except Exception:
                    # Target month not showing — advance the calendar.
                    try:
                        next_btn = driver.find_element(By.CSS_SELECTOR, 'button[aria-label="Next month"]')
                        driver.execute_script("arguments[0].click();", next_btn)
                        time.sleep(0.5)
                        cell = driver.find_element(By.CSS_SELECTOR, f'span[data-date="{date_str}"]')
                    except Exception:
                        cell = None
                if cell:
                    driver.execute_script("arguments[0].click();", cell)
                    print(f"  ✅ Selected {label}: {date_str}")
                else:
                    print(f"  ⚠️ Could not find {label} date cell for {date_str}")
                time.sleep(0.6)
        except Exception as e:
            print(f"  ⚠️ Date picker step failed ({str(e)[:100]}), continuing")

        # Click search
        print("Clicking Search...")
        clicked_search = False
        try:
            btn = driver.find_element(By.XPATH, '//button[@type="submit" and .//text()[contains(., "Search")]]')
            driver.execute_script("arguments[0].click();", btn)
            clicked_search = True
            print("  ✅ Clicked search button")
        except Exception:
            try:
                btn = driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')
                driver.execute_script("arguments[0].click();", btn)
                clicked_search = True
                print("  ✅ Clicked search button (fallback selector)")
            except Exception as e:
                print(f"  ⚠️ Could not click search button ({str(e)[:80]})")

        print("Waiting for results to load...")
        time.sleep(10)

        if is_stub_page(driver):
            print("  ❌ Got blocked/stub response after search — likely rate-limited.")
            print("     Try again later.")
            return []

        if 'searchresults' not in driver.current_url:
            print(f"  ❌ Still not on a search results page (url: {driver.current_url})")
            print("     Aborting rather than scrape the wrong page.")
            return []
        print(f"  ✅ On search results page ({driver.current_url[:80]}...)")

        # Apply the "Hot tub/Jacuzzi" facility filter (hotelfacility=63) so
        # Booking.com itself only returns matching hotels. Prefer a direct
        # URL param — more robust than clicking a checkbox in a sidebar that
        # may or may not be scrolled into view.
        print("Applying facility filter: Hot tub/Jacuzzi...")
        try:
            current_url = driver.current_url
            sep = '&' if '?' in current_url else '?'
            filtered_url = f"{current_url}{sep}nflt=hotelfacility%3D63"
            driver.get(filtered_url)
            time.sleep(1)
            if 'hotelfacility' in driver.current_url and not is_stub_page(driver):
                filter_applied = True
                print("  ✅ Hot tub/Jacuzzi filter applied via URL")
                time.sleep(4)
            else:
                print("  ⚠️ Filter URL didn't take effect")
        except Exception as e:
            print(f"  ⚠️ Could not apply facility filter ({str(e)[:80]})")
            print("     Continuing without a source-side filter guarantee")

        if is_stub_page(driver):
            print("  ❌ Got blocked/stub response after filtering — likely rate-limited.")
            return []

        print("Scrolling to load hotel cards...")
        for i in range(8):
            driver.execute_script(f"window.scrollTo(0, {i * 500})")
            time.sleep(0.8)
        driver.execute_script("window.scrollTo(0, 0)")
        time.sleep(2)

        driver.save_screenshot(os.path.join(workspace_dir, f'booking_{CITY.lower()}_listing.png'))
        with open(os.path.join(workspace_dir, 'booking_page.html'), 'w', encoding='utf-8') as f:
            f.write(driver.page_source)

        print("\nLooking for hotel links...")
        elems = driver.find_elements(By.CSS_SELECTOR, 'a[href*="/hotel/"]')
        # Each hotel card has multiple links to the same property (image,
        # name, "See availability" button, ...) each carrying different
        # tracking query params — dedupe on the path only, or the same
        # hotel gets visited N times, and the last (often slower/incomplete)
        # visit's blank fields silently overwrite good data on upsert.
        seen_paths = set()
        hotel_links = []
        for e in elems:
            href = e.get_attribute('href')
            if not href or 'index.en-gb.html' in href:
                continue
            path = href.split('?')[0]
            if path not in seen_paths:
                seen_paths.add(path)
                hotel_links.append(href)
        print(f"  Found {len(hotel_links)} hotel links")

        if not hotel_links:
            print("  No hotel links found on listing page")
            print("  Page title:", driver.title)
        else:
            to_visit = hotel_links[:20]
            print(f"\nVisiting {len(to_visit)} hotels...")
            for i, link in enumerate(to_visit):
                try:
                    driver.get(link)
                    time.sleep(4)

                    # `h2` proved more reliable than `[data-testid="property-name"]`
                    # across property types — Booking.com serves different page
                    # templates for hotels vs. homestays/apartments, and the
                    # testid isn't consistently present across them.
                    hotel_name = None
                    for sel in ['h2', '[data-testid="property-name"]']:
                        try:
                            el = driver.find_element(By.CSS_SELECTOR, sel)
                            hotel_name = el.text.strip()
                            if hotel_name:
                                break
                        except Exception:
                            pass

                    # Some templates append an SEO suffix, e.g.
                    # "Moti Manas Mansion - A Homestay in Gwalior" — keep
                    # just the actual name before the first " - ".
                    if hotel_name and ' - ' in hotel_name:
                        hotel_name = hotel_name.split(' - ')[0].strip()

                    description = None
                    try:
                        desc_el = driver.find_element(By.CSS_SELECTOR, '[data-testid="property-description"]')
                        description = desc_el.text.strip()
                    except Exception:
                        description = None

                    img_url = None
                    try:
                        meta = driver.find_element(By.CSS_SELECTOR, 'meta[property="og:image"]')
                        img_url = meta.get_attribute('content')
                    except Exception:
                        pass

                    status = "✅" if hotel_name else "⚠️ no name"
                    print(f"  [{i+1}] {hotel_name or 'Unknown'} — {status}")

                    if hotel_name:
                        slug = hotel_name.lower().replace(' ', '-').replace("'", "").replace(',', '')[:50]
                        img_path = download_image(img_url, slug) if img_url else None

                        validated_hotels.append({
                            "source": "booking",
                            "name": hotel_name,
                            "city": CITY,
                            "url": link,
                            "image": img_path or "/assets/fallback.webp",
                            "amenities": ["Jacuzzi"],
                            "description": description or "",
                            "filterApplied": filter_applied,
                        })

                    time.sleep(1)
                except Exception as e:
                    print(f"  [{i+1}] Error: {str(e)[:50]}")

    except Exception as e:
        print(f"\n❌ Main error: {e}")

    finally:
        time.sleep(2)
        driver.quit()

    print(f"\n{'='*60}")
    print(f"✅ BOOKING.COM CANDIDATES IN {CITY.upper()}: {len(validated_hotels)}")
    print(f"{'='*60}")
    for h in validated_hotels:
        print(f"  🛁 {h['name']} [{', '.join(h['amenities'])}]")
        print(f"     img: {h['image']}")
        desc = h.get('description') or ''
        print(f"     about: {desc[:100]}{'…' if len(desc) > 100 else ''}")

    print("\n💾 Connecting to MongoDB Atlas (staging collection: hotelcandidates)...")
    import pymongo
    from dotenv import load_dotenv

    load_dotenv(os.path.join(workspace_dir, '.env.local'))
    MONGODB_URI = os.getenv('MONGODB_URI')

    if MONGODB_URI and validated_hotels:
        try:
            client = pymongo.MongoClient(MONGODB_URI)
            db = client.get_database()
            candidates_col = db.hotelcandidates

            inserted = 0
            for h in validated_hotels:
                slug = h['name'].lower().replace(' ', '-').replace("'", "").replace(',', '')[:50]
                doc = {
                    "source": "booking",
                    "name": h['name'],
                    "slug": slug,
                    "city": CITY.title(),
                    "country": COUNTRY.title(),
                    "url": h['url'],
                    "image": h['image'],
                    "amenities": h['amenities'],
                    "description": h['description'],
                    "filterApplied": h['filterApplied'],
                    "scrapedAt": datetime.now(timezone.utc),
                }
                result = candidates_col.update_one(
                    {"source": "booking", "slug": slug, "city": CITY.title()},
                    {"$set": doc},
                    upsert=True
                )
                if result.upserted_id or result.modified_count > 0 or result.matched_count > 0:
                    inserted += 1

            print(f"✅ Successfully inserted/updated {inserted} candidates in hotelcandidates!")
            client.close()
        except Exception as e:
            print(f"❌ Error saving to MongoDB: {e}")
    else:
        print("❌ No MongoDB URI found or no candidates to save.")

    return validated_hotels

if __name__ == "__main__":
    scrape()
