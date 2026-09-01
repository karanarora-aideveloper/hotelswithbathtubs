const https = require('https');

const SITEMAP_URL = 'https://www.hotelswithbathtubs.com/sitemap.xml';

function fetchSitemap(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function checkUrlStatus(url) {
  return new Promise((resolve) => {
    // We follow redirects to check the final destination status
    const req = https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        let redirectUrl = res.headers.location;
        if (redirectUrl.startsWith('/')) {
          const parsed = new URL(url);
          redirectUrl = `${parsed.protocol}//${parsed.host}${redirectUrl}`;
        }
        checkUrlStatus(redirectUrl).then(resolve);
        return;
      }
      resolve({ url, status: res.statusCode });
    });

    req.on('error', (err) => {
      resolve({ url, status: 'ERROR', error: err.message });
    });

    // Set 10s timeout
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ url, status: 'TIMEOUT' });
    });
  });
}

async function main() {
  console.log(`📡 Fetching sitemap from: ${SITEMAP_URL}`);
  try {
    const xml = await fetchSitemap(SITEMAP_URL);
    
    // Extract loc tags using regex
    const locRegex = /<loc>(https?:\/\/[^<]+)<\/loc>/g;
    let match;
    const urls = [];
    while ((match = locRegex.exec(xml)) !== null) {
      urls.push(match[1]);
    }

    console.log(`📝 Found ${urls.length} URLs in sitemap. Checking status codes...\n`);

    const results = [];
    // Check in batches of 5 to avoid overloading
    const batchSize = 5;
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      console.log(`Checking batch ${i / batchSize + 1} of ${Math.ceil(urls.length / batchSize)}...`);
      const batchResults = await Promise.all(batch.map(url => checkUrlStatus(url)));
      results.push(...batchResults);
    }

    console.log('\n📊 Check Complete. Results:');
    console.log('='.repeat(60));
    
    const errors = results.filter(r => r.status === 404 || r.status === 'ERROR' || r.status === 'TIMEOUT');
    const success = results.filter(r => r.status === 200);

    console.log(`✅ Success (200 OK): ${success.length}`);
    console.log(`❌ Failed/Errors: ${errors.length}`);
    console.log('='.repeat(60));

    if (errors.length > 0) {
      console.log('\nFailed URLs list:');
      errors.forEach(e => {
        console.log(`- [${e.status}] ${e.url} ${e.error ? `(${e.error})` : ''}`);
      });
    } else {
      console.log('\n🎉 No 404s or errors found! All sitemap URLs are active and returning 200 OK.');
    }

  } catch (error) {
    console.error('Fatal check error:', error);
  }
}

main();
