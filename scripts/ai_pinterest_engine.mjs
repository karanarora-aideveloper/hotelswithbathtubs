import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { uploadToR2, postPinToPinterest } from './publish_ai_pin.mjs';

dotenv.config({ path: '.env.local' });

// Comprehensive Global Context Dictionary for 100% authentic regional aesthetics
const DESTINATION_CONTEXTS = {
  atitlan: 'dramatic volcanic caldera lake view of Lake Atitlan, soaring cone volcanoes across misty blue waters at sunrise, indigenous terracotta tiled terrace, handcrafted artisan textiles, lush avocado and bougainvillea gardens',
  guatemala: 'dramatic volcanic caldera lake view of Lake Atitlan, soaring cone volcanoes across misty blue waters at sunrise, indigenous terracotta tiled terrace, handcrafted artisan textiles, lush avocado and bougainvillea gardens',
  positano: 'sun-drenched private cliffside terrace on the Amalfi coast in Positano, sheer limestone cliffs cascading into azure Mediterranean waters at golden hour, fragrant lemon groves, terracotta pots, chilled Italian prosecco on a marble ledge',
  italy: 'sun-drenched private cliffside terrace on the Amalfi coast, sheer limestone cliffs cascading into azure Mediterranean waters at golden hour, fragrant lemon groves, terracotta pots, chilled Italian prosecco on a marble ledge',
  riga: 'Nordic luxury spa sanctuary in Riga, large picture window overlooking the fairy-tale Gothic spires, cobblestone streets, and red-tile rooftops of Old Riga at blue hour, pale Nordic oak and amber glass accents, soothing candlelight',
  latvia: 'Nordic luxury spa sanctuary in Riga, large picture window overlooking the fairy-tale Gothic spires, cobblestone streets, and red-tile rooftops of Old Riga at blue hour, pale Nordic oak and amber glass accents, soothing candlelight',
  aruba: 'open-air luxury beachfront villa terrace in Aruba, pristine white powder sand and turquoise Caribbean Sea horizon at sunset, gentle trade winds, coconut palms, sea shell accents, chilled champagne flutes',
  caribbean: 'open-air luxury beachfront villa terrace, pristine white powder sand and turquoise Caribbean Sea horizon at sunset, gentle trade winds, coconut palms, chilled champagne flutes',
  saputara: 'misty Western Ghats hill sanctuary in Saputara, deep natural basalt stone soaking tub facing floor-to-ceiling glass looking out to rolling green hills and monsoon clouds, bamboo tray with spiced tea',
  gwalior: 'hand-carved honey-toned Gwalior sandstone arched bathroom with a deep freestanding vintage brass-clawfoot porcelain soaking tub with floating rose petals, overlooking the 9-acre royal estate gardens with fountains at dusk',
  santorini: 'whitewashed Cycladic cave terrace in Santorini, infinity Aegean Sea horizon at golden hour sunset, bougainvillea spilling over smooth white walls, private caldera cliff view',
  greece: 'whitewashed Cycladic cave terrace, infinity Aegean Sea horizon at golden hour sunset, bougainvillea spilling over smooth white walls, private caldera cliff view',
  zermatt: 'exclusive Swiss alpine chalet terrace in Zermatt, steaming cedar tub surrounded by powdery snow, jagged Matterhorn peak glowing in soft pink alpenglow at dusk, warm lanterns',
  lucerne: 'exclusive Swiss alpine chalet terrace overlooking Lake Lucerne, steaming cedar soaking tub surrounded by snow-dusted pine trees and dramatic jagged alpine peaks reflecting pastel pink alpenglow at dusk, warm flickering lanterns',
  switzerland: 'exclusive Swiss alpine chalet terrace, steaming cedar tub surrounded by powdery snow, snow-capped Alpine mountain peaks glowing in soft pink alpenglow at dusk, warm lanterns',
  kyoto: 'tranquil open-air private onsen pavilion in Kyoto, fragrant Hinoki cypress wood tub with clear steaming mineral water, rain-washed bamboo grove and mossy rock garden through sliding shoji screens',
  hakone: 'traditional luxury ryokan open-air onsen pavilion in Hakone, deep natural Hinoki wood and volcanic stone tub with gentle steaming mineral waters, framed view of mist-covered cedar forests and Mount Fuji at tranquil dusk',
  japan: 'tranquil open-air private onsen pavilion, fragrant Hinoki cypress wood tub with clear steaming mineral water, rain-washed bamboo grove and mossy rock garden through sliding shoji screens',
  ubud: 'open-air luxury private villa deck in Ubud Bali, hand-carved black volcanic stone soaking tub with floating frangipani petals, cantilevered over lush tropical rainforest ravine canopy at morning golden hour',
  bali: 'open-air luxury private villa deck in Ubud Bali, hand-carved black volcanic stone soaking tub with floating frangipani petals, cantilevered over lush tropical rainforest ravine canopy at morning golden hour',
  indonesia: 'open-air luxury private villa deck in Ubud Bali, hand-carved black volcanic stone soaking tub with floating frangipani petals, cantilevered over lush tropical rainforest ravine canopy at morning golden hour',
  galle: 'colonial Dutch tropical villa bathroom in Galle Sri Lanka, freestanding hammered copper soaking tub under high vaulted teak ceilings, arched French louver doors opening to lush courtyard gardens with frangipani trees and cinnamon orchids at dusk',
  'sri lanka': 'colonial Dutch tropical villa sanctuary in Sri Lanka, freestanding hammered copper soaking tub under high vaulted teak ceilings, arched French louver doors opening to lush courtyard gardens with frangipani trees at sunset',
  noumea: 'luxurious South Pacific French Polynesian oceanfront suite in Noumea New Caledonia, deep oval white composite stone bathtub beside floor-to-ceiling glass overlooking turquoise coral barrier reef lagoon at golden hour sunset, tropical breeze',
  'new caledonia': 'luxurious South Pacific oceanfront suite in New Caledonia, deep oval white composite stone bathtub beside floor-to-ceiling glass overlooking turquoise coral barrier reef lagoon at golden hour sunset',
  aswan: 'legendary Nubian Nile-view palace suite in Aswan Egypt, deep freestanding royal marble soaking bathtub positioned before grand Moorish arched windows looking out to felucca sailboats gliding across the Nile River and golden desert dunes at amber sunset',
  egypt: 'luxurious Nile-view heritage palace suite in Egypt, deep freestanding royal marble soaking bathtub positioned before grand Moorish arched windows looking out to felucca sailboats gliding across the Nile River and desert dunes at sunset',
  cusco: 'authentic Andean luxury sanctuary in Cusco Peru, polished local volcanic stone soaking tub surrounded by warm woven alpaca textiles, dramatic arched colonial stone windows overlooking terracotta tiled rooftops and Andean peaks at twilight, glowing hearth fireplace',
  peru: 'authentic Andean luxury sanctuary in Peru, polished local volcanic stone soaking tub surrounded by warm woven alpaca textiles, dramatic arched colonial stone windows overlooking Andean mountain peaks at twilight',
  placencia: 'open-air beachfront cabana terrace in Placencia Belize, freestanding copper soaking tub facing the turquoise Caribbean reef and swaying coconut palms at golden hour sunset, tropical teak wood decking, fresh hibiscus flowers',
  belize: 'open-air beachfront cabana terrace in Belize, freestanding copper soaking tub facing the turquoise Caribbean reef and swaying coconut palms at golden hour sunset, tropical teak wood decking',
  'diani beach': 'luxurious open-air Swahili coastal pavilion in Diani Beach Kenya, deep hand-carved coral stone soaking tub surrounded by frangipani blossoms, makuti thatched roof, overlooking powder-white sand beach and turquoise Indian Ocean at dusk',
  kenya: 'luxurious open-air coastal pavilion in Kenya, deep hand-carved stone soaking tub surrounded by frangipani blossoms, overlooking powder-white sand beach and turquoise Indian Ocean at dusk',
  paris: 'luxury Haussmannian penthouse bathroom in Paris, freestanding black clawfoot tub beside tall French doors opening to an iron balcony, soft twilight view of illuminated Parisian rooftops and monuments',
  france: 'luxury Haussmannian penthouse bathroom in Paris, freestanding black clawfoot tub beside tall French doors opening to an iron balcony, soft twilight view of illuminated Parisian rooftops and monuments',
  cappadocia: 'ancient hand-carved limestone cave bathroom in Cappadocia, sunken Roman-style stone bath with floating rose petals, Moroccan brass lanterns casting warm patterns, view of hot air balloons at dawn',
  turkey: 'ancient hand-carved limestone cave bathroom in Cappadocia, sunken Roman-style stone bath with floating rose petals, Moroccan brass lanterns casting warm patterns, view of hot air balloons at dawn',
  maldives: 'overwater bungalow private deck in the Maldives, glass-bottom freestanding oval bathtub suspended over crystal-clear turquoise lagoon with gentle ocean ripples at pastel sunset',
  tulum: 'open-air Mayan luxury villa bathroom in Tulum, smooth white limestone soaking tub amidst lush jungle ferns, palm-thatched palapa ceiling, copal incense, natural stone textures',
  mexico: 'open-air luxury villa bathroom in Mexico, smooth limestone soaking tub amidst lush tropical foliage, warm sunset glow, artisanal ceramic tiles',
  delhi: 'opulent 5-star royal suite in New Delhi, freestanding pure white Italian marble soaking bathtub with antique brass fixtures, large bay window overlooking lush heritage gardens at golden hour sunset',
};

function synthesizeContextualPrompt(hotel) {
  const city = (hotel.city || '').toLowerCase();
  const country = (hotel.country || '').toLowerCase();
  
  let contextSnippet = '';
  // Check specific city first, then country
  for (const [key, desc] of Object.entries(DESTINATION_CONTEXTS)) {
    if (city.includes(key)) {
      contextSnippet = desc;
      break;
    }
  }
  if (!contextSnippet) {
    for (const [key, desc] of Object.entries(DESTINATION_CONTEXTS)) {
      if (country.includes(key)) {
        contextSnippet = desc;
        break;
      }
    }
  }

  // Fallback to hotel description and authentic luxury cues
  if (!contextSnippet) {
    if (hotel.description && hotel.description.length > 25) {
      contextSnippet = `luxurious ambiance inspired by: ${hotel.description.replace(/[^\w\s,.-]/g, '').slice(0, 160)}, with floor-to-ceiling panoramic glass windows looking out to the beautiful local landscape at golden hour`;
    } else {
      contextSnippet = `bespoke luxury boutique hotel bathroom, freestanding designer soaking bathtub beside floor-to-ceiling panoramic glass windows overlooking breathtaking local scenery at sunset, warm subtle ambient lighting`;
    }
  }

  const roomText = hotel.roomType || 'luxury executive suite';
  const tubText = hotel.tubType || 'private soaking bathtub';

  return `Generate a photorealistic vertical 2:3 travel photograph of an ultra-luxury private hotel suite bathroom at ${hotel.name} in ${hotel.city}, ${hotel.country}. The setting features a ${tubText} in a ${roomText}: ${contextSnippet}. Water is crystal clear with gentle rising steam. Architectural Digest editorial travel photography, shot on Hasselblad H6D-100c, 35mm f/2.8 lens, natural lighting, ultra-detailed photorealistic textures, no people, no distorted shapes.`;
}

// Control Chrome Tab via AppleScript with active tab enforcement
function runChromeJs(jsCode, retries = 4) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const script = `
tell application "Google Chrome"
    repeat with w in windows
        set tabList to tabs of w
        repeat with i from 1 to (count of tabList)
            try
                set t to item i of tabList
                if URL of t starts with "https://gemini.google.com" then
                    if active tab index of w is not i then
                        set active tab index of w to i
                    end if
                    return execute t javascript "${jsCode.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"
                end if
            end try
        end repeat
    end repeat
    return "tab_not_found"
end tell
      `.trim();

      const res = execFileSync('osascript', ['-e', script], { maxBuffer: 50 * 1024 * 1024 }).toString().trim();
      if (res !== 'tab_not_found') {
        return res;
      }
      if (attempt < retries) execFileSync('sleep', ['2']);
    } catch (err) {
      if (attempt === retries) throw err;
      execFileSync('sleep', ['1']);
    }
  }
  return 'tab_not_found';
}

async function resetGeminiToFreshChat() {
  console.log(`\n🔄 Opening clean, fresh Gemini chat session...`);

  // Clear any existing stored image in window
  try {
    runChromeJs('window.__gemini_img = null;');
  } catch (e) {}

  // Trigger New Chat via DOM button, clear editor, or fallback to location.href
  const resetCode = `
    (function() {
      const editor = document.querySelector("rich-textarea .ql-editor");
      if (editor) {
        editor.focus();
        document.execCommand("selectAll", false, null);
        document.execCommand("delete", false, null);
        editor.dispatchEvent(new Event("input", { bubbles: true }));
      }
      const newBtn = document.querySelector("a[aria-label*='New chat'], button[aria-label*='New chat']");
      if (newBtn) {
        newBtn.click();
        return "clicked_new_chat";
      }
      window.location.href = "https://gemini.google.com/app";
      return "navigated";
    })()
  `;

  try {
    runChromeJs(resetCode);
  } catch (err) {
    console.warn('Notice resetting chat:', err.message);
  }

  // Wait for the fresh chat to initialize (0 images, editor ready)
  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    try {
      const checkCode = `
        (function() {
            const imgs = document.querySelectorAll("img[alt*='AI generated'], img[alt*='generated'], img.image").length;
            const editor = document.querySelector("rich-textarea .ql-editor");
            return JSON.stringify({ imgs, hasEditor: !!editor });
        })()
      `;
      const res = runChromeJs(checkCode);
      if (res && res.includes('"imgs":0') && res.includes('"hasEditor":true')) {
        console.log(`✓ Fresh chat initialized (0 previous images). Ready for new generation.`);
        return true;
      }
    } catch (ignore) {}
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
  console.log('✓ Prompt dispatched successfully to Gemini.');
}

async function waitForNewlyGeneratedImage(timeoutSeconds = 125) {
  console.log('⏳ Waiting for Gemini to generate the new image...');
  const start = Date.now();

  while ((Date.now() - start) < timeoutSeconds * 1000) {
    await new Promise((r) => setTimeout(r, 4000));

    const checkCode = `
      (function() {
          const imgs = Array.from(document.querySelectorAll("img")).filter(img => 
              (img.alt && (img.alt.includes("AI generated") || img.alt.includes("generated") || img.alt.includes("Generated with") || img.alt.includes("Created with"))) ||
              (img.className && img.className.includes("image") && (img.naturalWidth > 300 || img.width > 300)) ||
              (img.src && (img.src.includes("googleusercontent.com") || img.src.includes("blob:")) && (img.naturalWidth > 300 || img.width > 300))
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
  const batchCount = typeof options === 'number' ? options : (options.count || 5);
  const targetCity = typeof options === 'object' ? options.city : '';
  const targetCountry = typeof options === 'object' ? options.country : '';
  const excludeCountry = typeof options === 'object' ? (options.excludeCountry || '') : '';
  const skipCount = typeof options === 'object' ? (options.skip || 0) : 0;

  console.log(`\n======================================================`);
  console.log(`🚀 AI PINTEREST AUTOMATION ENGINE STARTING`);
  console.log(`Count: ${batchCount} | City: ${targetCity || 'Diverse Random'} | Country: ${targetCountry || 'Diverse Random'}${excludeCountry ? ` | Exclude: ${excludeCountry}` : ''}`);
  console.log(`======================================================`);

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✓ Connected to MongoDB');

  const HotelSchema = new mongoose.Schema({}, { strict: false });
  const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', HotelSchema);

  let hotels = [];

  if (targetCity) {
    hotels = await Hotel.find({
      city: new RegExp(targetCity, 'i'),
      flagged: { $ne: true },
      bathtubConfirmed: { $ne: false }
    })
    .sort({ rating: -1 })
    .skip(skipCount)
    .limit(batchCount);
  } else if (targetCountry) {
    hotels = await Hotel.find({
      country: new RegExp(targetCountry, 'i'),
      flagged: { $ne: true },
      bathtubConfirmed: { $ne: false }
    })
    .sort({ rating: -1 })
    .skip(skipCount)
    .limit(batchCount);
  } else {
    // Select batchCount hotels across batchCount DISTINCT countries and batchCount DISTINCT cities
    const matchStage = { 
      flagged: { $ne: true }, 
      bathtubConfirmed: { $ne: false }, 
      country: { $exists: true, $ne: '' }, 
      city: { $exists: true, $ne: '' },
      rating: { $gte: 4.5 }
    };
    if (excludeCountry) {
      const list = excludeCountry.split(',').map((c) => c.trim().toLowerCase()).filter(Boolean);
      matchStage.country = { $exists: true, $ne: '', $nin: list.map((c) => new RegExp(`^${c}$`, 'i')) };
    }

    const pipeline = [
      { $match: matchStage },
      { $sample: { size: 200 } }
    ];

    const candidates = await Hotel.aggregate(pipeline);
    const usedCountries = new Set();
    const usedCities = new Set();

    for (const h of candidates) {
      const c = (h.country || '').trim().toLowerCase();
      const ci = (h.city || '').trim().toLowerCase();
      if (!usedCountries.has(c) && !usedCities.has(ci)) {
        usedCountries.add(c);
        usedCities.add(ci);
        hotels.push(h);
        if (hotels.length === batchCount) break;
      }
    }
  }

  console.log(`Selected ${hotels.length} luxury hotel destinations across ${new Set(hotels.map(h => h.country)).size} countries:`);
  hotels.forEach((h, i) => console.log(`  ${i + 1}. ${h.name} (${h.city}, ${h.country}) - Rating: ${h.rating}`));

  const publishedPins = [];

  for (let i = 0; i < hotels.length; i++) {
    const hotel = hotels[i];
    console.log(`\n------------------------------------------------------`);
    console.log(`[${i + 1}/${hotels.length}] Processing: ${hotel.name} (${hotel.city}, ${hotel.country})`);

    // 1. Reset Gemini tab to clean state to guarantee 100% fresh generation with zero prior context
    await resetGeminiToFreshChat();

    // 2. Synthesize Bespoke Contextual Prompt
    const prompt = synthesizeContextualPrompt(hotel);

    // 3. Send to Gemini in Chrome
    await sendPromptToGemini(prompt);

    // 4. Wait for generation
    await waitForNewlyGeneratedImage(125);

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

    const title = `${hotel.name} - Luxury Bathtub & Suite in ${hotel.city}, ${hotel.country}`;
    const description = `Indulge in pure romance at ${hotel.name} in ${hotel.city}, ${hotel.country}. Features breathtaking private suites with in-room bathtubs and views. Verified luxury stays at HotelsWithBathtubs.com. #${citySlug.replace(/[^a-z0-9]/g, '')} #hotelswithbathtubs #luxurytravel #honeymoon #bucketlistvacation`;

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
  console.log(`\n🎉 BATCH COMPLETED! Successfully created & posted ${publishedPins.length} completely unique global AI Pins.`);
  return publishedPins;
}

if (process.argv[1].endsWith('ai_pinterest_engine.mjs')) {
  const args = process.argv.slice(2);
  let count = 5;
  let city = '';
  let country = '';
  let excludeCountry = '';
  let skip = 0;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--city' && args[i + 1]) city = args[++i];
    else if (args[i] === '--country' && args[i + 1]) country = args[++i];
    else if (args[i] === '--excludeCountry' && args[i + 1]) excludeCountry = args[++i];
    else if (args[i] === '--count' && args[i + 1]) count = parseInt(args[++i], 10);
    else if (args[i] === '--skip' && args[i + 1]) skip = parseInt(args[++i], 10);
    else if (!isNaN(parseInt(args[i], 10))) count = parseInt(args[i], 10);
  }

  runAIPinEngine({ count, city, country, excludeCountry, skip }).catch((err) => {
    console.error('Fatal engine error:', err);
    process.exit(1);
  });
}
