import https from 'https';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const AGODA_CID = '1951559';
const agent = new https.Agent({ keepAlive: true, maxSockets: 20 });

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
  'dharamshala': ['dharamshala', 'mcleodganj', 'kangra', 'dharamsala'],
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
  'thrissur': ['thrissur', 'trichur'],
  'milan': ['milan', 'milano'],
  'rome': ['rome', 'roma'],
  'florence': ['florence', 'firenze'],
  'venice': ['venice', 'venezia'],
  'new york': ['new york', 'manhattan', 'brooklyn', 'queens', 'nyc'],
  'las vegas': ['las vegas', 'vegas', 'henderson'],
  'los angeles': ['los angeles', 'hollywood', 'santa monica', 'beverly hills'],
  'san francisco': ['san francisco', 'bay area'],
  'miami': ['miami', 'miami beach', 'south beach'],
};

function matchesCity(item, city, country) {
  // IMPORTANT: Do NOT include item.ResultText because it contains the hotel name, which might contain words like "Milano"
  const geo = `${item.CityName || ''} ${item.DisplayNames?.GeoHierarchyName || ''}`.toLowerCase();
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

function scoreHotelName(candName, targName) {
  const cName = candName.toLowerCase();
  const tName = targName.toLowerCase();
  if (cName === tName) return 1.0;

  const stopWords = new Set(['hotel', 'resort', 'spa', 'and', 'the', 'inn', 'suites', 'a', 'by', 'at', 'in', 'of', '&', 'city', 'valley']);
  const candTokens = cName.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
  const targTokens = tName.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));

  if (targTokens.length === 0 || candTokens.length === 0) return 0.5;

  const firstMatch = candTokens[0] && targTokens[0] && (candTokens[0].includes(targTokens[0]) || targTokens[0].includes(candTokens[0]));

  let matches = 0;
  for (const t of targTokens) {
    if (candTokens.some(c => c === t || c.includes(t) || t.includes(c))) {
      matches++;
    }
  }

  const ratio = matches / Math.min(targTokens.length, candTokens.length);
  if (firstMatch && ratio >= 0.5) return 0.9;
  if (firstMatch) return 0.7;
  return ratio;
}

function fetchSuggest(query) {
  const url = `https://www.agoda.com/api/cronos/search/GetUnifiedSuggestResult/2/18/1/0/en-us/?searchText=${encodeURIComponent(query)}`;
  return new Promise((resolve) => {
    const req = https.get(url, { agent, timeout: 7000, headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' } }, (res) => {
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

async function resolveAgoda(h) {
  const cleanName = (h.name || '').replace(/\(.*?\)/g, '').replace(/—.*$/, '').trim();
  const query = `${cleanName} ${h.city}`;
  const data = await fetchSuggest(query);
  const list = data?.ViewModelList || [];

  // Filter for valid hotels in the verified city
  const hotelCandidates = list.filter(x => x.IsHotel && x.ObjectId > 0 && matchesCity(x, h.city, h.country));
  
  let bestHotel = null;
  let bestScore = 0;
  for (const cand of hotelCandidates) {
    const score = scoreHotelName(cand.Name, cleanName);
    if (score > bestScore) {
      bestScore = score;
      bestHotel = cand;
    }
  }

  // If score is satisfactory, return direct hid URL
  if (bestHotel && bestScore >= 0.35) {
    if (bestHotel.CityId > 0) {
      cityIdCache.set(`${h.city}|${h.country}`.toLowerCase(), bestHotel.CityId);
    }
    return {
      type: 'hid',
      hotelId: String(bestHotel.ObjectId),
      matchedName: bestHotel.Name,
      url: `https://www.agoda.com/partners/partnersearch.aspx?cid=${AGODA_CID}&hid=${bestHotel.ObjectId}`,
    };
  }

  // If no direct hotel found, check if we can lock the city
  const cityItem = list.find(x => x.CityId > 0 && matchesCity(x, h.city, h.country));
  const cityId = cityItem?.CityId || (await getCityId(h.city, h.country));

  if (cityId > 0) {
    return {
      type: 'city_search',
      cityId,
      url: `https://www.agoda.com/partners/partnersearch.aspx?cid=${AGODA_CID}&city=${cityId}&txt=${encodeURIComponent(cleanName)}`,
    };
  }

  // If neither hotel nor city could be verified, REMOVE the broken URL so it never redirects to Delhi homepage
  return {
    type: 'none',
    url: null,
  };
}

async function main() {
  const cachePath = path.resolve(process.cwd(), '.cache/all-hotels.json');
  const allHotels = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  // Target any hotel whose agodaUrl is missing hid=, /hotel/, and city=
  const toFix = [];
  for (let i = 0; i < allHotels.length; i++) {
    const u = allHotels[i].agodaUrl || '';
    if (u && !u.includes('hid=') && !u.includes('/hotel/') && !u.includes('city=')) {
      toFix.push({ index: i, hotel: allHotels[i] });
    }
  }

  console.log(`\n🔍 Found ${toFix.length} hotels with broken Agoda URLs out of ${allHotels.length} total hotels.\n`);

  if (process.env.MONGODB_URI) {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas.\n');
  }

  const Hotel = mongoose.connection.collection('hotels');
  let hidCount = 0;
  let citySearchCount = 0;
  let nullCount = 0;

  const CONCURRENCY = 6;
  const mongoOps = [];

  for (let i = 0; i < toFix.length; i += CONCURRENCY) {
    const chunk = toFix.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map(async ({ index, hotel }) => {
      const res = await resolveAgoda(hotel);
      
      if (res.type === 'hid') {
        hidCount++;
        allHotels[index].agodaUrl = res.url;
        allHotels[index].agodaHotelId = res.hotelId;
        mongoOps.push({
          updateOne: {
            filter: { _id: new mongoose.Types.ObjectId(hotel._id) },
            update: { 
              $set: { 
                agodaUrl: res.url,
                agodaHotelId: res.hotelId,
              } 
            },
          },
        });
      } else if (res.type === 'city_search') {
        citySearchCount++;
        allHotels[index].agodaUrl = res.url;
        mongoOps.push({
          updateOne: {
            filter: { _id: new mongoose.Types.ObjectId(hotel._id) },
            update: { 
              $set: { agodaUrl: res.url } 
            },
          },
        });
      } else {
        nullCount++;
        delete allHotels[index].agodaUrl;
        mongoOps.push({
          updateOne: {
            filter: { _id: new mongoose.Types.ObjectId(hotel._id) },
            update: { 
              $unset: { agodaUrl: 1, agodaHotelId: 1 } 
            },
          },
        });
      }

      if ((hotel.city || '').toLowerCase() === 'thrissur' || (hotel.name || '').toLowerCase().includes('hyatt regency thrissur')) {
        console.log(`\n🎯 TARGET VERIFICATION: ${hotel.name} (${hotel.city}) -> ${res.type}: ${res.url}\n`);
      }
    }));

    await new Promise(r => setTimeout(r, 120));

    if ((i + CONCURRENCY) % 60 === 0 || i + CONCURRENCY >= toFix.length) {
      const processed = Math.min(i + CONCURRENCY, toFix.length);
      console.log(`[${processed}/${toFix.length}] Resolved: Direct HID: ${hidCount} | Scoped City: ${citySearchCount} | Nullified: ${nullCount}`);
      
      if (mongoOps.length >= 50) {
        const batch = mongoOps.splice(0, mongoOps.length);
        await Hotel.bulkWrite(batch, { ordered: false });
      }
    }
  }

  // Flush remaining ops
  if (mongoOps.length > 0) {
    await Hotel.bulkWrite(mongoOps, { ordered: false });
  }

  // Save updated cache
  fs.writeFileSync(cachePath, JSON.stringify(allHotels, null, 2));
  console.log('\n💾 Successfully updated .cache/all-hotels.json');

  console.log(`\n📊 Final Resolution Stats:`);
  console.log(`   - Direct Hotel ID (hid=): ${hidCount}`);
  console.log(`   - Scoped City Search (city=): ${citySearchCount}`);
  console.log(`   - Nullified (prevented homepage redirect): ${nullCount}`);

  await mongoose.disconnect();
  console.log('✅ MongoDB disconnected. Script complete.\n');
}

main().catch(err => {
  console.error('Fatal error in fix-broken-agoda-urls:', err);
  process.exit(1);
});
