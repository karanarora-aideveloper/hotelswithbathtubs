import fs from 'fs';
import path from 'path';

function slugify(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/&+/g, 'and')
    .replace(/['’]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const auditPath = path.resolve(process.cwd(), 'public/audits/hotels_master_audit_latest.json');
const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
const hotels = JSON.parse(fs.readFileSync('.cache/all-hotels.json', 'utf8'));
const hotelById = new Map(hotels.map((h) => [String(h._id), h]));

for (const r of audit.records) {
  const h = hotelById.get(String(r.id));
  if (h) {
    const cSlug = slugify(h.city);
    const countrySlug = slugify(h.country);
    const hSlug = slugify(h.slug || h.name);
    r.liveUrl = `https://www.hotelswithbathtubs.com/${countrySlug}/${cSlug}/${hSlug}`;
  }
}

fs.writeFileSync(auditPath, JSON.stringify(audit, null, 2));

const escapeCsv = (val) => {
  const s = String(val ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const csvHeaders = [
  'Row_ID', 'Todays_Date', 'Audit_Iteration', 'Audit_Status', 'Quality_Score',
  'What_Was_Fixed_Today', 'Remaining_Flags', 'Hotel_Name', 'City', 'Country',
  'Neighborhood', 'Property_Type', 'Price', 'Rating', 'Reviews_Count',
  'Tub_Type', 'Room_Type', 'Primary_Direct_OTA', 'Agoda_Status', 'MMT_Status',
  'Booking_Status', 'Airbnb_Status', 'Trip_Status', 'Image_Source',
  'Live_URL', 'Primary_Booking_URL', 'Image_URL',
];

const csvRows = [csvHeaders.join(',')];
for (const r of audit.records) {
  csvRows.push(
    [
      r.rowId, r.todaysDate, r.auditIteration, r.auditStatus, r.qualityScore,
      r.whatWasFixedToday, r.remainingFlags, r.name, r.city, r.country,
      r.neighborhood, r.propertyType, r.price, r.rating, r.reviewsCount,
      r.tubType, r.roomType, r.primaryDirectOta, r.agodaStatus, r.mmtStatus,
      r.bookingStatus, r.airbnbStatus, r.tripStatus, r.imageSource,
      r.liveUrl, r.primaryBookingUrl, r.imageUrl,
    ]
      .map(escapeCsv)
      .join(',')
  );
}

fs.writeFileSync('public/audits/hotels_master_audit_latest.csv', csvRows.join('\n'));
fs.writeFileSync('public/audits/hotels_master_audit_2026-10-12_iter1.csv', csvRows.join('\n'));
console.log('Updated audit CSVs and JSON with clean liveUrls!');
