"""
MMT (MakeMyTrip) Explorer Script
=================================
This script uses Playwright to open a VISIBLE Chrome browser window
so you can see exactly what's happening. It:
1. Navigates to MakeMyTrip hotels page for a given city
2. Scrolls and waits for content to load
3. Saves a full-page screenshot
4. Dumps the raw HTML for DOM analysis
5. Tries to extract hotel names, ratings, and images

Usage:
    python3 mmt_explore.py

The script will open a VISIBLE (non-headless) Chrome window.
You can interact with it manually if a CAPTCHA appears.
"""

import asyncio
from playwright.async_api import async_playwright
import json
import os
from datetime import datetime, timedelta

workspace_dir = '/Users/karanarora/hotelswithbathtubs'

# ============================================================
# CONFIGURATION - Change these to explore different things
# ============================================================
CITY = "Udaipur"

# MMT requires proper checkin/checkout dates and the city code
checkin = (datetime.now() + timedelta(days=5)).strftime("%m%d%Y")
checkout = (datetime.now() + timedelta(days=6)).strftime("%m%d%Y")

# This is the correct URL format MMT uses for hotel listing with search results
MMT_URL = f"https://www.makemytrip.com/hotels/hotel-listing/?checkin={checkin}&checkout={checkout}&city=UDAIPUR&country=IN&roomCount=1&adultsCount=2&searchText=Udaipur%2C+Rajasthan%2C+India&type=city"

HEADLESS = False  # Set False so we can see the browser window
PAUSE_SECONDS = 25  # Wait longer for React to render the hotel cards
# ============================================================

async def explore_mmt():
    print(f"Opening browser for {CITY}...")
    print(f"URL: {MMT_URL}")
    print(f"Browser will be VISIBLE - watch it!")
    print(f"Waiting {PAUSE_SECONDS} seconds for page to fully load...")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=HEADLESS,
            # Makes it harder for bot detection to flag us
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-infobars",
                "--start-maximized",
            ]
        )
        
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
            viewport={"width": 1440, "height": 900},
            locale="en-IN",
            geolocation={"longitude": 73.8567, "latitude": 18.5204}, # Pune, India coordinates
            permissions=["geolocation"],
        )
        
        # Remove webdriver property to avoid bot detection
        await context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
        """)
        
        page = await context.new_page()
        
        print(f"\n{'='*60}")
        print(f"Navigating to MMT...")
        print(f"{'='*60}")
        
        try:
            await page.goto(MMT_URL, wait_until="domcontentloaded", timeout=60000)
        except Exception as e:
            print(f"Initial navigation error (may be OK): {e}")
        
        # Wait for initial load
        print(f"Waiting 8 seconds for initial render...")
        print("(If you see a CAPTCHA in the browser window, solve it now!)")
        await page.wait_for_timeout(8000)
        
        # Scroll down to trigger React lazy-loading of hotel cards
        print("Scrolling page to trigger lazy-loading...")
        for i in range(8):
            await page.evaluate(f"window.scrollTo(0, {i * 400})")
            await page.wait_for_timeout(600)
        await page.evaluate("window.scrollTo(0, 0)")  # Scroll back to top
        
        # Wait more for the data to populate
        print(f"Waiting {PAUSE_SECONDS - 8} more seconds for hotel data to render...")
        await page.wait_for_timeout((PAUSE_SECONDS - 8) * 1000)
        
        # Check if we're blocked
        html = await page.content()
        if "Access Denied" in html or "Verify you are human" in html:
            print("\n⚠️  BOT DETECTION TRIGGERED!")
            print("Please solve the CAPTCHA in the browser window.")
            print("After solving it, press ENTER here to continue...")
            input()
            html = await page.content()
        
        # Take a screenshot
        screenshot_path = os.path.join(workspace_dir, 'mmt_screenshot.png')
        await page.screenshot(path=screenshot_path, full_page=True)
        print(f"\n✅ Screenshot saved to: {screenshot_path}")
        
        # Save raw HTML for DOM analysis
        html_path = os.path.join(workspace_dir, 'mmt_page.html')
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"✅ Raw HTML saved to: {html_path}")
        
        # ============================================================
        # SELECTOR EXPLORATION - Try multiple known MMT class patterns
        # ============================================================
        print(f"\n{'='*60}")
        print("Exploring page structure...")
        print(f"{'='*60}")
        
        # MMT uses React, so class names can be hashed. Try text-based selectors first.
        selectors_to_try = {
            "Hotel Cards": [
                "li.listingRow",
                "._Hlisting li",
                ".listingRowOuter",
                "[data-index]",
                "[class*='listingRow']",
                "[class*='hotelCard']",
                "article",
            ],
            "Hotel Names": [
                ".htlNme",
                "p.htlNme",
                "[class*='htlNme']",
                "[class*='hotelName']",
                "[class*='propertyName']",
                ".latoBlack.font16",
            ],
            "Images": [
                ".htlThumb img",
                "[class*='listingThumb'] img",
                "img[src*='r1imghtlak.mmtcdn.com']",
                "img[src*='r2imghtlak.mmtcdn.com']",
                ".imgWrap img",
            ],
            "Ratings": [
                "[class*='ratingSection']",
                "[class*='starRating']",
                ".latoBold.font10.whiteText",
                "[class*='rating']",
            ],
            "Prices": [
                "[class*='priceSection']",
                "[class*='actualPrice']",
                "[class*='price']",
                ".latoBlack.font16.blackText",
            ]
        }
        
        results = {}
        for element_type, selectors in selectors_to_try.items():
            found = False
            for selector in selectors:
                try:
                    elements = await page.query_selector_all(selector)
                    if elements:
                        count = len(elements)
                        print(f"  ✅ {element_type}: '{selector}' → {count} elements found")
                        results[element_type] = {"selector": selector, "count": count}
                        
                        # Try to extract text from the first few
                        if element_type == "Hotel Names":
                            for i, el in enumerate(elements[:5]):
                                text = await el.inner_text()
                                print(f"     Hotel {i+1}: {text.strip()}")
                        
                        found = True
                        break
                except:
                    pass
            
            if not found:
                print(f"  ❌ {element_type}: No working selector found")
        
        # ============================================================
        # ALSO CHECK PAGE TITLE AND VISIBLE TEXT
        # ============================================================
        title = await page.title()
        print(f"\n📄 Page Title: {title}")
        
        # Check if hotel content is actually visible
        body_text = await page.inner_text("body")
        hotel_keywords = ["hotel", "bathtub", "jacuzzi", "star", "₹", "night"]
        found_keywords = [kw for kw in hotel_keywords if kw.lower() in body_text.lower()]
        print(f"\n🔍 Keywords found on page: {found_keywords}")
        
        # Save results
        results_path = os.path.join(workspace_dir, 'mmt_selectors.json')
        with open(results_path, 'w') as f:
            json.dump(results, f, indent=4)
        print(f"\n✅ Selector results saved to: {results_path}")
        
        print(f"\n{'='*60}")
        print("Exploration complete! Press ENTER to close the browser.")
        print(f"{'='*60}")
        input()
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(explore_mmt())
