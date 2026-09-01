import os
import glob
from datetime import datetime

workspace_dir = '/Users/karanarora/hotelswithbathtubs'
domain = "https://www.hotelswithbathtubs.com"

print("Generating sitemap.xml...")
html_files = glob.glob(os.path.join(workspace_dir, '**', 'index.html'), recursive=True)

date_str = datetime.now().strftime("%Y-%m-%d")
urls = []

for filepath in html_files:
    rel_path = os.path.relpath(filepath, workspace_dir)
    dir_path = os.path.dirname(rel_path)
    
    if dir_path == '' or dir_path == '.':
        url_path = ""
        priority = "1.0"
        freq = "weekly"
    elif dir_path.startswith('blog'):
        url_path = dir_path + "/"
        priority = "0.9"
        freq = "monthly"
    else:
        url_path = dir_path + "/"
        priority = "0.8"
        freq = "monthly"
        
    urls.append(f"""  <url>
    <loc>{domain}/{url_path}</loc>
    <lastmod>{date_str}</lastmod>
    <changefreq>{freq}</changefreq>
    <priority>{priority}</priority>
  </url>""")

sitemap_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(urls)}
</urlset>
"""

with open(os.path.join(workspace_dir, 'sitemap.xml'), 'w', encoding='utf-8') as f:
    f.write(sitemap_content)

print(f"sitemap.xml generated with {len(urls)} URLs.")
