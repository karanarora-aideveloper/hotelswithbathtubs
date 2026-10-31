import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const cachePath = path.join(rootDir, '.cache/all-hotels.json');
if (!fs.existsSync(cachePath)) {
  console.error(`Error: ${cachePath} does not exist`);
  process.exit(1);
}

const hotels = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

function titleCase(str) {
  if (!str) return '';
  return str
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

let midSentenceCount = 0;
const failures = [];

for (const hotel of hotels) {
  const cityName = titleCase(hotel.city);
  const tubType = hotel.tubType || 'Bathtub';
  const hotelName = hotel.name;

  let pageTitle = '';
  let pageDescription = '';

  if (hotel.bathtubConfirmed !== true) {
    const reportedTitle = `${hotelName} – Bathtub reported, ${cityName}`;
    const fallbackTitle = `${hotelName}, ${cityName}`;
    if (reportedTitle.length <= 65) {
      pageTitle = reportedTitle;
    } else if (fallbackTitle.length <= 65) {
      pageTitle = fallbackTitle;
    } else {
      pageTitle = hotelName;
    }

    let roomPhrase = '';
    if (hotel.roomType && hotel.roomType.trim()) {
      const rt = hotel.roomType.trim();
      if (/^the\s+/i.test(rt) || /^some\s+rooms/i.test(rt)) {
        roomPhrase = ` in ${rt}`;
      } else {
        roomPhrase = ` in the ${rt}`;
      }
    }
    const descWithRoom = roomPhrase
      ? `${hotelName} in ${cityName}. A bathtub or jetted tub is reported${roomPhrase}; check the room details before you book.`
      : '';
    const descWithoutRoom = `${hotelName} in ${cityName}. A bathtub or jetted tub is reported; check the room details before you book.`;

    if (descWithRoom && descWithRoom.length <= 155) {
      pageDescription = descWithRoom;
    } else {
      pageDescription = descWithoutRoom;
    }
  } else {
    const shortTub = tubType.split(/\s*(?:&|and|,|\/|\+)\s*/i)[0].trim() || 'Bathtub';
    const titleCandidates = [
      `${hotelName} – Room with ${tubType}, ${cityName}`,
      `${hotelName} – ${tubType}, ${cityName}`,
      `${hotelName} – Room with ${shortTub}, ${cityName}`,
      `${hotelName} – ${shortTub}, ${cityName}`,
      `${hotelName} – Bathtub, ${cityName}`,
      `${hotelName}, ${cityName}`,
      hotelName,
    ];

    pageTitle = titleCandidates.find((c) => c.length <= 65) || hotelName;

    const roomType = hotel.roomType || 'Room with Bathtub';
    let pDesc = `Stay at ${hotelName} in ${cityName}. Book the ${roomType} for an in-room ${tubType.toLowerCase()}.`;
    if (pDesc.length > 155) {
      pDesc = `Book the ${roomType} at ${hotelName}, ${cityName} for an in-room ${tubType.toLowerCase()}.`;
      if (pDesc.length > 155) {
        pDesc = `Private in-room ${tubType.toLowerCase()} at ${hotelName} in ${cityName}.`;
        if (pDesc.length > 155) {
          pDesc = `In-room bathtub at ${hotelName}, ${cityName}.`;
          if (pDesc.length > 155) {
            pDesc = `Hotel rooms with in-room bathtubs in ${cityName}.`;
          }
        }
      }
    }
    pageDescription = pDesc;
  }

  // Verification checks:
  // 1. Must end with "."
  if (!pageDescription.endsWith('.')) {
    midSentenceCount++;
    failures.push({ hotel: hotelName, city: cityName, desc: pageDescription, issue: 'Does not end with "."' });
  }

  // 2. Must not end with incomplete phrase like "check the.", "check.", "the.", "before you.", etc.
  if (/(\bcheck the|\bcheck|\bthe|\bbefore you|\bfor an|\bdetails)\.\s*$/i.test(pageDescription)) {
    midSentenceCount++;
    failures.push({ hotel: hotelName, city: cityName, desc: pageDescription, issue: 'Incomplete trailing words' });
  }
}

console.log(`Scanned ${hotels.length} hotel meta descriptions.`);
console.log(`Incomplete / mid-sentence descriptions found: ${midSentenceCount}`);

if (failures.length > 0) {
  console.error('\nFailures detected:');
  for (const f of failures.slice(0, 10)) {
    console.error(`- [${f.issue}] ${f.hotel} (${f.city}): "${f.desc}"`);
  }
  process.exit(1);
}

console.log('PASS: 100% of hotel meta descriptions end with complete sentences.');
