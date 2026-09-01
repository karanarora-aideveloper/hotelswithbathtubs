"""
Stealth Ratings Scraper using undetected-chromedriver and pymongo
==================================================================
Runs undetected Chrome to visit Agoda/MMT/Booking.com specific URLs 
and update the MongoDB record with actual ratings and reviews count.
"""

import os
import sys
import time
import re
from pymongo import MongoClient
from dotenv import load_dotenv

workspace_dir = '/Users/karanarora/hotelswithbathtubs'
load_dotenv(os.path.join(workspace_dir, '.env.local'))
MONGODB_URI = os.getenv('MONGODB_URI')

if not MONGODB_URI:
    print("❌ MONGODB_URI not found in .env.local")
    sys.exit(1)

try:
    import undetected_chromedriver as uc
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
except ImportError:
    print("Please install selenium and undetected-chromedriver: pip3 install undetected-chromedriver selenium --break-system-packages")
    sys.exit(1)

def parse_rating_text(text):
    """
    Parses score and reviews count from text like:
    "Property's review score 7.9 out of 10 Very good 216 reviews\n7.9\nVery good\n\n216 reviews..."
    """
    if not text:
        return None, None
    
    # Try splitting by lines first (Agoda innerText usually has lines)
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    
    rating = None
    reviews_count = None
    
    # Simple direct line extraction for Agoda
    for line in lines:
        # Check if line is a single decimal number (e.g. "7.9" or "8.4")
        if re.match(r'^\d+(\.\d+)?$', line):
            val = float(line)
            if 0 <= val <= 10:
                rating = val
        # Check if line is "XYZ reviews"
        elif 'review' in line.lower():
            digits = re.findall(r'\d+', line)
            if digits:
                reviews_count = int(digits[0])
                
    # Regex fallback if line parsing wasn't fully successful
    if rating is None:
        score_match = re.search(r'score\s*([\d\.]+)', text, re.IGNORECASE)
        if score_match:
            rating = float(score_match.group(1))
            
    if reviews_count is None:
        reviews_match = re.search(r'([\d,]+)\s*reviews', text, re.IGNORECASE)
        if reviews_match:
            reviews_count = int(reviews_match.group(1).replace(',', ''))
            
    return rating, reviews_count

def scrape_ratings():
    client = MongoClient(MONGODB_URI)
    db = client.get_database()
    hotels_col = db.hotels
    
    # Fetch active hotels that have specific URLs and don't have ratings yet
    query = {
        "flagged": {"$ne": True},
        "$or": [
            {"rating": {"$exists": False}},
            {"rating": None}
        ]
    }
    
    hotels = list(hotels_col.find(query))
    print(f"🔎 Found {len(hotels)} hotels with missing ratings in DB.")
    
    if not hotels:
        print("✅ All hotels already have ratings.")
        client.close()
        return

    print("Launching undetected Chrome...")
    if not hasattr(uc.ChromeOptions, 'headless'):
        uc.ChromeOptions.headless = property(lambda self: False)

    options = uc.ChromeOptions()
    options.add_argument('--window-size=1440,900')
    driver = uc.Chrome(options=options, version_main=151)
    time.sleep(2)
    
    try:
        # Switch to correct window if multiple open
        handles = driver.window_handles
        if handles:
            driver.switch_to.window(handles[-1])
            
        success_count = 0
        
        # Scrape a limited batch of up to 10 hotels for verification
        batch_limit = 10
        hotels_to_scrape = hotels[:batch_limit]
        print(f"⚡ Starting scrape process for a batch of {len(hotels_to_scrape)} hotels...")

        for idx, h in enumerate(hotels_to_scrape):
            # Prefer Agoda, then Booking.com, then specific MMT link
            url = h.get('agodaUrl') or h.get('bookingUrl') or h.get('url')
            
            # Skip if URL is generic search/listing page
            if not url or 'hotel-listing' in url or 'searchresults.html' in url:
                print(f"  [{idx+1}/{len(hotels_to_scrape)}] Skipping {h['name']} - only has generic URL.")
                continue
                
            print(f"  [{idx+1}/{len(hotels_to_scrape)}] Loading page for {h['name']}...")
            try:
                driver.get(url)
                time.sleep(8) # Let Javascript and SPA hydration complete

                # Retrieve review score block
                score_text = None
                selectors = [
                    '[data-element-name="review-score"]',
                    'span[class*="Review-comment-score"]',
                    '.Review-comment-score',
                    '[data-testid="review-score-link"]',
                    '.ovrlRating__rating',
                    '.htlRating'
                ]
                
                for sel in selectors:
                    try:
                        el = driver.find_element(By.CSS_SELECTOR, sel)
                        score_text = el.text
                        if score_text and len(score_text.strip()) > 0:
                            break
                    except:
                        pass
                
                if not score_text:
                    # Fallback to in-page body search
                    body_text = driver.find_element(By.TAG_NAME, 'body').text.lower()
                    if 'cloudflare' in body_text or 'challenge' in body_text or 'waf' in body_text:
                        print("    ⚠️ Blocked by WAF/CAPTCHA challenge page.")
                        time.sleep(10) # Cooling down
                        continue
                
                rating, reviews_count = parse_rating_text(score_text)
                
                # MakeMyTrip specific review count retrieval
                if 'makemytrip.com' in url and rating is not None:
                    try:
                        count_el = driver.find_element(By.CSS_SELECTOR, '.ovrlRating__subTitle')
                        count_text = count_el.text
                        # Extract digits from "67 Ratings"
                        digits = re.findall(r'\d+', count_text)
                        if digits:
                            reviews_count = int(digits[0])
                    except:
                        pass
                
                if rating is not None:
                    scale = 5 if 'makemytrip.com' in url else 10
                    print(f"    ✨ Rating parsed: {rating} out of {scale} ({reviews_count or 0} reviews)")
                    
                    # Update document in MongoDB
                    hotels_col.update_one(
                        {"_id": h["_id"]},
                        {"$set": {
                            "rating": rating,
                            "reviewsCount": reviews_count or 0
                        }}
                    )
                    success_count += 1
                else:
                    print(f"    ❌ Could not parse rating from text: {repr(score_text)[:150]}")
                    
            except Exception as page_ex:
                print(f"    ❌ Page load/scrape error: {str(page_ex)[:100]}")
                
            time.sleep(3) # Throttle requests
            
        print(f"\n🎉 Scrape Batch Complete! Successfully updated {success_count} hotels in MongoDB.")
        
    finally:
        driver.quit()
        client.close()

if __name__ == "__main__":
    scrape_ratings()
