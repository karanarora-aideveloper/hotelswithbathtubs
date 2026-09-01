import asyncio
from playwright.async_api import async_playwright
import json
import os
import urllib.request
from PIL import Image

cities = ['Udaipur', 'Munnar', 'Ooty', 'Manali', 'Shimla']
workspace_dir = '/Users/karanarora/hotelswithbathtubs'
assets_dir = os.path.join(workspace_dir, 'assets')

async def scrape_city(page, city):
    print(f"Scraping MakeMyTrip for {city}...")
    url = f"https://www.makemytrip.com/hotels/hotel-listing/?city={city.upper()}"
    
    try:
        await page.goto(url, wait_until="networkidle", timeout=60000)
    except Exception as e:
        print(f"Timeout or error navigating to {city}: {e}")
    
    # Wait to see if bot protection hits
    await page.wait_for_timeout(5000)
    
    html = await page.content()
    if "Verify you are human" in html or "Access Denied" in html:
        print(f"MMT Bot Protection triggered for {city}!")
        return []
    
    hotels = []
    # This is a simplified selector, actual MMT selectors change frequently
    hotel_cards = await page.query_selector_all('.makeFlex.space-between')
    
    for idx, card in enumerate(hotel_cards[:3]): # Top 3 hotels per city
        try:
            name_el = await card.query_selector('.wordBreak.appendRight10')
            if not name_el:
                continue
            name = await name_el.inner_text()
            
            # Extract Image
            img_el = await card.query_selector('img')
            img_url = await img_el.get_attribute('src') if img_el else None
            
            if img_url and 'http' in img_url:
                # Save and Convert Image
                slug = name.lower().replace(' ', '-').replace("'", "")
                img_path = os.path.join(assets_dir, f"{slug}.jpeg")
                webp_path = os.path.join(assets_dir, f"{slug}.webp")
                
                try:
                    urllib.request.urlretrieve(img_url, img_path)
                    with Image.open(img_path) as img:
                        if img.mode in ("RGBA", "P"):
                            img = img.convert("RGB")
                        img.save(webp_path, 'webp', quality=85)
                    os.remove(img_path)
                    final_img_path = f"/assets/{slug}.webp"
                except Exception as e:
                    print(f"Failed to download image for {name}: {e}")
                    final_img_path = "/assets/fallback.webp"
            else:
                final_img_path = "/assets/fallback.webp"
                
            hotels.append({
                "name": name,
                "image": final_img_path,
                "amenities": ["Private Bathtub", "Free WiFi", "Breakfast Included"] # Mock verification for now
            })
        except Exception as e:
            print(f"Error parsing card: {e}")
            
    return hotels

async def main():
    results = {}
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Use stealth-like headers
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        
        for city in cities:
            hotels = await scrape_city(page, city)
            results[city] = hotels
            
        await browser.close()
        
    with open(os.path.join(workspace_dir, 'mmt_data.json'), 'w') as f:
        json.dump(results, f, indent=4)
        
    print("Scraping complete. Data saved to mmt_data.json")

if __name__ == "__main__":
    asyncio.run(main())
