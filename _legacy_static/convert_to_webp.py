import os
import glob
try:
    from PIL import Image
except ImportError:
    print("Please install Pillow using 'pip install Pillow'")
    exit(1)

workspace_dir = '/Users/karanarora/hotelswithbathtubs'
assets_dir = os.path.join(workspace_dir, 'assets')

# 1. Convert Images
print("Starting image conversion...")
image_files = glob.glob(os.path.join(assets_dir, '*.jpeg')) + glob.glob(os.path.join(assets_dir, '*.jpg'))

converted = 0
for img_path in image_files:
    filename = os.path.basename(img_path)
    name, ext = os.path.splitext(filename)
    
    webp_path = os.path.join(assets_dir, f"{name}.webp")
    
    try:
        with Image.open(img_path) as img:
            # Convert to RGB if needed (e.g. RGBA pngs)
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            img.save(webp_path, 'webp', quality=85)
        
        # Delete original
        os.remove(img_path)
        converted += 1
    except Exception as e:
        print(f"Failed to convert {filename}: {e}")

print(f"Successfully converted {converted} images to WebP!")

# 2. Update HTML files
print("Updating HTML references...")
html_files = glob.glob(os.path.join(workspace_dir, '**', '*.html'), recursive=True)

updated_files = 0
for html_path in html_files:
    try:
        with open(html_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        new_content = content.replace('.jpeg', '.webp').replace('.jpg', '.webp')
        
        if new_content != content:
            with open(html_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            updated_files += 1
    except Exception as e:
        print(f"Failed to update {html_path}: {e}")

print(f"Successfully updated {updated_files} HTML files!")
