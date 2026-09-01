"""
MMT Smart Scraper - v3
========================
Fixed approach:
1. Dismisses login popup using JS (the ✕ button)
2. Uses JS force-click to interact with the city input (bypasses overlay)
3. Intercepts the search-hotels API to capture raw JSON hotel data

Usage:
    python3 mmt_smart.py
"""

import asyncio
from playwright.async_api import async_playwright
import json
import os
from datetime import datetime, timedelta

workspace_dir = '/Users/karanarora/hotelswithbathtubs'

captured_hotel_responses = []

async def run():
    print("🚀 MMT Smart Scraper v3")

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
        await context.add_init_script("Object.defineProperty(navigator, 'webdriver', { get: () => undefined });")

        page = await context.new_page()

        # Intercept hotel search API
        async def on_response(response):
            if "search-hotels" in response.url and "mapi.makemytrip.com" in response.url:
                try:
                    data = await response.json()
                    captured_hotel_responses.append({"url": response.url, "data": data})
                    print(f"\n  🏨 search-hotels API captured!")
                    # Try to show how many hotels
                    hotels = []
                    try:
                        hotels = data['data']['body']['hotels']
                    except: pass
                    try:
                        hotels = data['searchResult']['hotels'] if not hotels else hotels
                    except: pass
                    print(f"  Hotels in response: {len(hotels)}")
                    if hotels:
                        for h in hotels[:5]:
                            name = (h.get('hotelName') or h.get('displayName') or h.get('name', '???'))
                            print(f"    - {name}")
                except Exception as e:
                    print(f"  API parse error: {e}")

        page.on("response", on_response)

        # Navigate to MMT hotels page
        print("Step 1: Opening MMT hotels page...")
        await page.goto("https://www.makemytrip.com/hotels/", wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(3000)

        # CLOSE LOGIN POPUP using JavaScript
        print("Step 2: Dismissing login popup via JS...")
        await page.evaluate("""() => {
            // Try multiple close button selectors
            const selectors = [
                '.modalContainer .close',
                '.commonModal .close', 
                '[data-cy="closeButton"]',
                '.rib-icon-close',
                '.font28.latoBlack',
                'span[class*="close"]',
                'button[class*="close"]',
                '.rib',
            ];
            for (const sel of selectors) {
                const el = document.querySelector(sel);
                if (el) { el.click(); break; }
            }
            // Remove overlay modals from DOM
            const modals = document.querySelectorAll('[class*="modal"], [class*="Modal"], [class*="overlay"], [class*="Overlay"]');
            modals.forEach(m => { 
                if (m.style) m.style.display = 'none'; 
            });
        }""")
        await page.wait_for_timeout(1000)
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(1000)

        # Use JS to click and interact with the city input
        print("Step 3: Clicking city input via JS...")
        clicked = await page.evaluate("""() => {
            const input = document.querySelector('#city, input[data-cy="city"]');
            if (input) {
                input.scrollIntoView();
                input.click();
                input.focus();
                return true;
            }
            return false;
        }""")
        print(f"  City input clicked: {clicked}")
        await page.wait_for_timeout(1000)

        # Type city name
        print("Step 4: Typing 'Udaipur'...")
        await page.keyboard.type("Udaipur", delay=80)
        await page.wait_for_timeout(2500)

        # Take screenshot to see state
        await page.screenshot(path=os.path.join(workspace_dir, 'mmt_step4.png'))

        # Click first autocomplete suggestion via JS
        print("Step 5: Selecting autocomplete suggestion...")
        selected = await page.evaluate("""() => {
            // Look for autocomplete dropdown items
            const selectors = [
                'li[class*="suggest"]',
                '.autoSuggestList li', 
                '.autoSuggest li',
                '[class*="suggestionItem"]',
                '[class*="autoSuggest"] li',
                'ul[class*="suggest"] li',
            ];
            for (const sel of selectors) {
                const items = document.querySelectorAll(sel);
                if (items.length > 0) {
                    items[0].click();
                    return items[0].textContent.trim().substring(0, 60);
                }
            }
            // Last resort: look for any li containing 'Udaipur'
            const allLi = document.querySelectorAll('li');
            for (const li of allLi) {
                if (li.textContent.includes('Udaipur') && li.offsetParent) {
                    li.click();
                    return 'Found: ' + li.textContent.trim().substring(0, 60);
                }
            }
            return null;
        }""")
        print(f"  Selected: {selected}")
        await page.wait_for_timeout(1500)

        # Click search button via JS
        print("Step 6: Clicking Search via JS...")
        searched = await page.evaluate("""() => {
            const btn = document.querySelector('#hsw_search_button, button[data-cy="submit"]');
            if (btn) {
                btn.click();
                return true;
            }
            return false;
        }""")
        print(f"  Search clicked: {searched}")

        # Wait for results
        print("\nStep 7: Waiting 40 seconds for hotel results...")
        print("Watch the browser window - hotels should load!")
        for i in range(8):
            await page.wait_for_timeout(5000)
            remaining = (8 - i - 1) * 5
            print(f"  {(i+1)*5}/40s | API responses: {len(captured_hotel_responses)} | Waiting {remaining}s more...")
            if len(captured_hotel_responses) >= 2:
                print("  ✅ Enough data captured!")
                break

        # Final screenshot
        await page.screenshot(path=os.path.join(workspace_dir, 'mmt_screenshot.png'), full_page=False)

        # Save data
        out_path = os.path.join(workspace_dir, 'mmt_hotels_raw.json')
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(captured_hotel_responses, f, indent=2)

        print(f"\n✅ Data saved to: {out_path}")
        print(f"   Hotel API responses: {len(captured_hotel_responses)}")

        print("\nPress ENTER to close browser...")
        input()
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
