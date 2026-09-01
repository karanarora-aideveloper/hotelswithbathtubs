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

    # If no Blob token, return local path (backward compatibility)
    if not os.environ.get('BLOB_READ_WRITE_TOKEN'):
        print(f"⚠️ BLOB_READ_WRITE_TOKEN not set, using local path for {filename}")
        return f"/assets/{filename}"

    try:
        # Call Node.js helper to upload to Blob
        result = subprocess.run(
            ['node', 'upload-to-blob.js', filename],
            cwd=workspace_dir,
            capture_output=True,
            text=True,
            timeout=30
        )

        if result.returncode == 0:
            blob_url = result.stdout.strip()
            print(f"✅ Uploaded to Blob: {filename} → {blob_url}")
            return blob_url
        else:
            print(f"⚠️ Blob upload failed for {filename}: {result.stderr}")
            # Fallback to local path
            return f"/assets/{filename}"

    except subprocess.TimeoutExpired:
        print(f"⚠️ Blob upload timeout for {filename}, using local path")
        return f"/assets/{filename}"
    except Exception as e:
        print(f"⚠️ Error uploading {filename}: {e}")
        return f"/assets/{filename}"
