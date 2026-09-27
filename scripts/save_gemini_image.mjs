import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export function getGeminiImageFromChrome(outputPath) {
  const script = `
tell application "Google Chrome"
    repeat with w in windows
        repeat with t in tabs of w
            if URL of t starts with "https://gemini.google.com" then
                return execute t javascript "window.__gemini_img || ''"
            end if
        end repeat
    end repeat
    return ""
end tell
  `.trim();

  const result = execFileSync('osascript', ['-e', script], { maxBuffer: 25 * 1024 * 1024 }).toString().trim();

  if (!result || !result.startsWith('data:image/')) {
    throw new Error('No valid image data URL found in window.__gemini_img on Gemini tab');
  }

  const base64Data = result.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Image saved successfully to ${outputPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
  return outputPath;
}

if (process.argv[1].endsWith('save_gemini_image.mjs')) {
  const target = process.argv[2] || 'public/pins/viceroy_bali_ai_tub.jpg';
  getGeminiImageFromChrome(target);
}
