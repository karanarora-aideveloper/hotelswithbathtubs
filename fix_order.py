import re

with open('src/components/CityHotelsClient.tsx', 'r') as f:
    content = f.read()

# Extract availableTubCategories
available_tub_regex = re.compile(r'\s*const availableTubCategories = useMemo\(\(\) => \{[\s\S]*?\}, \[uniqueHotels\]\);')
match = available_tub_regex.search(content)
if match:
    block = match.group(0)
    # Remove it from current place
    content = content.replace(block, '')
    
    # Insert it after uniqueHotels block
    unique_hotels_regex = re.compile(r'\s*const uniqueHotels = useMemo\(\(\) => \{[\s\S]*?\}, \[hotels\]\);')
    match2 = unique_hotels_regex.search(content)
    if match2:
        block2 = match2.group(0)
        content = content.replace(block2, block2 + "\n" + block)

with open('src/components/CityHotelsClient.tsx', 'w') as f:
    f.write(content)
