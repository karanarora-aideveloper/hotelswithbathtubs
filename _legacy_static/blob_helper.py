"""
Helper to upload images to Vercel Blob from Python scrapers

Usage:
    from blob_helper import upload_image_to_blob

    blob_url = upload_image_to_blob('mmt-hyatt-delhi.webp')
    # Returns Blob URL like: https://...blob.vercelusercontent.com/images/mmt-hyatt-delhi.webp
"""

import subprocess
import os
import sys

def upload_image_to_blob(filename, workspace_dir=None):
    """
    Upload an image file to Vercel Blob

    Args:
        filename: Image filename (e.g., 'mmt-hotel.webp')
        workspace_dir: Path where file is located (default: current dir)

    Returns:
        Blob URL if successful, or None if upload failed
        Falls back to local path if BLOB_READ_WRITE_TOKEN not set
    """

    if not workspace_dir:
        workspace_dir = os.getcwd()

    try:
        # Call Node.js helper to upload to Cloudflare R2
        result = subprocess.run(
            ['node', 'upload-to-r2.js', filename],
            cwd=workspace_dir,
            capture_output=True,
            text=True,
            timeout=30
        )

        lines = [line.strip() for line in result.stdout.splitlines() if line.strip().startswith('http')]
        if result.returncode == 0 and lines:
            r2_url = lines[0]
            print(f"✅ Uploaded to Cloudflare R2: {filename} → {r2_url}")
            return r2_url
        else:
            print(f"⚠️ R2 upload fallback for {filename}: {result.stderr.strip() or result.stdout.strip()}")
            return f"https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/{filename}"

    except subprocess.TimeoutExpired:
        print(f"⚠️ R2 upload timeout for {filename}, using R2 expected URL")
        return f"https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/{filename}"
    except Exception as e:
        print(f"⚠️ Error uploading {filename}: {e}")
        return f"https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/{filename}"
