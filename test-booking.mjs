import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
async function test() {
  const url = 'https://www.booking.com/searchresults.en-gb.html?ss=Gwalior&nflt=roomfacility%3D37'; // 37 is usually bathtub/spa tub on Booking.com
  const apiUrl = new URL('https://api.scrapingant.com/v2/general');
  apiUrl.searchParams.append('url', url);
  apiUrl.searchParams.append('x-api-key', process.env.SCRAPINGANT_API_KEY);
  apiUrl.searchParams.append('browser', 'true');
  const res = await fetch(apiUrl.toString());
  console.log('Status:', res.status);
  const text = await res.text();
  console.log(text.includes('hotel_name') || text.includes('sr_item') ? 'Has properties' : 'No properties');
}
test();
