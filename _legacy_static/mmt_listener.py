"""
MMT Passive Listener - Human Assisted
=======================================
The SIMPLEST and most reliable approach:

1. Opens a Chrome browser to MakeMyTrip hotels page
2. YOU manually search for any city (close popups, type city, search)
3. This script silently captures the hotel data API in the background
4. Once hotels are visible, press ENTER and all hotel data is saved

This bypasses ALL anti-bot protections because a real human is doing the searching!

Usage:
    python3 mmt_listener.py
"""

import asyncio
from playwright.async_api import async_playwright
import json
import os

workspace_dir = '/Users/karanarora/hotelswithbathtubs'
all_hotel_data = []

async def run():
    print("=" * 60)
    print("🎯 MMT PASSIVE LISTENER - Human Assisted Mode")
    print("=" * 60)
    print()
    print("I will open MakeMyTrip in a browser.")
    print("YOU do the searching - I just capture the data!")
    print()
    print("Steps for YOU to follow in the browser:")
    print("  1. Close any login popup (click the ✕ button)")
    print("  2. Type a city name in the search box (e.g. Udaipur)")
    print("  3. Select from autocomplete dropdown")
    print("  4. Click Search button")
    print("  5. Wait for hotels to appear")
    print("  6. Scroll down a bit to load more hotels")
    print("  7. Come back here and press ENTER")
    print()
    print("Starting browser...")
    print()

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=False,
            args=["--disable-blink-features=AutomationControlled", "--no-sandbox", "--start-maximized"]
        )
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
            viewport={"width": 1440, "height": 900},
            locale="en-IN",
        )
        await context.add_init_script(
            "Object.defineProperty(navigator, 'webdriver', { get: () => undefined });"
        )
        page = await context.new_page()

        # ------ Passive API interceptor ------
        async def on_response(response):
            url = response.url
            # Capture hotel search results
            if "search-hotels" in url and "mapi.makemytrip.com" in url:
                try:
                    data = await response.json()
                    all_hotel_data.append({"url": url, "data": data})

                    # Try to extract hotel names from multiple possible structures
                    hotels = []
                    try: hotels = data['data']['body']['hotels']
                    except: pass
                    try: hotels = data.get('searchResult', {}).get('hotels', []) if not hotels else hotels
                    except: pass
                    try: hotels = data.get('htlData', {}).get('htlList', []) if not hotels else hotels
                    except: pass

                    print(f"\n  🏨 HOTEL API CAPTURED! ({len(hotels)} hotels found)")
                    for h in hotels[:8]:
                        name = (h.get('hotelName') or h.get('displayName') or
                                h.get('name') or h.get('htlNm') or '???')
                        rating = h.get('starRating') or h.get('rating') or h.get('starRtng', '')
                        img = (h.get('hotelImgUrl') or h.get('thumbnail') or
                               h.get('imgUrl') or h.get('img', ''))
                        print(f"    ⭐{rating} | {name}")
                        if img:
                            print(f"         img: {str(img)[:80]}")
                    print()
                    print("  (Captured! You can search more cities or press ENTER to save)")
                except Exception as e:
                    all_hotel_data.append({"url": url, "error": str(e)})

        page.on("response", on_response)

        # Navigate to MMT
        print("Opening https://www.makemytrip.com/hotels/ ...")
        await page.goto("https://www.makemytrip.com/hotels/", wait_until="domcontentloaded", timeout=60000)

        print("\n✅ Browser is open! Follow the steps above.")
        print("   (Listening for hotel API responses in the background...)")
        print()
        print("Press ENTER here when you're done searching and hotels are visible.")
        input()

        # Take final screenshot
        await page.screenshot(path=os.path.join(workspace_dir, 'mmt_screenshot.png'), full_page=False)
        print("✅ Screenshot saved!")

        # Also capture current page HTML
        html = await page.content()
        with open(os.path.join(workspace_dir, 'mmt_page.html'), 'w', encoding='utf-8') as f:
            f.write(html)

        await browser.close()

    # ---- Save all captured data ----
    print("\n" + "=" * 60)
    print("📊 RESULTS SUMMARY")
    print("=" * 60)
    print(f"Total hotel API responses captured: {len(all_hotel_data)}")

    if all_hotel_data:
        out_path = os.path.join(workspace_dir, 'mmt_hotels_raw.json')
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(all_hotel_data, f, indent=2, ensure_ascii=False)
        print(f"✅ Full data saved to: {out_path}")

        # Print all unique hotels found
        print("\n🏨 ALL HOTELS CAPTURED:")
        seen = set()
        for resp in all_hotel_data:
            try:
                hotels = []
                try: hotels = resp['data']['data']['body']['hotels']
                except: pass
                try: hotels = resp['data'].get('searchResult', {}).get('hotels', []) or hotels
                except: pass
                try: hotels = resp['data'].get('htlData', {}).get('htlList', []) or hotels
                except: pass

                for h in hotels:
                    name = (h.get('hotelName') or h.get('displayName') or
                            h.get('name') or h.get('htlNm', '???'))
                    if name not in seen:
                        seen.add(name)
                        rating = h.get('starRating') or h.get('rating') or h.get('starRtng', '?')
                        img = (h.get('hotelImgUrl') or h.get('thumbnail') or h.get('imgUrl', ''))
                        print(f"  {name} | ⭐{rating} | img: {str(img)[:60]}")
            except:
                pass
        print(f"\n  Total unique hotels: {len(seen)}")
    else:
        print("⚠️  No hotel API data was captured.")
        print("   Make sure you searched for a city and saw hotel cards appear!")

if __name__ == "__main__":
    asyncio.run(run())
