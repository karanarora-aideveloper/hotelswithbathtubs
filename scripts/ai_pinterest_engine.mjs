import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { uploadToR2, postPinToPinterest } from './publish_ai_pin.mjs';

dotenv.config({ path: '.env.local' });

// Diverse architectural and atmospheric palettes to ensure ZERO two images ever look alike
const STYLES = [
  {
    theme: 'colonial_heritage',
    keywords: ['imperial', 'heritage', 'palace', 'colonial', 'grand'],
    describe: (hotel) => `freestanding vintage Victorian cast-iron clawfoot bathtub with burnished bronze feet, set on classic chequered black and white polished Italian marble floors. High ceilings with dark polished Burma teak wood trims, beveled antique brass mirrors, warm vintage amber wall sconces, large arched window looking out to manicured colonial gardens at twilight, crystal decanter on a small mahogany table.`
  },
  {
    theme: 'royal_opulence',
    keywords: ['leela', 'haveli', 'taj', 'mahal', 'regal', 'luxury'],
    describe: (hotel) => `deep circular sunken whirlpool jacuzzi carved into warm honey-toned Spanish Crema Marfil marble. Intricate hand-carved stone jali privacy screens, soft golden illumination from a delicate crystal chandelier above, floor-to-ceiling French windows opening to a private terrace overlooking diplomatic gardens at golden hour sunset, fresh floating deep-red rose petals in steaming water.`
  },
  {
    theme: 'modern_panoramic',
    keywords: ['aerocity', 'pullman', 'novotel', 'andaz', 'contemporary', 'modern'],
    describe: (hotel) => `sleek contemporary matte-black granite square sunken soaking tub with subtle warm LED under-rim ambient lighting. Frameless fluted glass partitions, minimalist matte brass hardware, dark charcoal slate walls, floor-to-ceiling panoramic glass windows looking out over illuminated modern city architectural facades at blue hour, luxury apothecary bath tray.`
  },
  {
    theme: 'nature_ridge_view',
    keywords: ['ridge', 'valley', 'resort', 'prime', 'view', 'garden'],
    describe: (hotel) => `modern minimalist freestanding oval matte-stone soaking tub placed right next to a full-wall panoramic glass window overlooking a lush verdant forest canopy at sunset. Natural warm cedar wood accents, smooth river stone border around the tub floor, soft steam rising into the warm evening light, artisanal ceramic tea mug on a rustic bamboo tray.`
  },
  {
    theme: 'atrium_garden_courtyard',
    keywords: ['grand', 'eros', 'spa', 'suites', 'luxe'],
    describe: (hotel) => `luxurious open-concept travertine stone jacuzzi bathtub facing an enclosed private glass atrium with exotic tropical indoor palm trees and monstera leaves. Natural skylight casting soft warm dusk light, gentle water fountain feature pouring into the steaming tub, flickering scented pillar candles on stone ledges, plush waffle-weave robe.`
  }
];

function synthesizeUniquePrompt(hotel, index = 0) {
  // Bespoke handling for Gwalior royal heritage
  if (hotel.city && hotel.city.toLowerCase().includes('gwalior')) {
    return `Generate a photorealistic vertical 2:3 travel photograph of an ultra-luxury heritage royal palace suite bathroom at ${hotel.name} in Gwalior, India. The setting features a hand-carved honey-toned Gwalior sandstone arched bathroom with a deep freestanding vintage brass-clawfoot porcelain soaking tub filled with crystal-clear steaming water and fresh floating red rose and marigold petals. Intricate filigree stone jali latticework, antique brass taps, warm ambient golden lantern lighting. A tall scalloped arch window overlooks the illuminated historic 9-acre royal estate gardens with stone fountains at dusk. Architectural Digest editorial photography, shot on Hasselblad H6D-100c, 35mm f/2.8 lens, hyper-realistic, natural textures, no people, no distorted shapes.`;
  }

  // Guaranteed style rotation: each hotel gets a completely distinct archetype
  const matchedStyle = STYLES[index % STYLES.length];

  const roomText = hotel.roomType || 'luxury executive suite';
  const tubText = hotel.tubType || 'private soaking bathtub';
  const scene = matchedStyle.describe(hotel);

  return `Generate a photorealistic vertical 2:3 travel photograph of an ultra-luxury private hotel suite bathroom at ${hotel.name} in ${hotel.city}, ${hotel.country}. The setting features a ${tubText} in a ${roomText}: ${scene} Water is crystal clear with gentle rising steam. Architectural Digest editorial photography, shot on Hasselblad H6D-100c, 35mm f/2.8 lens, natural lighting, ultra-detailed photorealistic textures, no people, no distorted shapes.`;
}

// Control Chrome Tab via AppleScript
function runChromeJs(jsCode) {
  const script = `
tell application "Google Chrome"
    repeat with w in windows
        repeat with t in tabs of w
            if URL of t starts with "https://gemini.google.com" then
                return execute t javascript "${jsCode.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"
            end if
        end repeat
    end repeat
    return "tab_not_found"
end tell
  `.trim();

  return execFileSync('osascript', ['-e', script], { maxBuffer: 25 * 1024 * 1024 }).toString().trim();
}

async function resetGeminiToFreshChat() {
  console.log(`\n🔄 Opening clean, fresh Gemini chat session...`);
  const script = `
tell application "Google Chrome"
    repeat with w in windows
        repeat with t in tabs of w
            if URL of t starts with "https://gemini.google.com" then
                set URL of t to "https://gemini.google.com/app"
                return "reset"
            end if
        end repeat
    end repeat
    return "tab_not_found"
end tell
  `.trim();

  execFileSync('osascript', ['-e', script]);

  // Wait for the fresh chat to initialize (0 images, editor ready)
  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const checkCode = `
      (function() {
          const imgs = document.querySelectorAll("img[alt*='AI generated'], img.image").length;
          const editor = document.querySelector("rich-textarea .ql-editor");
          return JSON.stringify({ imgs, hasEditor: !!editor });
      })()
    `;
    const res = runChromeJs(checkCode);
    if (res && res.includes('"imgs":0') && res.includes('"hasEditor":true')) {
      console.log(`✓ Fresh chat initialized (0 previous images). Ready for new generation.`);
      return true;
    }
  }
  console.log(`✓ Chat reset complete.`);
  return true;
}

async function sendPromptToGemini(promptText) {
  console.log(`💬 Sending unique prompt to Gemini...`);
  console.log(`Prompt: "${promptText.slice(0, 140)}..."`);

  const injectCode = `
    (function() {
        const editor = document.querySelector("rich-textarea .ql-editor");
        if (!editor) return "error:no_editor";
        editor.focus();
        document.execCommand("selectAll", false, null);
        document.execCommand("delete", false, null);
        document.execCommand("insertText", false, ${JSON.stringify(promptText)});
        editor.dispatchEvent(new Event("input", { bubbles: true }));
        
        setTimeout(() => {
            const sendBtn = document.querySelector("button[aria-label*='Send message']");
            if (sendBtn) sendBtn.click();
        }, 600);
        return "sent";
    })()
  `;

  const res = runChromeJs(injectCode);
  if (res.includes('tab_not_found')) {
    throw new Error('Gemini tab not found in Chrome. Please ensure https://gemini.google.com/app is open.');
  }
  if (res.includes('error:no_editor')) {
    throw new Error('Could not find prompt editor on Gemini tab.');
  }
}

async function waitForNewlyGeneratedImage(timeoutSeconds = 80) {
  console.log('⏳ Waiting for Gemini to generate the new image...');
  const start = Date.now();

  while ((Date.now() - start) < timeoutSeconds * 1000) {
    await new Promise((r) => setTimeout(r, 4000));

    const checkCode = `
      (function() {
          const imgs = Array.from(document.querySelectorAll("img")).filter(img => 
              (img.alt && img.alt.includes("AI generated")) ||
              (img.className && img.className.includes("image") && (img.naturalWidth > 300 || img.width > 300))
          );
          if (imgs.length === 0) return "generating";
          
          const latestImg = imgs[imgs.length - 1];
          if (!latestImg.complete || (latestImg.naturalWidth || latestImg.width) < 200) {
              return "generating";
          }
          
          const canvas = document.createElement("canvas");
          canvas.width = latestImg.naturalWidth || latestImg.width;
          canvas.height = latestImg.naturalHeight || latestImg.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(latestImg, 0, 0);
          
          try {
              const dataUrl = canvas.toDataURL("image/jpeg", 0.94);
              window.__gemini_img = dataUrl;
              return "ready:" + dataUrl.length + ":" + canvas.width + "x" + canvas.height;
          } catch(e) {
              return "error:" + e.message;
          }
      })()
    `;

    const status = runChromeJs(checkCode);
    if (status.startsWith('ready:')) {
      const parts = status.split(':');
      console.log(`✓ Brand New Image Generated! Dimensions: ${parts[2]} (data size: ${(parseInt(parts[1], 10) / 1024).toFixed(1)} KB)`);
      return true;
    }
    process.stdout.write('.');
  }

  throw new Error(`Timeout waiting for Gemini image generation after ${timeoutSeconds}s`);
}

function extractAndSaveImage(outputPath) {
  const readCode = `window.__gemini_img || ''`;
  const result = runChromeJs(readCode);

  if (!result || !result.startsWith('data:image/')) {
    throw new Error('No valid base64 image data available in Chrome window');
  }

  const base64Data = result.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(outputPath, buffer);
  console.log(`✓ Saved unique image locally: ${outputPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
  return outputPath;
}

export async function runAIPinEngine(options = {}) {
  const batchCount = typeof options === 'number' ? options : (options.count || 2);
  const targetCity = typeof options === 'object' ? options.city : '';
  const targetCountry = typeof options === 'object' ? options.country : '';
  const skipCount = typeof options === 'object' ? (options.skip || 0) : 0;

  console.log(`\n======================================================`);
  console.log(`🚀 AI PINTEREST AUTOMATION ENGINE STARTING`);
  console.log(`Count: ${batchCount} | Skip: ${skipCount} | City: ${targetCity || 'Auto'} | Country: ${targetCountry || 'Auto'}`);
  console.log(`======================================================`);

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✓ Connected to MongoDB');

  const HotelSchema = new mongoose.Schema({}, { strict: false });
  const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', HotelSchema);

  const query = { flagged: { $ne: true }, bathtubConfirmed: { $ne: false } };
  if (targetCity) {
    query.city = new RegExp(targetCity, 'i');
  } else if (targetCountry) {
    query.country = new RegExp(targetCountry, 'i');
  } else {
    const targetCities = ['Zermatt', 'Santorini', 'Positano', 'Cappadocia', 'Paris', 'Ubud', 'Manali', 'Kyoto'];
    query.city = { $in: targetCities.map((c) => new RegExp(c, 'i')) };
  }

  const hotels = await Hotel.find(query)
    .sort({ rating: -1 })
    .skip(skipCount)
    .limit(batchCount);

  if (hotels.length === 0) {
    console.log(`No hotels found for query, fetching top rated overall...`);
    const fallbacks = await Hotel.find({ flagged: { $ne: true } }).sort({ rating: -1 }).limit(batchCount);
    hotels.push(...fallbacks);
  }

  console.log(`Selected ${hotels.length} luxury hotel destinations for AI pin generation:`);
  hotels.forEach((h, i) => console.log(`  ${i + 1}. ${h.name} (${h.city}, ${h.country})`));

  const publishedPins = [];

  for (let i = 0; i < hotels.length; i++) {
    const hotel = hotels[i];
    console.log(`\n------------------------------------------------------`);
    console.log(`[${i + 1}/${hotels.length}] Processing: ${hotel.name} (${hotel.city}, ${hotel.country})`);

    // 1. Reset Gemini tab to clean state to guarantee 100% fresh generation with zero prior context
    await resetGeminiToFreshChat();

    // 2. Synthesize Bespoke Hotel-Specific Prompt
    const prompt = synthesizeUniquePrompt(hotel, i + skipCount);

    // 3. Send to Gemini in Chrome
    await sendPromptToGemini(prompt);

    // 4. Wait for generation
    await waitForNewlyGeneratedImage(85);

    // 5. Extract and save unique image
    const filename = `ai_pin_${hotel.slug || hotel.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}.jpg`;
    const localPath = path.join(process.cwd(), 'public', 'pins', filename);
    extractAndSaveImage(localPath);

    // 6. Upload to Cloudflare R2
    const r2Url = await uploadToR2(localPath, filename);

    // 7. Publish to Pinterest
    const citySlug = (hotel.city || '').toLowerCase().replace(/\s+/g, '-');
    const countrySlug = (hotel.country || 'global').toLowerCase().replace(/\s+/g, '-');
    const destUrl = `https://www.hotelswithbathtubs.com/${countrySlug}/${citySlug}?utm_source=pinterest&utm_medium=ai_pin&utm_campaign=ai_${citySlug}_${Date.now()}`;

    const title = `${hotel.name} - Luxury Bathtub & Suite in ${hotel.city}`;
    const description = `Indulge in pure romance at ${hotel.name} in ${hotel.city}, ${hotel.country}. Features breathtaking private suites with in-room bathtubs and views. Verified luxury stays at HotelsWithBathtubs.com. #${citySlug.replace(/-/g, '')} #hotelswithbathtubs #luxurytravel #honeymoon #bucketlistvacation`;

    const pinResult = await postPinToPinterest({
      title,
      description,
      link: destUrl,
      imageUrl: r2Url,
    });

    publishedPins.push({
      hotel: hotel.name,
      city: hotel.city,
      country: hotel.country,
      pinId: pinResult.pinId,
      pinUrl: pinResult.pinUrl,
      localPath,
      rateLimit: pinResult.rateLimit,
    });

    // 8. STRICT RATE LIMIT SAFETY CHECK
    const remaining = parseInt(pinResult.rateLimit.remaining, 10);
    console.log(`⚡ Rate limit remaining after post: ${remaining}`);

    if (remaining <= 2) {
      console.warn(`\n⚠️ RATE LIMIT THRESHOLD REACHED (Remaining: ${remaining})!`);
      console.warn(`Stopping immediately to adhere to Pinterest rate limits.`);
      break;
    }

    // Cooldown between posts (12 seconds) if not last item
    if (i < hotels.length - 1) {
      console.log(`⏸️ Cooldown 12s before next hotel to ensure safe pacing...`);
      await new Promise((r) => setTimeout(r, 12000));
    }
  }

  await mongoose.disconnect();
  console.log(`\n🎉 BATCH COMPLETED! Successfully created & posted ${publishedPins.length} completely unique AI Pins.`);
  return publishedPins;
}

if (process.argv[1].endsWith('ai_pinterest_engine.mjs')) {
  const args = process.argv.slice(2);
  let count = 2;
  let city = '';
  let country = '';
  let skip = 0;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--city' && args[i + 1]) city = args[++i];
    else if (args[i] === '--country' && args[i + 1]) country = args[++i];
    else if (args[i] === '--count' && args[i + 1]) count = parseInt(args[++i], 10);
    else if (args[i] === '--skip' && args[i + 1]) skip = parseInt(args[++i], 10);
    else if (!isNaN(parseInt(args[i], 10))) count = parseInt(args[i], 10);
  }

  runAIPinEngine({ count, city, country, skip }).catch((err) => {
    console.error('Fatal engine error:', err);
    process.exit(1);
  });
}
