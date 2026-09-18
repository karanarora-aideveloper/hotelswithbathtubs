"""
Agoda Scraper using undetected-chromedriver
=============================================
Sister script to mmt_uc.py, same defensive patterns (window-settle guard,
non-fatal popup handling, stub/block retry-with-backoff).

This script:
1. Opens a Chrome window that looks 100% real to Agoda
2. Searches for hotels in a city
3. Applies Agoda's own "Bathtub" room-amenity filter (Agoda has no separate
   Jacuzzi facet — "Bathtub" is the closest/only matching room amenity)
4. Visits each hotel detail page, grabs name/image/"About us" description
5. Saves results to the `hotelcandidates` STAGING collection — NOT the live
   `hotels` collection. Single-source data doesn't auto-publish; a separate
   matching/reconciliation step (against MMT + Booking.com) decides what
   actually goes live. See the cross-platform verification plan.

Usage:
    python3 agoda_uc.py [city]
    python3 agoda_uc.py Kolkata
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
except ImportError:
    print("Please run: pip3 install undetected-chromedriver selenium --break-system-packages")
    sys.exit(1)

try:
    from PIL import Image
except ImportError:
    Image = None

workspace_dir = os.getcwd()
assets_dir = os.path.join(workspace_dir, 'public', 'assets')

CITY = sys.argv[1] if len(sys.argv) > 1 else "Kolkata"
COUNTRY = sys.argv[2] if len(sys.argv) > 2 else "India"

print(f"\n{'='*60}")
print(f"🏨 AGODA Undetected Scraper — {CITY}, {COUNTRY}")
print(f"{'='*60}")

def download_image(url, slug):
    """Download, convert to WebP, and upload to Vercel Blob"""
    if not Image:
        return None
    try:
        filename = f"agoda-{slug}.webp"
        webp_path = os.path.join(assets_dir, filename)

        # Create assets dir if it doesn't exist (for temp storage during conversion)
        os.makedirs(assets_dir, exist_ok=True)

        # Download image
        img_path = os.path.join(assets_dir, f"agoda-{slug}.jpeg")
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Referer': 'https://www.agoda.com/'
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
    """Detect a bare block/stub response — same rate-limit/bot-mitigation
    signal we hit repeatedly with MMT."""
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

    # Explicit desktop window size — without this, Agoda renders a
    # different mobile layout with a different search-widget DOM entirely,
    # which silently broke city/search selectors in the first run.
    options = uc.ChromeOptions()
    options.add_argument('--window-size=1440,900')

    # Window size is set via the --window-size launch arg above. A redundant
    # driver.set_window_size() call here, issued before uc's internal tab
    # churn settles, is exactly what causes "no such window: target window
    # already closed" crashes — so don't call it.
    def get_chrome_version():
        try:
            out = subprocess.check_output(['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '--version']).decode('utf-8')
            m = re.search(r'Chrome\s+(\d+)', out)
            if m:
                return int(m.group(1))
        except Exception:
            pass
        return 153

    driver = uc.Chrome(options=options, version_main=get_chrome_version())
    wait = WebDriverWait(driver, 15)

    # Let undetected-chromedriver's internal tab churn settle before acting.
    time.sleep(2)
    for _ in range(10):
        handles = driver.window_handles
        if handles:
            driver.switch_to.window(handles[-1])
            break
        time.sleep(0.5)

    try:
        print("Navigating to Agoda homepage...")
        if not goto_with_retry(driver, "https://www.agoda.com"):
            print("  ❌ Agoda is still blocking us after retries — likely rate-limited.")
            print("     Try again later.")
            return []

        # Dismiss any promo/QR popup — best effort, non-fatal.
        print("Closing any popup...")
        try:
            for sel in ['button[aria-label="Close"]', '.close-btn', '[data-selenium="close-icon"]']:
                try:
                    btn = driver.find_element(By.CSS_SELECTOR, sel)
                    driver.execute_script("arguments[0].click();", btn)
                    break
                except Exception:
                    continue
            ActionChainsCls = __import__('selenium.webdriver.common.action_chains', fromlist=['ActionChains']).ActionChains
            ActionChainsCls(driver).send_keys(Keys.ESCAPE).perform()
            time.sleep(1)
        except Exception as e:
            print(f"  ⚠️ Popup-close step failed ({str(e)[:80]}), continuing")

        # Set the city — Agoda's destination input is a real (non-readonly)
        # text field, so plain send_keys works directly.
        print(f"Setting city to {CITY}...")
        try:
            city_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '[data-selenium="textInput"]')))
            driver.execute_script("arguments[0].click();", city_input)
            city_input.send_keys(Keys.CONTROL, 'a')
            city_input.send_keys(Keys.BACKSPACE)
            city_input.send_keys(CITY)
            time.sleep(2)

            options = driver.find_elements(By.CSS_SELECTOR, '[role="option"]')
            # The first suggestion isn't reliably the city itself — Agoda
            # can rank a specific street address that merely contains the
            # city name as a substring (e.g. searching "Bhopal" surfaced a
            # street address in Kolkata ahead of the actual city). City-level
            # results read like "Bhopal, India" (few comma segments, short);
            # address-level results have many comma segments and are long.
            # Prefer whichever option matches the city name with the fewest
            # commas, and shortest text as a tiebreaker.
            named_options = [o for o in options if o.text and CITY.lower() in o.text.lower()]
            country_options = [o for o in named_options if COUNTRY.lower() in o.text.lower()]
            
            if country_options:
                best = min(country_options, key=lambda o: (o.text.count(','), len(o.text)))
                print(f"  Clicking: {best.text[:60]}")
                driver.execute_script("arguments[0].click();", best)
            elif named_options:
                best = min(named_options, key=lambda o: (o.text.count(','), len(o.text)))
                print(f"  Clicking: {best.text[:60]}")
                driver.execute_script("arguments[0].click();", best)
            elif options:
                print(f"  ⚠️ No option matched \"{CITY}\" by name — falling back to first option")
                print(f"  Clicking: {options[0].text[:60]}")
                driver.execute_script("arguments[0].click();", options[0])
            else:
                city_input.send_keys(Keys.RETURN)
            time.sleep(1)

            # Selecting a destination can auto-open the date-range calendar;
            # Agoda's own defaults are sensible, so just dismiss it rather
            # than fight through date-cell selection like MMT required.
            ActionChainsCls = __import__('selenium.webdriver.common.action_chains', fromlist=['ActionChains']).ActionChains
            ActionChainsCls(driver).send_keys(Keys.ESCAPE).perform()
            time.sleep(1)
        except Exception as e:
            print(f"  ⚠️ City-selection step failed ({str(e)[:80]})")

        # Click search. The button sometimes isn't in the DOM yet right
        # after the city-select + Escape sequence (seen reproducibly on
        # some cities, not just occasional flakiness) — poll briefly rather
        # than a single find_element attempt.
        print("Clicking Search...")
        clicked_search = False
        for attempt in range(5):
            for sel in ['[data-selenium="searchButton"]', 'button[type="submit"]']:
                try:
                    btn = driver.find_element(By.CSS_SELECTOR, sel)
                    driver.execute_script("arguments[0].click();", btn)
                    clicked_search = True
                    print(f"  ✅ Clicked search button via '{sel}' (attempt {attempt + 1})")
                    break
                except Exception:
                    continue
            if clicked_search:
                break
            time.sleep(1)
        if not clicked_search:
            try:
                btn = driver.find_element(
                    By.XPATH, '//button[normalize-space(translate(text(), "SEARCH", "search"))="search"]'
                )
                driver.execute_script("arguments[0].click();", btn)
                clicked_search = True
                print("  ✅ Clicked search button via text match")
            except Exception as e:
                print(f"  ⚠️ Could not click search button ({str(e)[:80]})")

        print("Waiting for results to load...")
        time.sleep(10)

        if is_stub_page(driver):
            print("  ❌ Got blocked/stub response after search — likely rate-limited.")
            print("     Try again later.")
            return []

        # Don't trust a non-throwing search click — verify we actually left
        # the homepage. A silent failure here previously cascaded into
        # scraping an unrelated homepage carousel (wrong city entirely).
        if '/search' not in driver.current_url:
            print(f"  ❌ Still not on a search results page (url: {driver.current_url})")
            print("     Aborting rather than scrape the wrong page.")
            return []
        print(f"  ✅ On search results page ({driver.current_url[:80]}...)")

        # Apply the "Bathtub" room-amenity filter so Agoda itself only
        # returns hotels that actually have one, instead of scraping
        # everything and guessing from page text later. Agoda has no
        # separate Jacuzzi facet for most cities — Bathtub is the room
        # amenity that matches our target.
        print("Applying room amenity filter: Bathtub...")
        try:
            bathtub_span = wait.until(EC.presence_of_element_located((
                By.XPATH,
                '//span[@data-selenium="filter-item-text" and normalize-space(text())="Bathtub"]'
            )))
            bathtub_label = bathtub_span.find_element(By.XPATH, './ancestor::label[1]')
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", bathtub_label)
            time.sleep(0.5)
            driver.execute_script("arguments[0].click();", bathtub_label)
            time.sleep(1)

            filter_applied = True
            print("  ✅ Bathtub filter checked — waiting for listing to refresh...")
            time.sleep(5)
        except Exception as e:
            print(f"  ⚠️ Could not apply Bathtub filter ({str(e)[:80]})")
            print("     Continuing without a source-side filter guarantee")

        if is_stub_page(driver):
            print("  ❌ Got blocked/stub response after filtering — likely rate-limited.")
            return []

        # Scroll to trigger lazy-loading
        print("Scrolling to load hotel cards...")
        for i in range(8):
            driver.execute_script(f"window.scrollTo(0, {i * 500})")
            time.sleep(0.8)
        driver.execute_script("window.scrollTo(0, 0)")
        time.sleep(2)

        driver.save_screenshot(os.path.join(workspace_dir, f'agoda_{CITY.lower()}_listing.png'))
        with open(os.path.join(workspace_dir, 'agoda_page.html'), 'w', encoding='utf-8') as f:
            f.write(driver.page_source)

        # Collect hotel links — pattern: /en-gb/{slug}/hotel/{city}-{cc}.html
        # Dedupe on path only (not full href) — the same card can carry
        # multiple links to the same property with different tracking query
        # params, and a repeat visit's blank fields can silently overwrite
        # good data already captured on the first visit via upsert.
        print("\nLooking for hotel links...")
        elems = driver.find_elements(By.CSS_SELECTOR, 'a[href*="/hotel/"]')
        seen_paths = set()
        hotel_links = []
        for e in elems:
            href = e.get_attribute('href')
            if not href or '.html' not in href:
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

                    hotel_name = None
                    for sel in ['h1', '[data-selenium="hotel-header-name"]']:
                        try:
                            el = driver.find_element(By.CSS_SELECTOR, sel)
                            hotel_name = el.text.strip()
                            if hotel_name:
                                break
                        except Exception:
                            pass

                    # "About us" description
                    description = None
                    try:
                        about_header = driver.find_element(
                            By.XPATH, '//h2[contains(translate(text(), "ABOUT", "about"), "about")]'
                        )
                        desc_el = about_header.find_element(By.XPATH, 'following-sibling::*[1]')
                        description = desc_el.text.strip()
                    except Exception:
                        description = None

                    # Image — prefer the og:image meta tag, simplest reliable source
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
                            "source": "agoda",
                            "name": hotel_name,
                            "city": CITY,
                            "url": link,
                            "image": img_path or "/assets/fallback.webp",
                            "amenities": ["Bathtub"],
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

    # Results
    print(f"\n{'='*60}")
    print(f"✅ AGODA CANDIDATES IN {CITY.upper()}: {len(validated_hotels)}")
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
                    "source": "agoda",
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
                    {"source": "agoda", "slug": slug, "city": CITY.title()},
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
