const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = "CgkJbk9KEfh7u2qIVMAj7kGAgb1VJzV7rsmB7TWrfwcXWGm5bQSZcaJU";
const QUERY = "luxury bathtub";

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirect
        downloadImage(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
        return;
      }

      const fileStream = fs.createWriteStream(dest);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
    });

    request.on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

function searchAndDownload() {
  const options = {
    hostname: 'api.pexels.com',
    path: `/v1/search?query=${encodeURIComponent(QUERY)}&per_page=1`,
    headers: {
      'Authorization': API_KEY
    }
  };

  console.log('Searching Pexels for "luxury bathtub"...');
  
  https.get(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (!data.photos || data.photos.length === 0) {
          console.log('No photos found.');
          return;
        }

        const photo = data.photos[0];
        const imageUrl = photo.src.large2x;
        const photographer = photo.photographer;
        const photoId = photo.id;

        console.log(`Found photo ID ${photoId} by ${photographer}: ${imageUrl}`);

        const destDir = path.join(__dirname, '..', 'public');
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }

        const destPath = path.join(destDir, `pexels_bathtub_${photoId}.jpeg`);
        console.log(`Downloading image to ${destPath}...`);

        downloadImage(imageUrl, destPath)
          .then(() => console.log('Success! Image downloaded successfully.'))
          .catch((err) => console.error('Download error:', err));

      } catch (err) {
        console.error('Parsing error:', err);
      }
    });
  }).on('error', (err) => {
    console.error('API request error:', err);
  });
}

searchAndDownload();
