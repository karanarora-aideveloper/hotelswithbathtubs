import os
import urllib.request
import json
import urllib.parse

API_KEY = "CgkJbk9KEfh7u2qIVMAj7kGAgb1VJzV7rsmB7TWrfwcXWGm5bQSZcaJU"

def test_pexels_download():
    # 1. Search for a luxury bathtub photo
    query = "luxury bathtub"
    url = f"https://api.pexels.com/v1/search?query={urllib.parse.quote(query)}&per_page=1"
    
    req = urllib.request.Request(url)
    req.add_header("Authorization", API_KEY)
    
    print("Searching Pexels...")
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            
        if not data.get("photos"):
            print("No photos found.")
            return
            
        photo = data["photos"][0]
        img_url = photo["src"]["large2x"]
        photographer = photo["photographer"]
        photo_id = photo["id"]
        print(f"Found photo ID {photo_id} by {photographer}: {img_url}")
        
        # 2. Download the photo
        dest_dir = "/Users/karanarora/hotelswithbathtubs/public"
        os.makedirs(dest_dir, exist_ok=True)
        dest_path = os.path.join(dest_dir, f"test_pexels_{photo_id}.jpeg")
        
        print(f"Downloading to {dest_path}...")
        img_req = urllib.request.Request(img_url)
        with urllib.request.urlopen(img_req) as img_resp:
            with open(dest_path, "wb") as f:
                f.write(img_resp.read())
        
        print("Success! Image downloaded.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_pexels_download()
