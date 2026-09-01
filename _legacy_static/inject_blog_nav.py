import os
import glob
import re

workspace_dir = '/Users/karanarora/hotelswithbathtubs'

# 1. Update style.css
style_path = os.path.join(workspace_dir, 'style.css')
with open(style_path, 'r', encoding='utf-8') as f:
    css = f.read()

blog_css = """
/* BLOG STYLES */
.blog-article {
    max-width: 800px;
    margin: 4rem auto;
    background: var(--bg-card);
    padding: 3rem;
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.05);
}
.blog-header {
    margin-bottom: 3rem;
    text-align: center;
}
.blog-header h1 {
    font-family: var(--font-heading);
    font-size: 2.5rem;
    color: #fff;
    margin-top: 1rem;
    line-height: 1.2;
}
.blog-meta {
    color: var(--accent);
    font-weight: 500;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 1px;
}
.blog-content h3 {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    color: #fff;
    margin-top: 2.5rem;
    margin-bottom: 1rem;
}
.blog-content p {
    color: var(--text-muted);
    font-size: 1.15rem;
    line-height: 1.8;
    margin-bottom: 1.5rem;
}
.blog-content strong {
    color: #fff;
}
.blog-footer {
    margin-top: 4rem;
    padding-top: 2rem;
    border-top: 1px solid rgba(255,255,255,0.1);
    text-align: center;
}
.back-link {
    display: inline-block;
    padding: 0.8rem 2rem;
    background: rgba(99, 102, 241, 0.1);
    color: var(--accent);
    border-radius: 50px;
    font-weight: 600;
    transition: all 0.3s ease;
}
.back-link:hover {
    background: var(--accent);
    color: #fff;
    transform: translateY(-2px);
}
.nav-links {
    margin-left: auto;
    display: flex;
    gap: 1.5rem;
    align-items: center;
}
.nav-links a {
    color: #fff;
    font-weight: 600;
    font-size: 1.1rem;
    transition: color 0.3s ease;
}
.nav-links a:hover {
    color: var(--accent);
}
"""

if "/* BLOG STYLES */" not in css:
    with open(style_path, 'a', encoding='utf-8') as f:
        f.write("\n" + blog_css)
    print("Appended blog CSS.")

# 2. Update Navbar in all HTML files
print("Updating navbars...")
html_files = glob.glob(os.path.join(workspace_dir, '**', '*.html'), recursive=True)

nav_pattern = re.compile(r'(<nav class="navbar">\s*<a href="/">\s*<h1>Hotels With Bathtubs</h1>\s*<p>Discover romantic hotels with private bathtubs</p>\s*</a>)', re.IGNORECASE)

nav_replacement = r'\1\n        <div class="nav-links">\n            <a href="/blog/">Blog</a>\n        </div>'

updated = 0
for file in html_files:
    if 'blog/' in file:
        continue # handled by generate_blog.py
        
    with open(file, 'r', encoding='utf-8') as f:
        html = f.read()
        
    if 'class="nav-links"' not in html:
        new_html = nav_pattern.sub(nav_replacement, html)
        if new_html != html:
            with open(file, 'w', encoding='utf-8') as f:
                f.write(new_html)
            updated += 1

print(f"Updated navbar in {updated} HTML files.")
