import * as dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const CITY = 'Gwalior';

// Use a fixed 2024 date
const targetUrl = `https://www.makemytrip.com/hotels/hotel-listing/?city=${encodeURIComponent(CITY)}&checkin=10102024&checkout=10112024&roomStayQualifier=2e0e&locusId=CTGWA&country=IN&locusType=city&searchText=${encodeURIComponent(CITY)}`;

const jsSnippet = Buffer.from(`
  await new Promise(r => setTimeout(r, 5000));
  for(let i=0; i<15; i++){
    window.scrollBy(0, document.body.scrollHeight);
    await new Promise(r => setTimeout(r, 1500));
  }
`).toString('base64');

async function test() {
  console.log('Sending request to ScrapingAnt with 2024 dates...');
  const apiUrl = new URL('https://api.scrapingant.com/v2/general');
  apiUrl.searchParams.append('url', targetUrl);
  apiUrl.searchParams.append('x-api-key', process.env.SCRAPINGANT_API_KEY);
  apiUrl.searchParams.append('browser', 'true');
  apiUrl.searchParams.append('proxy_type', 'residential');
  apiUrl.searchParams.append('proxy_country', 'IN');
  apiUrl.searchParams.append('js_snippet', jsSnippet);

  try {
    const res = await fetch(apiUrl.toString());
    const text = await res.text();
    
    if (res.ok) {
      fs.writeFileSync('scratch/scrapingant_result.html', text);
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
