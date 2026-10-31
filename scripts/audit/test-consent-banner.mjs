import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// Read CookieConsentBanner source to ensure test verifies the real exported regions
const bannerSrc = fs.readFileSync(path.join(rootDir, 'src/components/CookieConsentBanner.tsx'), 'utf8');
const match = bannerSrc.match(/CONSENT_REGIONS\s*=\s*new\s+Set\(\[\s*([\s\S]*?)\]\)/);
if (!match) {
  console.error('FAIL: Could not parse CONSENT_REGIONS from CookieConsentBanner.tsx');
  process.exit(1);
}

const regions = match[1]
  .split(',')
  .map(s => s.trim().replace(/['"]/g, ''))
  .filter(Boolean);

const CONSENT_REGIONS = new Set(regions);

console.log('Testing Cookie Consent Banner Logic');
console.log('-----------------------------------');
console.log(`Configured consent regions count: ${CONSENT_REGIONS.size}`);

function evaluateBannerDisplay({ countryCode, savedConsent, isSettingsOpened = false }) {
  if (isSettingsOpened) {
    return { show: true, reason: 'reopened via footer Cookie settings' };
  }
  if (savedConsent) {
    return { show: false, reason: `already answered (${savedConsent})` };
  }
  const code = (countryCode || '').toUpperCase();
  if (CONSENT_REGIONS.has(code)) {
    return { show: true, reason: `country ${code} is in EEA/UK/CH consent zone` };
  }
  return { show: false, reason: `country ${code} is outside consent zone` };
}

const testCases = [
  // Required brief checks: shown for GB/DE, hidden for IN/US
  { country: 'GB', saved: null, settings: false, expected: true, label: 'United Kingdom (GB) first visit' },
  { country: 'DE', saved: null, settings: false, expected: true, label: 'Germany (DE) first visit' },
  { country: 'FR', saved: null, settings: false, expected: true, label: 'France (FR) first visit' },
  { country: 'CH', saved: null, settings: false, expected: true, label: 'Switzerland (CH) first visit' },
  { country: 'IN', saved: null, settings: false, expected: false, label: 'India (IN) visitor' },
  { country: 'US', saved: null, settings: false, expected: false, label: 'United States (US) visitor' },
  { country: 'CA', saved: null, settings: false, expected: false, label: 'Canada (CA) visitor' },
  { country: 'AU', saved: null, settings: false, expected: false, label: 'Australia (AU) visitor' },
  // Saved consent checks
  { country: 'GB', saved: 'granted', settings: false, expected: false, label: 'GB with saved consent=granted' },
  { country: 'DE', saved: 'denied', settings: false, expected: false, label: 'DE with saved consent=denied' },
  // Footer reopen check
  { country: 'US', saved: 'granted', settings: true, expected: true, label: 'Footer "Cookie settings" click (US)' },
  { country: 'GB', saved: 'granted', settings: true, expected: true, label: 'Footer "Cookie settings" click (GB)' },
];

let allPassed = true;
for (const tc of testCases) {
  const result = evaluateBannerDisplay({
    countryCode: tc.country,
    savedConsent: tc.saved,
    isSettingsOpened: tc.settings,
  });

  const pass = result.show === tc.expected;
  if (!pass) allPassed = false;
  console.log(`${pass ? 'PASS' : 'FAIL'}: [${tc.country}] ${tc.label} -> Banner ${result.show ? 'SHOWN' : 'HIDDEN'} (${result.reason})`);
}

if (!allPassed) {
  console.error('\nFAIL: Some banner logic tests failed.');
  process.exit(1);
}

console.log('\nAll 12 banner logic tests passed successfully.');
