import os
import urllib.request
import urllib.error

workspace_dir = '/Users/karanarora/hotelswithbathtubs'
domain = "https://www.hotelswithbathtubs.com"
ga_tag = "G-VE2SJ4WXF8"

print("Starting restoration from live site...")

subdirs = [d for d in os.listdir(workspace_dir) if os.path.isdir(os.path.join(workspace_dir, d)) and d != 'assets' and not d.startswith('.')]
pages_to_restore = [''] + subdirs

success_count = 0

for d in pages_to_restore:
    url = f"{domain}/{d}" if d else domain
    local_path = os.path.join(workspace_dir, d, 'index.html') if d else os.path.join(workspace_dir, 'index.html')
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
            
            # Replace the GA placeholder with the real tag
            html = html.replace('G-XXXXXXXXXX', ga_tag)
            
            with open(local_path, 'w', encoding='utf-8') as f:
                f.write(html)
            success_count += 1
    except Exception as e:
        print(f"Failed to restore {url}: {e}")

print(f"Successfully restored {success_count} HTML files with the real GA tag!")
