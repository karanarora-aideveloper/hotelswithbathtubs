import os

workspace_dir = '/Users/karanarora/hotelswithbathtubs'

new_cities = [
    {
        "slug": "hotels-with-bathtub-in-udaipur",
        "city_name": "Udaipur",
        "image": "bathtub-hotel-bamboo-saa-resort-spa-udaipur-with-nice-views.webp"
    },
    {
        "slug": "hotels-with-bathtub-in-manali",
        "city_name": "Manali",
        "image": "bathtub-welcomheritage-urvashis-retreat-manali.webp"
    },
    {
        "slug": "hotels-with-bathtub-in-munnar",
        "city_name": "Munnar",
        "image": "broad-bean-resort-spa-hotel-munnar-with-romantic-jacuzzi-in-room.webp"
    },
    {
        "slug": "hotels-with-bathtub-in-ooty",
        "city_name": "Ooty",
        "image": "hotel-in-ooty-beverly-villa-with-bathtub.webp"
    },
    {
        "slug": "hotels-with-bathtub-in-shimla",
        "city_name": "Shimla",
        "image": "jacuzzi-the-orchid-hotel-shimla.webp"
    }
]

with open(os.path.join(workspace_dir, 'index.html'), 'r', encoding='utf-8') as f:
    html = f.read()

new_cards = ""
for city in new_cities:
    if f'href="/{city["slug"]}"' not in html:
        new_cards += f"""
        <a href="/{city['slug']}/" class="card">
            <img src="/assets/{city['image']}" alt="Hotels in {city['city_name']} with Bathtub" class="card-img" loading="lazy">
            <div class="card-content">
                <span class="card-title">{city['city_name']}</span>
                <span class="view-btn">View Hotels →</span>
            </div>
        </a>
"""

if new_cards:
    # Insert at the beginning of the grid
    target = '<div class="grid" id="destinationsGrid">'
    html = html.replace(target, target + new_cards)
    
    with open(os.path.join(workspace_dir, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(html)
    print("Successfully added new cities to the homepage grid.")
else:
    print("New cities already exist on the homepage.")
