// Data for the destinations hub (/destinations) and the slim footer: every city with hotels,
// grouped by travel region, plus one entry per country. Reads MongoDB or the build snapshot.
import connectToDatabase from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import { resolveCountry, slugify } from '@/lib/utils';

// Region groupings for better destination scanning
const regionMapping: Record<string, string> = {
  'Rajasthan': 'North India',
  'Himachal Pradesh': 'North India',
  'Punjab': 'North India',
  'Uttarakhand': 'North India',
  'Uttar Pradesh': 'North India',
  'Delhi NCR': 'North India',

  'Kerala': 'South India',
  'Tamil Nadu': 'South India',
  'Karnataka': 'South India',
  'Goa': 'South India',
  'Pondicherry': 'South India',
  'Puducherry': 'South India',

  'Maharashtra': 'West & Central India',
  'Gujarat': 'West & Central India',
  'Madhya Pradesh': 'West & Central India',
  'Daman and Diu': 'West & Central India',

  'West Bengal': 'East & North East',
  'Meghalaya': 'East & North East',
  'Odisha': 'East & North East',

  // United States & North America
  'United States': 'United States & North America',
  'USA': 'United States & North America',
  'Canada': 'United States & North America',
  'Mexico': 'United States & North America',

  // United Kingdom & Europe
  'United Kingdom': 'United Kingdom & Europe',
  'UK': 'United Kingdom & Europe',
  'France': 'United Kingdom & Europe',
  'Italy': 'United Kingdom & Europe',
  'Spain': 'United Kingdom & Europe',
  'Netherlands': 'United Kingdom & Europe',
  'Germany': 'United Kingdom & Europe',
  'Switzerland': 'United Kingdom & Europe',
  'Greece': 'United Kingdom & Europe',
  'Austria': 'United Kingdom & Europe',
  'Czechia': 'United Kingdom & Europe',
  'Hungary': 'United Kingdom & Europe',
  'Ireland': 'United Kingdom & Europe',
  'Portugal': 'United Kingdom & Europe',
  'Iceland': 'United Kingdom & Europe',
  'Norway': 'United Kingdom & Europe',
  'Finland': 'United Kingdom & Europe',
  'Sweden': 'United Kingdom & Europe',
  'Denmark': 'United Kingdom & Europe',
  'Croatia': 'United Kingdom & Europe',
  'Poland': 'United Kingdom & Europe',
  'Slovenia': 'United Kingdom & Europe',
  'Estonia': 'United Kingdom & Europe',
  'Latvia': 'United Kingdom & Europe',
  'Lithuania': 'United Kingdom & Europe',
  'Georgia': 'United Kingdom & Europe',
  'Cyprus': 'United Kingdom & Europe',
  'Malta': 'United Kingdom & Europe',
  'Montenegro': 'United Kingdom & Europe',
  'Albania': 'United Kingdom & Europe',
  'Bosnia and Herzegovina': 'United Kingdom & Europe',
  'North Macedonia': 'United Kingdom & Europe',
  'Greenland': 'United Kingdom & Europe',
  'Faroe Islands': 'United Kingdom & Europe',

  // Asia & Middle East
  'Singapore': 'Asia & Middle East',
  'United Arab Emirates': 'Asia & Middle East',
  'UAE': 'Asia & Middle East',
  'Thailand': 'Asia & Middle East',
  'Japan': 'Asia & Middle East',
  'Indonesia': 'Asia & Middle East',
  'Malaysia': 'Asia & Middle East',
  'Maldives': 'Asia & Middle East',
  'Turkey': 'Asia & Middle East',
  'South Korea': 'Asia & Middle East',
  'Taiwan': 'Asia & Middle East',
  'Vietnam': 'Asia & Middle East',
  'Sri Lanka': 'Asia & Middle East',
  'Qatar': 'Asia & Middle East',
  'Oman': 'Asia & Middle East',
  'Bahrain': 'Asia & Middle East',
  'Jordan': 'Asia & Middle East',
  'Saudi Arabia': 'Asia & Middle East',
  'Philippines': 'Asia & Middle East',
  'Cambodia': 'Asia & Middle East',
  'Laos': 'Asia & Middle East',
  'Nepal': 'Asia & Middle East',
  'Azerbaijan': 'Asia & Middle East',
  'Uzbekistan': 'Asia & Middle East',
  'Kazakhstan': 'Asia & Middle East',
  'Mongolia': 'Asia & Middle East',

  // Tropical Islands & Southern Escapes
  'French Polynesia': 'Tropical Islands & Southern Escapes',
  'Seychelles': 'Tropical Islands & Southern Escapes',
  'Mauritius': 'Tropical Islands & Southern Escapes',
  'Fiji': 'Tropical Islands & Southern Escapes',
  'Saint Lucia': 'Tropical Islands & Southern Escapes',
  'Jamaica': 'Tropical Islands & Southern Escapes',
  'Bahamas': 'Tropical Islands & Southern Escapes',
  'Dominican Republic': 'Tropical Islands & Southern Escapes',
  'Turks and Caicos': 'Tropical Islands & Southern Escapes',
  'Barbados': 'Tropical Islands & Southern Escapes',
  'Aruba': 'Tropical Islands & Southern Escapes',
  'Australia': 'Tropical Islands & Southern Escapes',
  'New Zealand': 'Tropical Islands & Southern Escapes',
  'Costa Rica': 'Tropical Islands & Southern Escapes',
  'Brazil': 'Tropical Islands & Southern Escapes',
  'South Africa': 'Tropical Islands & Southern Escapes',
  'Morocco': 'Tropical Islands & Southern Escapes',
  'Tanzania': 'Tropical Islands & Southern Escapes',
  'Chile': 'Tropical Islands & Southern Escapes',
  'Argentina': 'Tropical Islands & Southern Escapes',
  'Peru': 'Tropical Islands & Southern Escapes',
  'Colombia': 'Tropical Islands & Southern Escapes',
  'Tunisia': 'Tropical Islands & Southern Escapes',
  'Egypt': 'Tropical Islands & Southern Escapes',
  'Belize': 'Tropical Islands & Southern Escapes',
  'Guatemala': 'Tropical Islands & Southern Escapes',
  'Panama': 'Tropical Islands & Southern Escapes',
  'Kenya': 'Tropical Islands & Southern Escapes',
  'Rwanda': 'Tropical Islands & Southern Escapes',
  'Zimbabwe': 'Tropical Islands & Southern Escapes',
  'Namibia': 'Tropical Islands & Southern Escapes',
  'Cape Verde': 'Tropical Islands & Southern Escapes',
  'Bermuda': 'Tropical Islands & Southern Escapes',
  'Cook Islands': 'Tropical Islands & Southern Escapes',
  'Samoa': 'Tropical Islands & Southern Escapes',
  'Vanuatu': 'Tropical Islands & Southern Escapes',
  'New Caledonia': 'Tropical Islands & Southern Escapes',
  'Madagascar': 'Tropical Islands & Southern Escapes',
  'Mozambique': 'Tropical Islands & Southern Escapes',
  'Botswana': 'Tropical Islands & Southern Escapes',
  'Zambia': 'Tropical Islands & Southern Escapes',
  'Honduras': 'Tropical Islands & Southern Escapes',
  'Nicaragua': 'Tropical Islands & Southern Escapes',
  'Curacao': 'Tropical Islands & Southern Escapes',
  'Curaçao': 'Tropical Islands & Southern Escapes',
  'Antigua and Barbuda': 'Tropical Islands & Southern Escapes',
  'Ecuador': 'Tropical Islands & Southern Escapes',
  'Uruguay': 'Tropical Islands & Southern Escapes',
  'Bolivia': 'Tropical Islands & Southern Escapes',
  'Paraguay': 'Tropical Islands & Southern Escapes',
};


const stateMapping: Record<string, string> = {
  'Udaipur': 'Rajasthan',
  'Jaipur': 'Rajasthan',
  'Mount Abu': 'Rajasthan',
  'Jaisalmer': 'Rajasthan',
  'Jodhpur': 'Rajasthan',
  
  'Manali': 'Himachal Pradesh',
  'Shimla': 'Himachal Pradesh',
  'Dharamshala': 'Himachal Pradesh',
  
  'Munnar': 'Kerala',
  'Kochi': 'Kerala',
  'Wayanad': 'Kerala',
  'Alleppey': 'Kerala',
  'Varkala': 'Kerala',
  'Kovalam': 'Kerala',

  'Coorg': 'Karnataka',
  'Chikmagalur': 'Karnataka',
  'Gokarna': 'Karnataka',
  'Bangalore': 'Karnataka',

  'Mussoorie': 'Uttarakhand',
  'Rishikesh': 'Uttarakhand',
  'Nainital': 'Uttarakhand',
  'Dehradun': 'Uttarakhand',
  'Haridwar': 'Uttarakhand',
  'Lansdowne': 'Uttarakhand',

  'Pondicherry': 'Pondicherry',
  
  'Ooty': 'Tamil Nadu',
  'Kodaikanal': 'Tamil Nadu',
  'Coimbatore': 'Tamil Nadu',
  'Mahabalipuram': 'Tamil Nadu',
  'Yercaud': 'Tamil Nadu',
  
  'Mumbai': 'Maharashtra',
  'Lonavala': 'Maharashtra',
  'Pune': 'Maharashtra',
  'Mahabaleshwar': 'Maharashtra',
  'Alibaug': 'Maharashtra',
  'Panchgani': 'Maharashtra',
  'Karjat': 'Maharashtra',
  'Lavasa': 'Maharashtra',
  'Igatpuri': 'Maharashtra',
  'Nashik': 'Maharashtra',
  'Panvel': 'Maharashtra',
  'Kolhapur': 'Maharashtra',
  
  'Goa': 'Goa',
  'Panjim': 'Goa',
  'Calangute': 'Goa',
  
  'New Delhi': 'Delhi NCR',
  'Gurgaon': 'Delhi NCR',
  'Faridabad': 'Delhi NCR',
  'Mahipalpur': 'Delhi NCR',
  'Paharganj': 'Delhi NCR',
  
  'Kolkata': 'West Bengal',
  'Darjeeling': 'West Bengal',
  'Siliguri': 'West Bengal',
  'Digha': 'West Bengal',
  'Mandarmani': 'West Bengal',
  
  'Ahmedabad': 'Gujarat',
  'Gandhinagar': 'Gujarat',
  'Rajkot': 'Gujarat',
  'Saputara': 'Gujarat',
  
  'Bhopal': 'Madhya Pradesh',
  'Indore': 'Madhya Pradesh',
  'Gwalior': 'Madhya Pradesh',
  
  'Amritsar': 'Punjab',
  'Chandigarh': 'Punjab',
  'Zirakpur': 'Punjab',
  
  'Agra': 'Uttar Pradesh',
  'Mathura': 'Uttar Pradesh',
  
  'Puri': 'Odisha',
  'Shillong': 'Meghalaya',
  'Daman': 'Daman and Diu',
};

export type DirectoryCity = { city: string; country: string; countrySlug: string; citySlug: string; hotelCount: number };
export type DirectoryCountry = { name: string; slug: string; hotelCount: number };

export const REGION_ORDER = [
  'United States & North America',
  'United Kingdom & Europe',
  'Asia & Middle East',
  'Tropical Islands & Southern Escapes',
  'North India',
  'South India',
  'West & Central India',
  'East & North East',
];

let cached: Promise<{ regions: Record<string, DirectoryCity[]>; countries: DirectoryCountry[]; cities: DirectoryCity[] }> | null = null;

export function getDestinationsDirectory() {
  if (!cached) cached = build();
  return cached;
}

async function build() {
  await connectToDatabase();
  const rows: any[] = await Hotel.aggregate([
    { $match: { flagged: { $ne: true } } },
    { $group: { _id: { city: '$city', country: '$country' }, hotelCount: { $sum: 1 } } },
  ]);

  // one entry per country-slug/city-slug (e.g. "UK" and "United Kingdom" merge)
  const cityMap = new Map<string, DirectoryCity>();
  for (const r of rows) {
    const city = r._id.city, country = r._id.country;
    if (!city || !country) continue;
    const countrySlug = resolveCountry(country).slug, citySlug = slugify(city);
    const key = `${countrySlug}/${citySlug}`;
    const existing = cityMap.get(key);
    if (existing) existing.hotelCount += r.hotelCount;
    else cityMap.set(key, { city, country, countrySlug, citySlug, hotelCount: r.hotelCount });
  }
  const cities = [...cityMap.values()].sort((a, b) => b.hotelCount - a.hotelCount);

  const regions: Record<string, DirectoryCity[]> = Object.fromEntries(REGION_ORDER.map((r) => [r, [] as DirectoryCity[]]));
  for (const c of cities) {
    const isIndia = c.country.toLowerCase() === 'india';
    const sub = isIndia ? stateMapping[c.city] || 'North India' : c.country;
    const region = regionMapping[sub] || regionMapping[c.country] || (isIndia ? 'North India' : 'United Kingdom & Europe');
    (regions[region] ||= []).push(c);
  }

  const countryMap = new Map<string, DirectoryCountry>();
  for (const c of cities) {
    const info = resolveCountry(c.country);
    const e = countryMap.get(info.slug);
    if (e) e.hotelCount += c.hotelCount;
    else countryMap.set(info.slug, { name: info.displayName, slug: info.slug, hotelCount: c.hotelCount });
  }
  const countries = [...countryMap.values()].sort((a, b) => b.hotelCount - a.hotelCount);
  return { regions, countries, cities };
}
