"""
MMT Full Search Flow Script
=============================
Instead of jumping directly to the listing URL (which returns SINGULARITY error),
this script performs the FULL search flow:
1. Opens makemytrip.com homepage
2. Closes any popups
3. Types the city name in the search box
4. Selects dates
5. Clicks Search
6. Intercepts the search-hotels API response that fires after the real search

This mimics exactly what a real user does, bypassing the SINGULARITY error.

Usage:
    python3 mmt_search_flow.py

Watch the browser window — interact if needed (close popups manually).
"""

import asyncio
from playwright.async_api import async_playwright
import json
import os
from datetime import datetime, timedelta

workspace_dir = '/Users/karanarora/hotelswithbathtubs'

CITY_SEARCH = "Udaipur"
checkin_date = datetime.now() + timedelta(days=3)
checkout_date = datetime.now() + timedelta(days=4)

captured_hotel_responses = []

async def run():
    print("🚀 MMT Full Search Flow Starting...")
    print(f"Will search for: {CITY_SEARCH}")
    print(f"Dates: {checkin_date.strftime('%d %b %Y')} → {checkout_date.strftime('%d %b %Y')}\n")

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=False,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--start-maximized",
            ]
        )

        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
            viewport={"width": 1440, "height": 900},
            locale="en-IN",
        )
        await context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        """)

        page = await context.new_page()

        # Intercept hotel search API responses
        async def on_response(response):
            url = response.url
            if "search-hotels" in url and "mapi.makemytrip.com" in url:
                try:
                    data = await response.json()
                    captured_hotel_responses.append({"url": url, "data": data})
                    hotels_found = data.get("data", {}).get("body", {}).get("hotels", [])
                    if hotels_found:
                        print(f"\n  🏨 SUCCESS! Found {len(hotels_found)} hotels in API response!")
                    else:
                        print(f"\n  📡 search-hotels API hit: {url[:80]}")
                        print(f"     Response keys: {list(data.keys())}")
                except Exception as e:
                    print(f"  ⚠️  Failed to parse search-hotels response: {e}")

        page.on("response", on_response)

        # Step 1: Go to MMT Hotels homepage
        print("Step 1: Opening MMT Hotels page...")
        await page.goto("https://www.makemytrip.com/hotels/", wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(4000)

        # Step 2: Close any login popup
        print("Step 2: Closing any popups...")
        try:
            close_btn = page.locator(".modalContainer .close, .commonModal .close, [data-cy='closeButton'], .font28.latoBlack.rib").first
            if await close_btn.count() > 0:
                await close_btn.click()
                print("  ✅ Closed popup")
        except:
            print("  No popup found (OK)")
        await page.wait_for_timeout(1000)

        # Also try pressing Escape to close popups
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(1000)

        # Step 3: Click the city search box and type the city
        print(f"Step 3: Searching for {CITY_SEARCH}...")
        try:
            # MMT's city input
            city_input = page.locator("input[placeholder*='city'], input[placeholder*='City'], input[placeholder*='CITY'], #city").first
            await city_input.click()
            await page.wait_for_timeout(1000)
            await city_input.fill("")
            await city_input.type(CITY_SEARCH, delay=100)
            await page.wait_for_timeout(2000)
            
            # Select the first autocomplete suggestion
            suggestion = page.locator(".autoSuggestList li, .autoSuggest li, [class*='suggest'] li").first
            if await suggestion.count() > 0:
                suggestion_text = await suggestion.inner_text()
                print(f"  Selecting suggestion: {suggestion_text.strip()[:50]}")
                await suggestion.click()
            else:
                print("  No autocomplete shown, pressing Enter...")
                await page.keyboard.press("Enter")
        except Exception as e:
            print(f"  City search error: {e}")
            print("  Please manually enter the city in the browser!")

        await page.wait_for_timeout(2000)

        # Step 4: Click Search button
        print("Step 4: Clicking Search...")
        try:
            search_btn = page.locator("button:has-text('Search'), a:has-text('Search'), [class*='search'][class*='btn'], #hsw_search_button").first
            await search_btn.click()
            print("  ✅ Clicked Search button")
        except Exception as e:
            print(f"  Search button error: {e}")
            print("  Please click the Search button manually in the browser!")

        # Step 5: Wait for results to load and API to fire
        print("\nStep 5: Waiting for hotel results to load (30 seconds)...")
        print("Watch the browser — hotels should start appearing!")
        for i in range(6):
            await page.wait_for_timeout(5000)
            print(f"  Waiting... {(i+1)*5}/30 seconds")
            if captured_hotel_responses:
                print(f"  🎯 {len(captured_hotel_responses)} hotel API responses captured so far!")

        # Scroll to trigger more loads
        print("\nScrolling to load more hotels...")
        for i in range(5):
            await page.evaluate(f"window.scrollTo(0, {i * 600})")
            await page.wait_for_timeout(1000)

        await page.wait_for_timeout(5000)

        # Save screenshot
        screenshot_path = os.path.join(workspace_dir, 'mmt_screenshot.png')
        await page.screenshot(path=screenshot_path, full_page=False)
        print(f"\n✅ Screenshot: {screenshot_path}")

        # Save captured data
        out_path = os.path.join(workspace_dir, 'mmt_hotels_raw.json')
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(captured_hotel_responses, f, indent=2)
        print(f"✅ Raw hotel data: {out_path}")
        print(f"   Total search-hotel API responses: {len(captured_hotel_responses)}")

        # Try to extract and display hotel names
        if captured_hotel_responses:
            print("\n📋 Hotels found in API:")
            for resp in captured_hotel_responses:
                try:
                    hotels = resp['data'].get('data', {}).get('body', {}).get('hotels', [])
                    for h in hotels[:10]:
                        name = h.get('hotelName', h.get('displayName', h.get('name', '???')))
                        rating = h.get('starRating', h.get('rating', ''))
                        price = h.get('minPrice', h.get('price', ''))
                        print(f"  🏨 {name} | ⭐ {rating} | ₹{price}")
                except:
                    pass

        print(f"\n{'='*60}")
        print("Press ENTER to close browser...")
        print(f"{'='*60}")
        input()
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
