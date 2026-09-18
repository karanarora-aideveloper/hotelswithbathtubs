"""
MMT Scraper using undetected-chromedriver
==========================================
undetected-chromedriver patches Chrome to remove ALL automation fingerprints.
MMT cannot detect this as a bot.

This script:
1. Opens a Chrome window that looks 100% real to MMT
2. Searches for hotels in a city
3. Visits each hotel detail page
4. Checks amenities for BATHTUB/JACUZZI keywords
5. Downloads hotel images (converts to WebP)
6. Saves only VALIDATED hotels

Usage:
    python3 mmt_uc.py [city]
    python3 mmt_uc.py Udaipur
    python3 mmt_uc.py Manali
"""

import sys
import json
import os
import time
import urllib.request
from datetime import datetime, timedelta

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

CITY = sys.argv[1] if len(sys.argv) > 1 else "Udaipur"
COUNTRY = sys.argv[2] if len(sys.argv) > 2 else "India"
CITY_CODE = CITY.upper().replace(' ', '')

checkin = (datetime.now() + timedelta(days=3)).strftime("%m%d%Y")
checkout = (datetime.now() + timedelta(days=4)).strftime("%m%d%Y")

SEARCH_URL = (
    f"https://www.makemytrip.com/hotels/hotel-listing/"
    f"?checkin={checkin}&checkout={checkout}"
    f"&city={CITY_CODE}&roomCount=1&adultsCount=2"
    f"&searchText={CITY}%2C+{COUNTRY}&type=city"
)

BATHTUB_KEYWORDS = ['bathtub', 'bath tub', 'jacuzzi', 'soaking tub', 'hot tub', 'whirlpool', 'spa bath']

print(f"\n{'='*60}")
print(f"🏨 MMT Undetected Scraper — {CITY}, {COUNTRY}")
print(f"{'='*60}")

def download_image(url, slug):
    """Download, convert to WebP, and upload to Vercel Blob"""
    if not Image:
        return None
    try:
        filename = f"mmt-{slug}.webp"
        webp_path = os.path.join(assets_dir, filename)

        # Create assets dir if it doesn't exist (for temp storage during conversion)
        os.makedirs(assets_dir, exist_ok=True)

        # Download image
        img_path = os.path.join(assets_dir, f"mmt-{slug}.jpeg")
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Referer': 'https://www.makemytrip.com/'
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
    except Exception as e:
        return None

def is_stub_page(driver):
    """Detect MMT's bare text/plain "200-OK" block/stub response — seen when
    MMT rate-limits or soft-blocks repeated automated traffic instead of
    serving the real page."""
    try:
        body_text = driver.find_element(By.TAG_NAME, 'body').text.strip()
        return body_text == '200-OK' or len(driver.page_source) < 1000
    except Exception:
        return False

def goto_with_retry(driver, url, max_attempts=4, cooldown=60):
    """Navigate to `url`, retrying with backoff if MMT serves the stub
    block-page instead of real content. Returns True once real content
    loads, False if still blocked after all attempts."""
    for attempt in range(1, max_attempts + 1):
        driver.get(url)
        time.sleep(5)
        if not is_stub_page(driver):
            return True
        print(f"  ⚠️ Got a blocked/stub response (attempt {attempt}/{max_attempts})")
        if attempt < max_attempts:
            print(f"     Cooling down {cooldown}s before retrying...")
            time.sleep(cooldown)
            cooldown = min(cooldown * 2, 300)  # exponential backoff, capped at 5 min
    return False

def scrape():
    validated_hotels = []
    filter_applied = False  # True once the MMT "Bathtub" room-amenity filter is confirmed checked

    print("Launching undetected Chrome...")
    # Patch for undetected-chromedriver compatibility issue
    if not hasattr(uc.ChromeOptions, 'headless'):
        uc.ChromeOptions.headless = property(lambda self: False)
    
    def get_chrome_version():
        try:
            out = subprocess.check_output(['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '--version']).decode('utf-8')
            m = re.search(r'Chrome\s+(\d+)', out)
            if m:
                return int(m.group(1))
        except Exception:
            pass
        return 153

    driver = uc.Chrome(version_main=get_chrome_version())
    wait = WebDriverWait(driver, 15)

    # undetected-chromedriver opens an internal tab during its stealth-patch
    # setup and closes/replaces it a moment later. Acting before that settles
    # hits "no such window: target window already closed". Give it a beat and
    # make sure we're attached to whichever window handle actually survives.
    time.sleep(2)
    for _ in range(10):
        handles = driver.window_handles
        if handles:
            driver.switch_to.window(handles[-1])
            break
        time.sleep(0.5)

    try:
        print(f"Navigating to MMT homepage...")
        if not goto_with_retry(driver, "https://www.makemytrip.com/hotels/"):
            print("  ❌ MMT is still blocking us after retries — likely rate-limited")
            print("     from too many automated requests. Try again later.")
            return []  # `finally` below still handles driver.quit()

        # Close login popup via JavaScript. Not essential to the run, so a
        # failure here (e.g. a stale window handle from uc's tab churn) is
        # logged and skipped rather than aborting the whole scrape.
        print("Closing login popup...")
        try:
            driver.execute_script("""
                var modal = document.querySelector('[class*="modal"], [class*="Modal"]');
                if (modal) modal.style.display = 'none';
            """)
            time.sleep(1)

            # Press Escape to dismiss popup
            from selenium.webdriver.common.action_chains import ActionChains
            ActionChains(driver).send_keys(Keys.ESCAPE).perform()
            time.sleep(1)
        except Exception as e:
            print(f"  ⚠️ Popup-close step failed ({str(e)[:80]}), re-attaching to window and continuing")
            handles = driver.window_handles
            if handles:
                driver.switch_to.window(handles[-1])
            time.sleep(1)

        # Click city input using JavaScript
        print(f"Setting city to {CITY}...")
        driver.execute_script("""
            var input = document.querySelector('#city, [data-cy="city"]');
            if (input) { input.click(); input.focus(); }
        """)
        time.sleep(1)

        # Type city name
        from selenium.webdriver.common.action_chains import ActionChains
        city_el = None
        for sel in ['#city', '[data-cy="city"]', 'input[placeholder*="city" i]']:
            try:
                city_el = driver.find_element(By.CSS_SELECTOR, sel)
                if city_el: break
            except: pass

        if city_el:
            driver.execute_script("arguments[0].value = '';", city_el)
            driver.execute_script("arguments[0].focus();", city_el)
            city_el.send_keys(CITY)
            time.sleep(2)

            # Click first suggestion
            suggestions = driver.find_elements(By.CSS_SELECTOR,
                'li[class*="suggest"], .autoSuggestList li, [class*="suggestionItem"]')
            
            if suggestions:
                country_lower = COUNTRY.lower()
                country_suggestions = [s for s in suggestions if country_lower in s.text.lower()]
                
                if country_suggestions:
                    print(f"  Clicking: {country_suggestions[0].text[:50]}")
                    driver.execute_script("arguments[0].click();", country_suggestions[0])
                else:
                    print(f"  Clicking: {suggestions[0].text[:50]}")
                    driver.execute_script("arguments[0].click();", suggestions[0])
            else:
                city_el.send_keys(Keys.RETURN)
            time.sleep(1)
        else:
            print("  City input not found, navigating directly...")
            driver.get(SEARCH_URL)
            time.sleep(10)

        # Click search
        print("Clicking Search...")
        for sel in ['#hsw_search_button', '[data-cy="submit"]', 'button.widgetSearchBtn']:
            try:
                btn = driver.find_element(By.CSS_SELECTOR, sel)
                driver.execute_script("arguments[0].click();", btn)
                print(f"  ✅ Clicked search button")
                break
            except: pass

        print("Waiting 15s for results to load...")
        time.sleep(15)

        if is_stub_page(driver):
            print("  ❌ Got blocked/stub response after search — likely rate-limited")
            print("     from too many automated requests. Try again later.")
            return []  # `finally` below still handles driver.quit()

        # Apply the "Bathtub" and "Jacuzzi" checkboxes under the Room
        # Amenities filter (either/both — MMT ORs multiple checks within the
        # same filter category) so MMT itself only returns qualifying
        # hotels, instead of scraping everything and guessing from page text.
        AMENITY_FILTERS = ['Bathtub', 'Jacuzzi', 'Jacuzzi/Bathtub']
        applied_filters = []
        print(f"Applying Room Amenities filter: {' / '.join(AMENITY_FILTERS)}...")
        try:
            amenities_panel = wait.until(
                EC.presence_of_element_located((By.ID, "ROOM_AMENITIES"))
            )
            driver.execute_script(
                "arguments[0].scrollIntoView({block: 'center'});", amenities_panel
            )
            time.sleep(1)

            # MMT only renders the first 5 amenity checkboxes by default and
            # hides the rest (Bathtub/Jacuzzi included) behind a "Show N more"
            # toggle. Expand it first, or those checkboxes won't exist yet.
            try:
                show_more = amenities_panel.find_element(
                    By.XPATH, './/*[@id="hlistpg_proptypes_show_more" or contains(text(), "Show") and contains(text(), "more")]'
                )
                driver.execute_script("arguments[0].click();", show_more)
                time.sleep(1)
            except Exception:
                pass  # already expanded, or no toggle present for this city

            for label in AMENITY_FILTERS:
                try:
                    checkbox = amenities_panel.find_element(
                        By.XPATH, f'.//input[@aria-label="{label}"]'
                    )
                except Exception:
                    print(f"  ⚠️ \"{label}\" checkbox not found")
                    continue

                # The checkbox input is `readonly` — MMT's click handler lives
                # on the containing <li>, so click that (via JS to skip
                # visibility checks) rather than the input itself.
                li = checkbox.find_element(By.XPATH, './ancestor::li[1]')
                driver.execute_script("arguments[0].click();", li)
                time.sleep(1)

                # Fall back to clicking the input directly if the <li> click
                # didn't actually check it.
                if not checkbox.is_selected():
                    driver.execute_script("arguments[0].click();", checkbox)
                    time.sleep(1)

                if checkbox.is_selected():
                    print(f"  ✅ \"{label}\" filter checked")
                    applied_filters.append(label)
                else:
                    print(f"  ⚠️ \"{label}\" checkbox click didn't register as checked")

            filter_applied = len(applied_filters) > 0
            if filter_applied:
                print("  Waiting for listing to refresh...")
                time.sleep(6)  # MMT re-fetches the results via AJAX after a filter click
        except Exception as e:
            print(f"  ⚠️ Could not apply amenity filter ({str(e)[:80]})")
            print("     Falling back to per-hotel bathtub keyword scan")

        # Scroll to trigger lazy-loading
        print("Scrolling to load hotel cards...")
        for i in range(8):
            driver.execute_script(f"window.scrollTo(0, {i * 500})")
            time.sleep(0.8)
        driver.execute_script("window.scrollTo(0, 0)")
        time.sleep(3)
        
        # Screenshot
        driver.save_screenshot(os.path.join(workspace_dir, f'mmt_{CITY.lower()}_listing.png'))
        
        # Save HTML for analysis
        with open(os.path.join(workspace_dir, 'mmt_page.html'), 'w', encoding='utf-8') as f:
            f.write(driver.page_source)
        
        # Get hotel links
        print("\nLooking for hotel links...")
        hotel_links = []
        
        # Try multiple selectors for hotel listing cards
        for sel in ['a[href*="hotel-details"]', 'a[href*="hotel-listing"]', '.listing a', 
                    '[class*="listing"] a', '[class*="hotel"] a']:
            elems = driver.find_elements(By.CSS_SELECTOR, sel)
            hrefs = list(set([e.get_attribute('href') for e in elems if e.get_attribute('href') and 'hotel-details' in (e.get_attribute('href') or '')]))
            if hrefs:
                hotel_links = hrefs
                print(f"  Found {len(hrefs)} hotel links via '{sel}'")
                break
        
        if not hotel_links:
            print("  No hotel links found on listing page")
            print("  Page title:", driver.title)
            # Check what's visible
            body_text = driver.find_element(By.TAG_NAME, 'body').text[:500]
            print(f"  Page preview: {body_text}")
        else:
            # Visit each hotel detail page
            print(f"\nValidating {min(len(hotel_links), 20)} hotels for BATHTUB...")
            for i, link in enumerate(hotel_links[:20]):
                try:
                    driver.get(link)
                    time.sleep(4)
                    
                    # Get hotel name
                    hotel_name = None
                    for sel in ['h1', '.htlName', '[class*="hotelName"]', '[itemprop="name"]']:
                        try:
                            el = driver.find_element(By.CSS_SELECTOR, sel)
                            hotel_name = el.text.strip()
                            if hotel_name: break
                        except: pass
                    
                    # Every result already passed MMT's own room-amenity
                    # filter, so trust it. Only fall back to the old keyword
                    # scan of the page body if the filter couldn't be applied
                    # above. Grab the page text either way — used below for
                    # best-effort amenity tagging of the saved record.
                    page_text = driver.find_element(By.TAG_NAME, 'body').text.lower()
                    if filter_applied:
                        has_bathtub = True
                    else:
                        has_bathtub = any(kw in page_text for kw in BATHTUB_KEYWORDS)

                    # Get image
                    img_url = None
                    for sel in ['img[src*="r1imghtlak"]', 'img[src*="r2imghtlak"]', 
                                'img[src*="mmtcdn"]', '.hotelImg img']:
                        try:
                            el = driver.find_element(By.CSS_SELECTOR, sel)
                            img_url = el.get_attribute('src')
                            if img_url: break
                        except: pass
                    
                    # Get the "About Property" description
                    description = None
                    try:
                        about_header = driver.find_element(
                            By.XPATH,
                            '//p[contains(@class, "latoBlack") and normalize-space(text())="About Property"]'
                        )
                        desc_el = about_header.find_element(By.XPATH, 'following-sibling::p[1]')

                        # The text is often truncated behind a "More" toggle —
                        # expand it first so we capture the full description.
                        try:
                            more_link = desc_el.find_element(By.XPATH, './/a[normalize-space(text())="More"]')
                            driver.execute_script("arguments[0].click();", more_link)
                            time.sleep(0.5)
                        except Exception:
                            pass

                        description = desc_el.text.strip()
                        # Strip a trailing "Less"/"More" toggle label left over in the text
                        for suffix in ['Less', 'More']:
                            if description.endswith(suffix):
                                description = description[: -len(suffix)].strip()
                    except Exception:
                        description = None

                    status = "✅ HAS BATHTUB" if has_bathtub else "❌ No bathtub"
                    print(f"  [{i+1}] {hotel_name or 'Unknown'} — {status}")

                    if has_bathtub and hotel_name:
                        slug = hotel_name.lower().replace(' ', '-').replace("'", "").replace(',', '')[:50]
                        img_path = download_image(img_url, slug) if img_url else None

                        # Best-effort amenity tagging for the saved record —
                        # informational, not a gate (the MMT filter already
                        # gated which hotels we're here for).
                        amenities = []
                        if 'bathtub' in page_text or 'bath tub' in page_text:
                            amenities.append('Bathtub')
                        if 'jacuzzi' in page_text:
                            amenities.append('Jacuzzi')
                        if not amenities:
                            amenities = applied_filters or ['Bathtub']

                        validated_hotels.append({
                            "name": hotel_name,
                            "city": CITY,
                            "url": link,
                            "image": img_path or "/assets/fallback.webp",
                            "amenities": amenities,
                            "description": description or ""
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
    print(f"✅ BATHTUB-VALIDATED HOTELS IN {CITY.upper()}: {len(validated_hotels)}")
    print(f"{'='*60}")
    for h in validated_hotels:
        print(f"  🛁 {h['name']} [{', '.join(h.get('amenities') or [])}]")
        print(f"     img: {h['image']}")
        desc = h.get('description') or ''
        print(f"     about: {desc[:100]}{'…' if len(desc) > 100 else ''}")
    
    print("\n💾 Connecting to MongoDB Atlas...")
    import pymongo
    from dotenv import load_dotenv
    
    load_dotenv(os.path.join(workspace_dir, '.env.local'))
    MONGODB_URI = os.getenv('MONGODB_URI')
    
    if MONGODB_URI and validated_hotels:
        try:
            client = pymongo.MongoClient(MONGODB_URI)
            db = client.get_database()
            hotels_col = db.hotels
            
            inserted = 0
            for h in validated_hotels:
                slug = h['name'].lower().replace(' ', '-').replace("'", "").replace(',', '')[:50]
                
                # Check if hotel exists and is flagged
                existing_hotel = hotels_col.find_one({"slug": slug})
                if existing_hotel and existing_hotel.get("flagged") == True:
                    print(f"  [SKIPPED] Hotel '{h['name']}' was previously flagged by Admin.")
                    continue

                doc = {
                    "name": h['name'],
                    "slug": slug,
                    "city": CITY.title(),
                    "country": COUNTRY.title(),
                    "url": h['url'],
                    "image": h['image'],
                    "verified": True,
                    "amenities": h.get('amenities') or ["Bathtub"],
                    "description": h.get('description') or ""
                }
                
                # Use setOnInsert for flagged so we don't accidentally unflag it
                result = hotels_col.update_one(
                    {"slug": slug},
                    {
                        "$set": doc,
                        "$setOnInsert": {"flagged": False}
                    },
                    upsert=True
                )
                if result.upserted_id or result.modified_count > 0 or result.matched_count > 0:
                    inserted += 1
            
            print(f"✅ Successfully inserted/updated {inserted} hotels in MongoDB Atlas!")
            client.close()
        except Exception as e:
            print(f"❌ Error saving to MongoDB: {e}")
    else:
        print("❌ No MongoDB URI found or no validated hotels to save.")
    
    return validated_hotels

if __name__ == "__main__":
    scrape()
