import os

workspace_dir = '/Users/karanarora/hotelswithbathtubs'

new_cities = [
    {
        "slug": "hotels-with-bathtub-in-udaipur",
        "city_name": "Udaipur",
        "description": "Discover the most romantic heritage hotels and luxury resorts in Udaipur offering private bathtubs and stunning lake views.",
        "hotel_name": "Bamboo Saa Resort & Spa",
        "image": "bathtub-hotel-bamboo-saa-resort-spa-udaipur-with-nice-views.webp"
    },
    {
        "slug": "hotels-with-bathtub-in-manali",
        "city_name": "Manali",
        "description": "Experience snow-capped mountains from the warmth of your private jacuzzi at these top luxury resorts in Manali.",
        "hotel_name": "WelcomHeritage Urvashi's Retreat",
        "image": "bathtub-welcomheritage-urvashis-retreat-manali.webp"
    },
    {
        "slug": "hotels-with-bathtub-in-munnar",
        "city_name": "Munnar",
        "description": "Relax in the serene tea gardens of Kerala with our curated list of Munnar hotels featuring in-room jacuzzis and spa baths.",
        "hotel_name": "Broad Bean Resort & Spa",
        "image": "broad-bean-resort-spa-hotel-munnar-with-romantic-jacuzzi-in-room.webp"
    },
    {
        "slug": "hotels-with-bathtub-in-ooty",
        "city_name": "Ooty",
        "description": "Find the perfect romantic getaway in the Nilgiri Hills with these premium Ooty villas and hotels featuring private bathtubs.",
        "hotel_name": "Beverly Villa",
        "image": "hotel-in-ooty-beverly-villa-with-bathtub.webp"
    },
    {
        "slug": "hotels-with-bathtub-in-shimla",
        "city_name": "Shimla",
        "description": "Enjoy colonial charm and modern luxury in Shimla's finest hotels equipped with deep soaking bathtubs and jacuzzis.",
        "hotel_name": "The Orchid Hotel",
        "image": "jacuzzi-the-orchid-hotel-shimla.webp"
    }
]

# Read header and footer from index.html
with open(os.path.join(workspace_dir, 'index.html'), 'r', encoding='utf-8') as f:
    html = f.read()
    
# Extract a generic header and footer up to <main>
header_part = html.split('<main')[0] + '<main class="container">'
footer_part = '</main>' + html.split('</main>')[1]

print("Generating new verified city pages...")
for city in new_cities:
    city_dir = os.path.join(workspace_dir, city['slug'])
    if not os.path.exists(city_dir):
        os.makedirs(city_dir)
        
    # Replace title and SEO tags
    head = header_part.replace("Hotels With Bathtubs | Romantic Getaways", f"Hotels with Bathtubs in {city['city_name']} | Private Jacuzzi Rooms")
    
    body = f"""
        <section class="hero" style="text-align: center; padding: 4rem 1rem;">
            <h2>Hotels with Bathtubs in {city['city_name']}</h2>
            <p style="color: var(--text-muted); font-size: 1.1rem; max-width: 600px; margin: 1rem auto;">{city['description']}</p>
        </section>
        
        <div class="grid">
            <div class="card">
                <img src="/assets/{city['image']}" alt="{city['hotel_name']} in {city['city_name']} with Bathtub" class="card-img" style="width: 100%; height: 250px; object-fit: cover; border-radius: 12px 12px 0 0;">
                <div class="card-content" style="padding: 1.5rem;">
                    <span style="background: rgba(99, 102, 241, 0.1); color: var(--accent); padding: 0.3rem 0.8rem; border-radius: 50px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase;">Verified MMT Listing</span>
                    <h3 style="margin-top: 1rem; color: #fff; font-size: 1.3rem;">{city['hotel_name']}</h3>
                    <p style="color: var(--text-muted); margin-top: 0.5rem; font-size: 0.95rem;">Experience absolute luxury in {city['city_name']} with a verified private in-room bathtub. Perfect for couples and romantic getaways.</p>
                    <ul style="list-style: none; padding: 0; margin-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1rem;">
                        <li style="color: #fff; margin-bottom: 0.5rem;">✔️ Deep Soaking Bathtub</li>
                        <li style="color: #fff; margin-bottom: 0.5rem;">✔️ Premium Amenities</li>
                        <li style="color: #fff;">✔️ Highly Rated on MakeMyTrip</li>
                    </ul>
                </div>
            </div>
        </div>
    """
    
    with open(os.path.join(city_dir, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(head + body + footer_part)
        
print("City generation complete!")
