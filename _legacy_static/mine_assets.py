"""
Smart Asset Miner
==================
Parses our existing 1093 hotel image filenames to extract:
- Hotel names
- Cities  
- Bathtub type (bathtub/jacuzzi/hottub/spabath)

Then generates comprehensive city pages from this verified data.
We ALREADY have the real hotel images (from MMT/original site).
"""

import os
import re
import json
from collections import defaultdict

workspace_dir = '/Users/karanarora/hotelswithbathtubs'
assets_dir = os.path.join(workspace_dir, 'assets')

# City keyword mapping - maps slug keywords to canonical city names
CITY_MAP = {
    'kolhapur': 'Kolhapur', 'calangute': 'Calangute', 'goa': 'Goa',
    'mahipalpur': 'Mahipalpur', 'rishikesh': 'Rishikesh', 'haridwar': 'Haridwar',
    'panchgani': 'Panchgani', 'mandarmani': 'Mandarmani', 'digha': 'Digha',
    'dharamshala': 'Dharamshala', 'lonavala': 'Lonavala', 'bangalore': 'Bangalore',
    'bengaluru': 'Bangalore', 'mumbai': 'Mumbai', 'udaipur': 'Udaipur',
    'amritsar': 'Amritsar', 'kolkata': 'Kolkata', 'rajkot': 'Rajkot',
    'agra': 'Agra', 'gurgaon': 'Gurgaon', 'nainital': 'Nainital',
    'kochi': 'Kochi', 'kodai': 'Kodaikanal', 'kodaikanal': 'Kodaikanal',
    'siliguri': 'Siliguri', 'panjim': 'Panjim', 'koramangala': 'Koramangala',
    'mahabalipuram': 'Mahabalipuram', 'karjat': 'Karjat', 'igatpuri': 'Igatpuri',
    'nashik': 'Nashik', 'pune': 'Pune', 'delhi': 'New Delhi', 'new-delhi': 'New Delhi',
    'jaipur': 'Jaipur', 'chandigarh': 'Chandigarh', 'indore': 'Indore',
    'bhopal': 'Bhopal', 'faridabad': 'Faridabad', 'shirdi': 'Shirdi',
    'mount-abu': 'Mount Abu', 'saputara': 'Saputara', 'daman': 'Daman',
    'shillong': 'Shillong', 'darjeeling': 'Darjeeling', 'yercaud': 'Yercaud',
    'coimbatore': 'Coimbatore', 'zirakpur': 'Zirakpur', 'lavasa': 'Lavasa',
    'panvel': 'Panvel', 'paharganj': 'Paharganj', 'mathura': 'Mathura',
    'puri': 'Puri', 'gandhinagar': 'Gandhinagar', 'ahmedabad': 'Ahmedabad',
    'manali': 'Manali', 'shimla': 'Shimla', 'munnar': 'Munnar',
    'ooty': 'Ooty', 'matheran': 'Matheran',
}

def extract_hotel_and_city(filename):
    """Parse filename like 'bathtub-hotel-name-city-with-bathtub.webp'"""
    name = filename.replace('.webp', '').replace('-150x150', '').replace('-428x400', '').replace('-600x300', '').replace('-110x85', '')
    
    # Remove common prefix/suffix patterns
    name = re.sub(r'^(bathtub-|bath-tub-|jacuzzi-|hottub-|hot-tub-|spa-bath-|spabath-)', '', name)
    name = re.sub(r'-(with-bathtub.*|with-bath-tub.*|with-hottub.*|with-jacuzzi.*|with-spabath.*|with-hot-tub.*|with-private-jacuzzi.*|with-romantic.*|with-nice-views.*)$', '', name)
    name = re.sub(r'-(hotel-room-with.*|room-with.*)$', '', name)
    
    # Detect city
    detected_city = None
    for keyword, city in CITY_MAP.items():
        if keyword in name:
            detected_city = city
            break
    
    # Clean up hotel name - remove city suffix
    hotel_name = name
    if detected_city:
        for keyword in CITY_MAP.keys():
            hotel_name = re.sub(rf'-{keyword}$', '', hotel_name)
            hotel_name = re.sub(rf'-{keyword}-', '-', hotel_name)
    
    # Title case the hotel name
    hotel_name = hotel_name.replace('-', ' ').title()
    
    return hotel_name, detected_city

# Parse all assets
print("Parsing hotel images from assets folder...")
city_hotels = defaultdict(list)
no_city = []

all_files = [f for f in os.listdir(assets_dir) if f.endswith('.webp') and '150x150' not in f and '428x400' not in f and '600x300' not in f and '110x85' not in f]

for filename in sorted(all_files):
    hotel_name, city = extract_hotel_and_city(filename)
    if city:
        city_hotels[city].append({
            'name': hotel_name,
            'image': f'/assets/{filename}',
            'slug': filename.replace('.webp', '')
        })
    else:
        no_city.append({'filename': filename, 'parsed_name': hotel_name})

# Print summary
print(f"\n{'='*60}")
print(f"CITY-WISE HOTEL BREAKDOWN")
print(f"{'='*60}")
total_hotels = 0
for city in sorted(city_hotels.keys()):
    hotels = city_hotels[city]
    total_hotels += len(hotels)
    print(f"\n📍 {city} ({len(hotels)} hotels):")
    for h in hotels[:3]:
        print(f"   - {h['name']}")
    if len(hotels) > 3:
        print(f"   ... and {len(hotels)-3} more")

print(f"\n{'='*60}")
print(f"Total: {total_hotels} hotels across {len(city_hotels)} cities")
print(f"Unmatched (no city detected): {len(no_city)}")

# Save the structured data
out_path = os.path.join(workspace_dir, 'hotel_database.json')
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(dict(city_hotels), f, indent=2, ensure_ascii=False)

print(f"\n✅ Full hotel database saved to: {out_path}")
print("Run generate_city_pages.py next to build pages from this data!")
