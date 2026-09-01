import * as dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const CITY = 'Gwalior';
const checkin = '10102024';
const checkout = '10112024';
const locusId = 'CT' + CITY.substring(0, 3).toUpperCase();
const searchUrl = `https://www.makemytrip.com/hotels/hotel-listing/?city=${encodeURIComponent(CITY)}&checkin=${checkin}&checkout=${checkout}&roomStayQualifier=2e0e&locusId=${locusId}&country=IN&locusType=city&searchText=${encodeURIComponent(CITY)}`;

// JS Snippet to redirect from homepage, wait for load, and scroll down
const jsSnippetCode = `
  // Redirect to search URL to bypass deep-link block
  window.location.href = '${searchUrl}';
  
  // Wait for navigation and initial render
  await new Promise(r => setTimeout(r, 10000));
  
  // Scroll down to load more hotels
  for (let i = 0; i < 15; i++) {
    window.scrollBy(0, document.body.scrollHeight);
    await new Promise(r => setTimeout(r, 1500));
  }
`;
const jsSnippet = Buffer.from(jsSnippetCode).toString('base64');

async function test() {
  console.log('Sending request to ScrapingAnt...');
  const apiUrl = new URL('https://api.scrapingant.com/v2/general');
  // Start at the homepage
  apiUrl.searchParams.append('url', 'https://www.makemytrip.com/hotels/');
  apiUrl.searchParams.append('x-api-key', process.env.SCRAPINGANT_API_KEY);
  apiUrl.searchParams.append('browser', 'true');
  apiUrl.searchParams.append('proxy_type', 'residential');
  apiUrl.searchParams.append('proxy_country', 'IN');
  apiUrl.searchParams.append('js_snippet', jsSnippet);

  try {
    const res = await fetch(apiUrl.toString());
    const text = await res.text();
    
    if (res.ok) {
      console.log('Success!');
      fs.writeFileSync('scratch/scrapingant_result2.html', text);
      const match = text.match(/hotel-details/g);
      console.log('Found hotel-details links:', match ? match.length : 0);
    } else {
      console.log('Error:', res.status, text);
    }
  } catch (e) {
    console.error(e);
  }
}
test();
