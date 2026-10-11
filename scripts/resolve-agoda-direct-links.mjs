import https from 'https';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const agent = new https.Agent({ keepAlive: true, maxSockets: 30 });

const CITY_ALIASES = {
  'delhi': ['delhi', 'new delhi', 'ncr', 'gurgaon', 'gurugram', 'noida', 'aerocity'],
  'new delhi': ['delhi', 'new delhi', 'ncr', 'gurgaon', 'gurugram', 'noida', 'aerocity'],
  'mumbai': ['mumbai', 'bombay', 'navi mumbai', 'thane'],
  'bangalore': ['bangalore', 'bengaluru'],
  'bengaluru': ['bangalore', 'bengaluru'],
  'kolkata': ['kolkata', 'calcutta'],
  'chennai': ['chennai', 'madras', 'mahabalipuram'],
  'kochi': ['kochi', 'cochin', 'ernakulam'],
  'varanasi': ['varanasi', 'benares', 'banaras', 'kashi'],
  'pondicherry': ['pondicherry', 'puducherry'],
  'ooty': ['ooty', 'udagamandalam', 'nilgiris'],
  'coorg': ['coorg', 'madikeri', 'kodagu', 'kushalnagar'],
  'goa': ['goa', 'panaji', 'calangute', 'candolim', 'anjuna', 'vagator', 'bardez', 'salcete', 'morjim', 'baga', 'colva', 'benaulim'],
  'munnar': ['munnar', 'idukki', 'devikulam', 'chinnakanal'],
  'wayanad': ['wayanad', 'kalpetta', 'vythiri', 'sultan bathery', 'meppadi'],
  'chikmagalur': ['chikmagalur', 'chikkamagaluru'],
  'mahabaleshwar': ['mahabaleshwar', 'panchgani'],
  'lonavala': ['lonavala', 'khandala'],
  'shimla': ['shimla', 'mashobra', 'kufri', 'chail'],
  'manali': ['manali', 'kullu'],
  'dharamshala': ['dharamshala', 'mcleodganj', 'kangra'],
  'rishikesh': ['rishikesh', 'tapovan', 'haridwar'],
  'darjeeling': ['darjeeling', 'kalimpong', 'kurseong'],
  'gangtok': ['gangtok', 'sikkim'],
  'udaipur': ['udaipur', 'pichola'],
  'jaipur': ['jaipur', 'amer', 'kukas'],
  'jodhpur': ['jodhpur'],
  'jaisalmer': ['jaisalmer'],
  'agra': ['agra', 'tajganj'],
  'amritsar': ['amritsar'],
  'hyderabad': ['hyderabad', 'secunderabad', 'gachibowli'],
  'pune': ['pune', 'pimpri'],
  'ahmedabad': ['ahmedabad', 'gandhinagar'],
  'tirupati': ['tirupati', 'tirumala'],
  'visakhapatnam': ['visakhapatnam', 'vizag'],
  'guwahati': ['guwahati', 'dispur'],
  'bhubaneswar': ['bhubaneswar', 'puri'],
  'new york': ['new york', 'manhattan', 'brooklyn', 'queens', 'nyc'],
  'las vegas': ['las vegas', 'vegas', 'henderson'],
  'los angeles': ['los angeles', 'hollywood', 'santa monica', 'beverly hills'],
  'san francisco': ['san francisco', 'bay area'],
  'miami': ['miami', 'miami beach', 'south beach'],
};

function matchesCity(item, city, country) {
  const geo = `${item.CityName || ''} ${item.ResultText || ''} ${item.DisplayNames?.GeoHierarchyName || ''}`.toLowerCase();
  const cLower = (city || '').toLowerCase().split(',')[0].trim();
  if (!cLower) return false;
  if (geo.includes(cLower)) return true;

  for (const [key, list] of Object.entries(CITY_ALIASES)) {
    if (cLower.includes(key) && list.some(a => geo.includes(a))) {
      return true;
    }
  }
  return false;
}

function fetchSuggest(query) {
  const url = `https://www.agoda.com/api/cronos/search/GetUnifiedSuggestResult/3/1/1/0/en-us/?searchText=${encodeURIComponent(query)}`;
  return new Promise((resolve) => {
    const req = https.get(url, { agent, timeout: 6000, headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

const cityIdCache = new Map();

async function getCityId(city, country) {
  const key = `${city}|${country}`.toLowerCase();
  if (cityIdCache.has(key)) return cityIdCache.get(key);

  const data = await fetchSuggest(`${city} ${country}`);
  const list = data?.ViewModelList || [];
  const cityItem = list.find(x => x.CityId > 0 && matchesCity(x, city, country)) || list.find(x => x.CityId > 0);
  const cid = cityItem?.CityId || 0;
  cityIdCache.set(key, cid);
  return cid;
}

async function resolveHotelAgoda(h) {
  const cleanName = (h.name || '').replace(/\(.*?\)/g, '').trim();
  const query = `${cleanName} ${h.city}`;
  const data = await fetchSuggest(query);
  const list = data?.ViewModelList || [];

  // 1. Exact property match in the verified city
  const exactHotel = list.find(x => x.IsHotel && x.ObjectId > 0 && matchesCity(x, h.city, h.country));
  if (exactHotel) {
    if (exactHotel.CityId > 0) {
      cityIdCache.set(`${h.city}|${h.country}`.toLowerCase(), exactHotel.CityId);
    }
    return {
      type: 'hid',
      url: `https://www.agoda.com/partners/partnersearch.aspx?pcs=1&cid=1972736&hid=${exactHotel.ObjectId}`,
    };
  }

  // 2. Any item in the response that has CityId matching our city
  const cityFromList = list.find(x => x.CityId > 0 && matchesCity(x, h.city, h.country))?.CityId;
  const cityId = cityFromList || (await getCityId(h.city, h.country));

  if (cityId > 0) {
    return {
      type: 'city_search',
      url: `https://www.agoda.com/partners/partnersearch.aspx?pcs=1&cid=1972736&city=${cityId}&txt=${encodeURIComponent(cleanName)}`,
    };
  }

  // 3. Universal Partner Search fallback (never 301s to blank homepage)
  return {
    type: 'partner_search',
    url: `https://www.agoda.com/partners/partnersearch.aspx?pcs=1&cid=1972736&txt=${encodeURIComponent(`${cleanName} ${h.city}`)}`,
  };
}

async function main() {
  const cachePath = path.resolve(process.cwd(), '.cache/all-hotels.json');
  const allHotels = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  const toFixIndices = [];
  for (let i = 0; i < allHotels.length; i++) {
    const u = allHotels[i].agodaUrl || '';
    if (!u.includes('hid=') && !u.includes('city=') && !u.includes('/hotel/')) {
      toFixIndices.push(i);
    }
  }

  console.log(`Total hotels in cache: ${allHotels.length}. Remaining Agoda URLs to resolve: ${toFixIndices.length}`);

  let hidCount = 0;
  let citySearchCount = 0;
  let partnerSearchCount = 0;
  const mongoOps = [];

  const BATCH_SIZE = 10;
  for (let b = 0; b < toFixIndices.length; b += BATCH_SIZE) {
    const slice = toFixIndices.slice(b, b + BATCH_SIZE);
    await Promise.all(slice.map(async (idx) => {
      const h = allHotels[idx];
      const res = await resolveHotelAgoda(h);
      allHotels[idx].agodaUrl = res.url;
      if (res.type === 'hid') hidCount++;
      else if (res.type === 'city_search') citySearchCount++;
      else partnerSearchCount++;

      if (h._id) {
        mongoOps.push({
          updateOne: {
            filter: { _id: new mongoose.Types.ObjectId(h._id) },
            update: { $set: { agodaUrl: res.url } },
          },
        });
      }
    }));

    await new Promise(r => setTimeout(r, 120));

    if ((b + BATCH_SIZE) % 200 === 0 || b + BATCH_SIZE >= toFixIndices.length) {
      console.log(`Processed ${Math.min(b + BATCH_SIZE, toFixIndices.length)}/${toFixIndices.length} | Direct HID: ${hidCount} | City+Txt: ${citySearchCount} | PartnerTxt: ${partnerSearchCount}`);
    }
  }

  // Save updated .cache/all-hotels.json
  fs.writeFileSync(cachePath, JSON.stringify(allHotels, null, 2));
  console.log('Updated .cache/all-hotels.json');

  // Update MongoDB in bulk
  if (process.env.MONGODB_URI && mongoOps.length > 0) {
    await mongoose.connect(process.env.MONGODB_URI);
    const Hotel = mongoose.connection.collection('hotels');
    const result = await Hotel.bulkWrite(mongoOps, { ordered: false });
    console.log(`MongoDB bulkWrite modifiedCount: ${result.modifiedCount}`);
    await mongoose.disconnect();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
