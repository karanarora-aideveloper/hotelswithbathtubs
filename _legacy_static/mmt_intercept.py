"""
MMT Network Interceptor Script
================================
This script opens a visible Chrome browser on MakeMyTrip,
intercepts ALL network requests made by the page, and
specifically captures the hotel-data API calls to mapi.makemytrip.com.

This lets us:
1. See the exact API endpoints MMT uses
2. Capture the full JSON response with hotel names, images, ratings, prices
3. Replay those API calls without needing a browser at all

Usage:
    python3 mmt_intercept.py

Watch the browser window - when hotels load, press ENTER in terminal.
"""

import asyncio
from playwright.async_api import async_playwright
import json
import os
from datetime import datetime, timedelta

workspace_dir = '/Users/karanarora/hotelswithbathtubs'

# Use dates 7 days from now
checkin = (datetime.now() + timedelta(days=7)).strftime("%m%d%Y")
checkout = (datetime.now() + timedelta(days=8)).strftime("%m%d%Y")

# Try a simpler URL without extra params that might trigger "all filtered out"
MMT_URL = f"https://www.makemytrip.com/hotels/hotel-listing/?checkin={checkin}&checkout={checkout}&city=UDAIPUR&country=IN&roomCount=1&adultsCount=2"

captured_requests = []
hotel_data = []

async def intercept():
    print("🚀 Starting MMT Network Interceptor...")
    print(f"URL: {MMT_URL}")
    print("A VISIBLE browser window will open. Watch for hotels to load!\n")

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

        # ============================================================
        # INTERCEPT ALL RESPONSES
        # ============================================================
        async def handle_response(response):
            url = response.url
            # Capture any API calls that look like hotel data
            if "mapi.makemytrip.com" in url or "hotel" in url.lower():
                try:
                    content_type = response.headers.get("content-type", "")
                    if "json" in content_type:
                        body = await response.json()
                        captured_requests.append({
                            "url": url,
                            "status": response.status,
                            "data": body
                        })
                        print(f"  📡 Captured API: {url[:100]}")
                        
                        # Try to extract hotel names from any format
                        body_str = json.dumps(body)
                        if any(kw in body_str.lower() for kw in ["hotelname", "hotel_name", "name", "htlnm"]):
                            hotel_data.append({"url": url, "data": body})
                            print(f"  ✅ Potential hotel data found!")
                except Exception as e:
                    pass  # Skip non-JSON or failed responses

        page.on("response", handle_response)

        print(f"Navigating to MMT...")
        try:
            await page.goto(MMT_URL, wait_until="domcontentloaded", timeout=60000)
        except Exception as e:
            print(f"Navigation note: {e}")

        print("Waiting 10 seconds for initial render...")
        await page.wait_for_timeout(10000)

        # Scroll to trigger lazy-loading
        print("Scrolling to trigger hotel card loading...")
        for i in range(10):
            await page.evaluate(f"window.scrollTo(0, {i * 500})")
            await page.wait_for_timeout(800)
        await page.evaluate("window.scrollTo(0, 0)")

        print("\nWaiting 15 more seconds for all API responses...")
        await page.wait_for_timeout(15000)

        # Save screenshot
        screenshot_path = os.path.join(workspace_dir, 'mmt_screenshot.png')
        await page.screenshot(path=screenshot_path, full_page=True)
        print(f"\n✅ Screenshot saved: {screenshot_path}")

        # Save all captured network requests
        requests_path = os.path.join(workspace_dir, 'mmt_api_requests.json')
        with open(requests_path, 'w', encoding='utf-8') as f:
            json.dump(captured_requests, f, indent=2)
        print(f"✅ All captured API requests saved: {requests_path}")
        print(f"   Total API calls captured: {len(captured_requests)}")

        # Save just the hotel data
        if hotel_data:
            hotel_path = os.path.join(workspace_dir, 'mmt_hotel_data.json')
            with open(hotel_path, 'w', encoding='utf-8') as f:
                json.dump(hotel_data, f, indent=2)
            print(f"✅ Hotel-specific data saved: {hotel_path}")
            print(f"   Hotel API responses captured: {len(hotel_data)}")
        else:
            print("⚠️  No hotel-specific JSON data captured yet.")
            print("   This may mean the API calls use non-JSON format or were blocked.")

        # Also dump the current page HTML
        html = await page.content()
        html_path = os.path.join(workspace_dir, 'mmt_page.html')
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"✅ Page HTML saved: {html_path}")

        print(f"\n{'='*60}")
        print("Press ENTER to close the browser...")
        print(f"{'='*60}")
        input()

        await browser.close()

    print("\n📋 Summary:")
    print(f"  Total API calls intercepted: {len(captured_requests)}")
    print(f"  Hotel data responses: {len(hotel_data)}")
    print(f"\nCheck mmt_api_requests.json for the full API call list!")

if __name__ == "__main__":
    asyncio.run(intercept())
