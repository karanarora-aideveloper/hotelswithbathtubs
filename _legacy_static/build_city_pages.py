"""
Build Verified MMT City Pages
================================
Reads mmt_validated_*.json files and generates rich, SEO-optimized
city landing pages with real hotel cards (validated on MMT).
"""

import json
import os
import re

workspace_dir = '/Users/karanarora/hotelswithbathtubs'

# City → (slug, state, description)
CITY_META = {
    "Udaipur": ("hotels-with-bathtub-in-udaipur", "Rajasthan",
        "Find luxury hotels in the City of Lakes offering private bathtubs and Jacuzzis. Verified listings from MakeMyTrip."),
    "Manali": ("hotels-with-bathtub-in-manali", "Himachal Pradesh",
        "Experience the Himalayas from the warmth of your private bathtub. Verified hotels with Jacuzzis in Manali."),
    "Munnar": ("hotels-with-bathtub-in-munnar", "Kerala",
        "Soak in luxury amid Kerala's lush tea gardens. Verified hotels and resorts in Munnar with private bathtubs."),
    "Shimla": ("hotels-with-bathtub-in-shimla", "Himachal Pradesh",
        "Heritage suites and modern luxury in Shimla with verified private bathtubs and deep soaking tubs."),
    "Ooty": ("hotels-with-bathtub-in-ooty", "Tamil Nadu",
        "Romantic Nilgiri hill retreats with verified private bathtubs. Find the best Ooty hotels with Jacuzzis."),
}

CARD_TEMPLATE = """
        <a href="{url}" target="_blank" rel="noopener" class="card">
            <div class="card-img-wrap">
                <img src="{image}" alt="{name} - Hotel with Bathtub in {city}" class="card-img" loading="lazy">
                <span class="mmt-badge">✓ Verified on MMT</span>
            </div>
            <div class="card-content">
                <h3 class="card-title" style="font-size: 1.15rem;">{name}</h3>
                <p class="card-subtitle">📍 {city}, {state}</p>
                <ul class="hotel-amenities" style="list-style: none; padding: 0; margin: 0 0 1rem; border-top: 1px solid var(--border); padding-top: 1rem; flex-grow: 1;">
                    <li style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.3rem;">🛁 Private Bathtub / Jacuzzi</li>
                    <li style="font-size: 0.85rem; color: var(--success); margin-bottom: 0.3rem;">✅ Verified on MakeMyTrip</li>
                    <li style="font-size: 0.85rem; color: var(--accent); font-weight: 600;">🔥 Highly demanded today</li>
                </ul>
                <span class="view-btn" style="background: linear-gradient(135deg, var(--accent), var(--accent-hover)); color: #fff;">Book on MakeMyTrip →</span>
            </div>
        </a>"""

PAGE_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hotels with Bathtubs in {city} | Verified Jacuzzi Rooms | HotelsWithBathtubs.com</title>
    <meta name="description" content="{description}">
    <meta property="og:title" content="Hotels with Bathtubs in {city} | HotelsWithBathtubs.com">
    <meta property="og:description" content="{description}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://www.hotelswithbathtubs.com/{slug}/">
    <link rel="stylesheet" href="/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@700;800&display=swap" rel="stylesheet">
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-VE2SJ4WXF8"></script>
    <script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments)}}gtag('js',new Date());gtag('config','G-VE2SJ4WXF8');</script>
    <style>
        .breadcrumb {{ padding: 1rem 2rem; max-width: 1280px; margin: 0 auto; font-size: 0.9rem; color: var(--text-muted); font-weight: 500; }}
        .breadcrumb a {{ color: var(--accent-secondary); text-decoration: none; }}
        .mmt-badge {{ position: absolute; top: 12px; left: 12px; background: rgba(5, 150, 105, 0.95); color: #fff; font-size: 0.75rem; font-weight: 700; padding: 0.35rem 0.8rem; border-radius: 50px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); backdrop-filter: blur(4px); }}
        .seo-text {{ max-width: 900px; margin: 0 auto; padding: 3rem 2rem 5rem; text-align: center; }}
        .seo-text h2 {{ font-family: var(--font-heading); font-size: 2rem; font-weight: 800; color: var(--accent-secondary); margin-bottom: 1.5rem; }}
        .seo-text p {{ color: var(--text-muted); line-height: 1.8; margin-bottom: 1.5rem; font-size: 1.1rem; }}
    </style>
</head>
<body>
    <nav class="navbar">
        <a href="/" class="nav-logo">
            <h1>Hotels With Bathtubs</h1>
            <p>Verified Premium Suites & Jacuzzis</p>
        </a>
        <div class="nav-links">
            <a href="/">Home</a>
            <a href="/blog/">Travel Blog</a>
        </div>
    </nav>

    <div class="breadcrumb">
        <a href="/">Home</a> &rsaquo; Hotels with Bathtubs in {city}
    </div>

    <header class="hero" style="background-image: url('/assets/bathtub-hotel-bamboo-saa-resort-spa-udaipur-with-nice-views.webp'); padding: 6rem 2rem 8rem;">
        <div class="hero-content">
            <div style="display: inline-block; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); color: #fff; padding: 0.4rem 1.2rem; border-radius: 50px; font-size: 0.9rem; font-weight: 700; margin-bottom: 1.5rem; backdrop-filter: blur(8px);">🏨 {hotel_count} Verified Hotels · MakeMyTrip Validated</div>
            <h2>Hotels with Bathtubs in {city}</h2>
            <p>{description}</p>
        </div>
    </header>

    <div class="trust-banner" style="margin-top: -3.5rem; position: relative; z-index: 10; max-width: 900px; margin-left: auto; margin-right: auto; border-radius: 16px;">
        <div class="trust-item"><span class="trust-icon">✅</span> Verified by MakeMyTrip</div>
        <div class="trust-item"><span class="trust-icon">🛁</span> Guaranteed Bathtubs</div>
        <div class="trust-item"><span class="trust-icon">🔒</span> Secure Booking</div>
    </div>

    <main class="container" style="padding-top: 3rem;">
        <div class="grid">
{hotel_cards}
        </div>
    </main>

    <section class="seo-text">
        <h2>Why Choose a Hotel with a Bathtub in {city}?</h2>
        <p>{city} is one of India's most romantic destinations. A private bathtub or jacuzzi adds the perfect touch of luxury to your stay, whether you're on a honeymoon, anniversary trip, or a relaxing getaway. All hotels listed here have been individually verified on MakeMyTrip to confirm the bathtub amenity.</p>
        <p>We check each hotel's amenities page to ensure "Bathtub", "Jacuzzi", or "Soaking Tub" is explicitly listed — so you can book with confidence.</p>
    </section>

    <footer>
        <p>© 2025 HotelsWithBathtubs.com · <a href="#">Privacy Policy</a> · <a href="/blog/">Blog</a></p>
    </footer>
</body>
</html>"""

def slugify_img(name):
    return re.sub(r'[^a-z0-9-]', '-', name.lower().replace(' ', '-'))[:50]

generated = []
for city, (slug, state, description) in CITY_META.items():
    json_file = os.path.join(workspace_dir, f'mmt_validated_{city.lower()}.json')
    if not os.path.exists(json_file):
        print(f"⚠️  Skipping {city} — no validated data file found")
        continue

    with open(json_file) as f:
        hotels = json.load(f)

    if not hotels:
        print(f"⚠️  Skipping {city} — 0 validated hotels")
        continue

    print(f"✅ Building page for {city} ({len(hotels)} hotels)...")

    # Build hotel cards
    cards_html = ""
    for h in hotels:
        cards_html += CARD_TEMPLATE.format(
            url=h.get('url', 'https://www.makemytrip.com/hotels/'),
            image=h.get('image', '/assets/fallback.webp'),
            name=h['name'],
            city=city,
            state=state
        )

    if not cards_html:
        cards_html = '<div class="no-hotels"><p>Loading verified hotels...</p></div>'

    page_html = PAGE_TEMPLATE.format(
        city=city,
        state=state,
        slug=slug,
        description=description,
        hotel_count=len(hotels),
        hotel_cards=cards_html
    )

    # Write page
    city_dir = os.path.join(workspace_dir, slug)
    os.makedirs(city_dir, exist_ok=True)
    with open(os.path.join(city_dir, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(page_html)

    generated.append((city, slug, len(hotels)))
    print(f"   → Written to /{slug}/index.html")

print(f"\n{'='*50}")
print(f"✅ Generated {len(generated)} city pages")
for city, slug, count in generated:
    print(f"  /{slug}/ — {count} hotels")
