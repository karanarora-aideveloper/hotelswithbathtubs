import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

/**
 * Escapes XML special characters for SVG text.
 */
function escapeXml(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates a high-converting vertical 2:3 Pinterest pin (1000x1500px).
 * Composites the hotel photo with an editorial luxury card overlay.
 *
 * @param {Object} options
 * @param {string} options.imageUrl - Public URL of the hotel image on R2 or web
 * @param {string} options.hotelName - Name of the hotel
 * @param {string} options.city - City of the hotel
 * @param {string} options.country - Country of the hotel
 * @param {string} [options.roomType] - Room type or tub type
 * @param {string} [options.outputPath] - Local path to save output image
 * @returns {Promise<string>} Path to generated image
 */
export async function generatePinImage({
  imageUrl,
  hotelName,
  city,
  country,
  roomType = 'Deluxe Suite with Bathtub',
  outputPath,
}) {
  const width = 1000;
  const height = 1500;

  // 1. Fetch source image
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch source image from ${imageUrl}: ${response.statusText}`);
  }
  const sourceBuffer = Buffer.from(await response.arrayBuffer());

  // 2. Prepare the background base image resized to 1000x1500
  const baseImage = await sharp(sourceBuffer)
    .resize(width, height, {
      fit: 'cover',
      position: 'center',
    })
    .toBuffer();

  // 3. Construct the luxury editorial SVG overlay
  const safeCity = escapeXml(city.toUpperCase());
  const safeCountry = escapeXml(country.toUpperCase());
  const safeRoomType = escapeXml(roomType || 'Private In-Room Bathtub');

  // Dynamic font sizing based on hotel name length
  const nameLen = hotelName.length;
  let titleFontSize = 52;
  let titleY = 1110;
  let titleSvg = '';

  if (nameLen > 32) {
    titleFontSize = 38;
    // Split into 2 lines if possible
    const words = hotelName.split(' ');
    const mid = Math.ceil(words.length / 2);
    const line1 = escapeXml(words.slice(0, mid).join(' '));
    const line2 = escapeXml(words.slice(mid).join(' '));
    titleSvg = `
      <text x="80" y="1080" font-family="Georgia, 'Times New Roman', serif" font-size="${titleFontSize}" font-weight="900" fill="#ffffff">${line1}</text>
      <text x="80" y="1125" font-family="Georgia, 'Times New Roman', serif" font-size="${titleFontSize}" font-weight="900" fill="#ffffff">${line2}</text>
    `;
  } else if (nameLen > 24) {
    titleFontSize = 42;
    titleSvg = `<text x="80" y="1105" font-family="Georgia, 'Times New Roman', serif" font-size="${titleFontSize}" font-weight="900" fill="#ffffff">${escapeXml(hotelName)}</text>`;
  } else {
    titleFontSize = 52;
    titleSvg = `<text x="80" y="1105" font-family="Georgia, 'Times New Roman', serif" font-size="${titleFontSize}" font-weight="900" fill="#ffffff">${escapeXml(hotelName)}</text>`;
  }

  const svgOverlay = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Top subtle dark vignette for badge -->
        <linearGradient id="topVignette" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#000000" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </linearGradient>

        <!-- Bottom editorial gradient card -->
        <linearGradient id="bottomCard" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0a111e" stop-opacity="0"/>
          <stop offset="25%" stop-color="#0a111e" stop-opacity="0.85"/>
          <stop offset="60%" stop-color="#070c14" stop-opacity="0.97"/>
          <stop offset="100%" stop-color="#05080f" stop-opacity="1.0"/>
        </linearGradient>

        <!-- Golden highlight line -->
        <linearGradient id="goldLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#f59e0b" stop-opacity="0"/>
          <stop offset="50%" stop-color="#f59e0b" stop-opacity="1"/>
          <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
        </linearGradient>
      </defs>

      <!-- Top Vignette -->
      <rect x="0" y="0" width="${width}" height="250" fill="url(#topVignette)"/>

      <!-- Top Brand Tag -->
      <rect x="40" y="40" width="300" height="48" rx="24" fill="#0f172a" fill-opacity="0.85" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="70" y="71" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#f59e0b" letter-spacing="1.5">
        HOTELS WITH BATHTUBS
      </text>

      <!-- Verified Badge Top Right -->
      <rect x="740" y="40" width="220" height="48" rx="24" fill="#059669" fill-opacity="0.9" stroke="#ffffff" stroke-width="1.2"/>
      <text x="850" y="70" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="700" fill="#ffffff" letter-spacing="1">
        ✓ 100% VERIFIED TUB
      </text>

      <!-- Bottom Card Overlay -->
      <rect x="0" y="800" width="${width}" height="700" fill="url(#bottomCard)"/>

      <!-- Accent Divider Line -->
      <rect x="80" y="980" width="840" height="2" fill="url(#goldLine)"/>

      <!-- Destination Subtitle -->
      <text x="80" y="1030" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800" fill="#38bdf8" letter-spacing="3">
        📍 ${safeCity}, ${safeCountry}
      </text>

      <!-- Hotel Name (Big bold headline) -->
      ${titleSvg}

      <!-- Feature Pill / Highlights -->
      <rect x="80" y="1165" width="840" height="60" rx="14" fill="#1e293b" fill-opacity="0.9" stroke="#334155" stroke-width="1.5"/>
      <text x="500" y="1203" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700" fill="#fde68a" letter-spacing="1">
        🛁 ${safeRoomType} • Romantic Staycation
      </text>

      <!-- Call to Action Banner -->
      <rect x="80" y="1260" width="840" height="90" rx="18" fill="#e60023" />
      <text x="500" y="1316" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="#ffffff" letter-spacing="1">
        VIEW VERIFIED ROOMS &amp; PRICES ➔
      </text>

      <!-- Footer Brand Watermark -->
      <text x="500" y="1420" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="600" fill="#94a3b8" letter-spacing="1.5">
        www.hotelswithbathtubs.com • The Couple&apos;s Travel Directory
      </text>
    </svg>
  `;

  // 4. Composite the overlay onto the base image
  const finalImage = await sharp(baseImage)
    .composite([
      {
        input: Buffer.from(svgOverlay),
        top: 0,
        left: 0,
      },
    ])
    .jpeg({ quality: 90 })
    .toBuffer();

  // 5. Save output
  const destPath = outputPath || path.join(process.cwd(), 'scratch', `pin_${Date.now()}.jpg`);
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(destPath, finalImage);
  return destPath;
}

// CLI Test Execution
if (process.argv.includes('--test')) {
  console.log('Testing 2:3 Vertical Pin Generation with sharp...');
  generatePinImage({
    imageUrl: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/luxury-bathtub-budapest-matild-palace.webp',
    hotelName: 'Matild Palace Luxury Collection',
    city: 'Budapest',
    country: 'Hungary',
    roomType: 'Signature Jacuzzi Suite',
    outputPath: path.join(process.cwd(), 'scratch', 'test_pin_budapest.jpg'),
  })
    .then((savedPath) => {
      console.log(`Pin created successfully at: ${savedPath}`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Failed to create pin:', err);
      process.exit(1);
    });
}
