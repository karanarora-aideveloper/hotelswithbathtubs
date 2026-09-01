import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test(cityParam, locusId) {
  const searchUrl = `https://www.makemytrip.com/hotels/hotel-listing/?_uCurrency=INR&checkin=09122026&checkout=09132026&city=${cityParam}&country=IN&filterData=ROOM_AMENITIES%7CJacuzzi%2CJacuzzi%2FBathtub&locusId=${locusId}&locusType=city&reference=hotel&roomStayQualifier=2e0e&rsc=1e2e0e&searchText=Gwalior&type=city`;
  const apiUrl = new URL('https://api.scrapingant.com/v2/general');
  apiUrl.searchParams.append('url', 'https://www.makemytrip.com/hotels/');
  apiUrl.searchParams.append('x-api-key', process.env.SCRAPINGANT_API_KEY);
  apiUrl.searchParams.append('browser', 'true');
  apiUrl.searchParams.append('proxy_type', 'residential');
  apiUrl.searchParams.append('proxy_country', 'IN');
  const finalSnippet = `window.location.href = '${searchUrl}'; await new Promise(r => setTimeout(r, 5000));`;
  apiUrl.searchParams.append('js_snippet', Buffer.from(finalSnippet).toString('base64'));
  const res = await fetch(apiUrl.toString());
  console.log(`Tested city=${cityParam}: ${res.status}`);
  if(res.ok) {
    const t = await res.text();
    console.log(t.includes('listingRow') ? "Has Hotels!" : "No Hotels!");
  }
}
test('Gwalior', 'CTGWL');
