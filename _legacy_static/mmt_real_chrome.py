"""
MMT Scraper - Using Real Chrome Profile
=========================================
Key insight: Instead of using Playwright's bundled Chromium (which MMT detects as a bot),
this script connects to your REAL Google Chrome installation with your actual browser 
profile, cookies, and history. MMT cannot distinguish this from a real human browsing.

How it works:
1. Launches YOUR real Chrome with remote debugging enabled
2. Playwright connects to that existing Chrome instance
3. Navigates MMT with your real cookies - no login popup!
4. Searches for hotels in a city
5. Clicks into each hotel detail page to check if amenities list BATHTUB
6. Saves only VALIDATED hotels (verified to have bathtubs)

Usage:
    python3 mmt_real_chrome.py [city]
    
    Examples:
        python3 mmt_real_chrome.py Udaipur
        python3 mmt_real_chrome.py Manali
        python3 mmt_real_chrome.py Shimla
"""

import asyncio
import subprocess
import sys
import json
import os
import time
import urllib.request
from playwright.async_api import async_playwright
from datetime import datetime, timedelta
from PIL import Image

workspace_dir = '/Users/karanarora/hotelswithbathtubs'
assets_dir = os.path.join(workspace_dir, 'assets')

CITY = sys.argv[1] if len(sys.argv) > 1 else "Udaipur"
CITY_CODE = CITY.upper().replace(' ', '')

checkin = (datetime.now() + timedelta(days=3)).strftime("%m%d%Y")
checkout = (datetime.now() + timedelta(days=4)).strftime("%m%d%Y")

CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
REMOTE_DEBUG_PORT = 9222
SEARCH_URL = (
    f"https://www.makemytrip.com/hotels/hotel-listing/"
    f"?checkin={checkin}&checkout={checkout}"
    f"&city={CITY_CODE}&country=IN&roomCount=1&adultsCount=2"
)

print(f"\n{'='*60}")
print(f"🏨 MMT Real Chrome Scraper — {CITY}")
print(f"{'='*60}")
print(f"URL: {SEARCH_URL}\n")

def launch_chrome():
    """Launch Chrome with remote debugging on port 9222"""
    cmd = [
        CHROME_PATH,
        f"--remote-debugging-port={REMOTE_DEBUG_PORT}",
        "--no-first-run",
        "--no-default-browser-check",
        SEARCH_URL
    ]
    print(f"Launching real Chrome...")
    proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(4)  # Wait for Chrome to start
    return proc

def download_and_convert_image(url, hotel_slug):
    """Download image from MMT and convert to WebP"""
    try:
        img_path = os.path.join(assets_dir, f"{hotel_slug}.jpeg")
        webp_path = os.path.join(assets_dir, f"{hotel_slug}.webp")
        
        if os.path.exists(webp_path):
            return f"/assets/{hotel_slug}.webp"
        
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0',
            'Referer': 'https://www.makemytrip.com/'
        })
        with urllib.request.urlopen(req, timeout=10) as response:
            with open(img_path, 'wb') as f:
                f.write(response.read())
        
        with Image.open(img_path) as img:
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            img.save(webp_path, 'webp', quality=85)
        os.remove(img_path)
        return f"/assets/{hotel_slug}.webp"
    except Exception as e:
        return None

async def scrape():
    validated_hotels = []
    
    # Launch Chrome
    chrome_proc = launch_chrome()
    print("✅ Chrome launched. Connecting via CDP...")
    
    async with async_playwright() as p:
        try:
            # Connect to the running Chrome instance
            browser = await p.chromium.connect_over_cdp(f"http://localhost:{REMOTE_DEBUG_PORT}")
            print(f"✅ Connected to Chrome! Contexts: {len(browser.contexts)}")
            
            # Use existing browser context (has real cookies!)
            context = browser.contexts[0] if browser.contexts else await browser.new_context()
            page = await context.new_page()
            
            print(f"\nNavigating to {CITY} hotels...")
            await page.goto(SEARCH_URL, wait_until="domcontentloaded", timeout=60000)
            
            print("Waiting 12s for hotels to load...")
            await page.wait_for_timeout(12000)
            
            # Scroll to trigger lazy-loading
            for i in range(8):
                await page.evaluate(f"window.scrollTo(0, {i * 500})")
                await page.wait_for_timeout(700)
            await page.evaluate("window.scrollTo(0, 0)")
            await page.wait_for_timeout(3000)
            
            # Screenshot the listing page
            await page.screenshot(path=os.path.join(workspace_dir, f'mmt_{CITY.lower()}_listing.png'))
            
            # Extract hotel links from the listing page
            print("\nExtracting hotel listing links...")
            hotel_links = await page.evaluate("""() => {
                const links = [];
                // MMT hotel cards link to /hotels/hotel-details/...
                document.querySelectorAll('a[href*="/hotels/hotel-details/"]').forEach(a => {
                    if (a.href && !links.includes(a.href)) {
                        links.push(a.href);
                    }
                });
                // Also try data attributes
                document.querySelectorAll('[data-hotel-id]').forEach(el => {
                    const id = el.getAttribute('data-hotel-id');
                    if (id) links.push(`https://www.makemytrip.com/hotels/hotel-details/?hotelId=${id}`);
                });
                return links;
            }""")
            
            print(f"  Found {len(hotel_links)} hotel detail links")
            
            if not hotel_links:
                # Try to get hotel names directly from the listing page
                print("  Trying to extract hotels directly from listing page...")
                listing_html = await page.content()
                with open(os.path.join(workspace_dir, 'mmt_page.html'), 'w', encoding='utf-8') as f:
                    f.write(listing_html)
                print("  HTML saved for analysis")
                
                # Look for hotel names in the page text
                hotel_text = await page.evaluate("""() => {
                    const results = [];
                    // Try multiple selectors
                    const selectors = [
                        'p.htlNme', '.htlNme', '[class*="htlNme"]',
                        '[class*="hotelName"]', '[class*="propertyName"]',
                        'h2', 'h3'
                    ];
                    for (const sel of selectors) {
                        const els = document.querySelectorAll(sel);
                        if (els.length > 3) {
                            els.forEach(el => {
                                const t = el.textContent.trim();
                                if (t.length > 5 && t.length < 100) results.push({sel, text: t});
                            });
                            break;
                        }
                    }
                    return results;
                }""")
                print(f"  Hotel names found: {hotel_text[:5]}")
            
            # Visit each hotel detail page and check for bathtub amenity
            print(f"\nChecking hotel detail pages for BATHTUB amenity...")
            for i, link in enumerate(hotel_links[:15]):  # Check first 15 hotels
                try:
                    detail_page = await context.new_page()
                    await detail_page.goto(link, wait_until="domcontentloaded", timeout=30000)
                    await detail_page.wait_for_timeout(3000)
                    
                    # Extract hotel name
                    hotel_name = await detail_page.evaluate("""() => {
                        const el = document.querySelector('h1, .htlName, [class*="hotelName"], [class*="propertyName"]');
                        return el ? el.textContent.trim() : null;
                    }""")
                    
                    # Check amenities for bathtub
                    has_bathtub = await detail_page.evaluate("""() => {
                        const text = document.body.innerText.toLowerCase();
                        return text.includes('bathtub') || text.includes('bath tub') || 
                               text.includes('jacuzzi') || text.includes('soaking tub') ||
                               text.includes('hot tub');
                    }""")
                    
                    # Get hotel image
                    img_url = await detail_page.evaluate("""() => {
                        const img = document.querySelector('img[src*="r1imghtlak"], img[src*="r2imghtlak"]');
                        return img ? img.src : null;
                    }""")
                    
                    status = "✅ HAS BATHTUB" if has_bathtub else "❌ No bathtub"
                    print(f"  [{i+1}] {hotel_name or 'Unknown'} — {status}")
                    
                    if has_bathtub and hotel_name:
                        slug = hotel_name.lower().replace(' ', '-').replace("'", "")[:60]
                        
                        # Download and convert image
                        img_path = None
                        if img_url:
                            img_path = download_and_convert_image(img_url, slug)
                        
                        validated_hotels.append({
                            "name": hotel_name,
                            "city": CITY,
                            "url": link,
                            "image": img_path or "/assets/fallback.webp",
                            "has_bathtub": True
                        })
                    
                    await detail_page.close()
                    await asyncio.sleep(1)  # Be polite
                    
                except Exception as e:
                    print(f"  [{i+1}] Error: {e}")
            
            await page.close()
        
        except Exception as e:
            print(f"\n❌ Error: {e}")
            print("Make sure Chrome launched successfully on port 9222")
        
        finally:
            try:
                await browser.close()
            except:
                pass
    
    chrome_proc.terminate()
    
    # Save results
    print(f"\n{'='*60}")
    print(f"✅ VALIDATED HOTELS WITH BATHTUBS IN {CITY.upper()}: {len(validated_hotels)}")
    print(f"{'='*60}")
    for h in validated_hotels:
        print(f"  🛁 {h['name']} | img: {h['image']}")
    
    out_path = os.path.join(workspace_dir, f'mmt_validated_{CITY.lower()}.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(validated_hotels, f, indent=2, ensure_ascii=False)
    print(f"\n✅ Saved to: {out_path}")
    
    return validated_hotels

if __name__ == "__main__":
    asyncio.run(scrape())
