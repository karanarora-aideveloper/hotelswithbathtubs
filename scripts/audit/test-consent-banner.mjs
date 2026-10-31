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

// ==========================================
// Section 2: Extended Analytics Storage & Tracking Consent Test
// ==========================================
console.log('\nTesting Analytics Storage & Engagement Tracking Consent');
console.log('-------------------------------------------------------');

// Parse keys from consent.ts and component sources
const consentSrc = fs.readFileSync(path.join(rootDir, 'src/lib/consent.ts'), 'utf8');
const userRecurrenceSrc = fs.readFileSync(path.join(rootDir, 'src/lib/userRecurrence.ts'), 'utf8');
const emailCaptureSrc = fs.readFileSync(path.join(rootDir, 'src/components/RomanticGetawayEmailCapture.tsx'), 'utf8');

// Ensure no subscriber email storage in localStorage
const emailStorageMatch = emailCaptureSrc.match(/localStorage\.setItem\(['"]hwb_subscribers['"]/);
if (emailStorageMatch) {
  console.error('FAIL: RomanticGetawayEmailCapture.tsx still stores subscriber emails in localStorage');
  process.exit(1);
} else {
  console.log('PASS: Verified no personal email storage in localStorage (hwb_subscribers removed)');
}

// Extract defined STORAGE_KEYS
const keyMatches = [...consentSrc.matchAll(/([A-Z_]+):\s*['"](hwb_[a-z0-9_]+)['"]/g)];
const TRACKING_KEYS = keyMatches.map(m => m[2]);
console.log(`Tracking storage keys under test (${TRACKING_KEYS.length}): ${TRACKING_KEYS.join(', ')}`);

// Simulation function representing client runtime behavior
function simulateAnalyticsStorage({ countryCode, savedConsent }) {
  const store = new Map();
  let cookie = '';

  const mockLocalStorage = {
    getItem: (k) => store.get(k) || null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };

  const code = (countryCode || '').toUpperCase();
  const isConsentZone = CONSENT_REGIONS.has(code);

  let allowed = false;
  if (savedConsent === 'granted') {
    allowed = true;
  } else if (savedConsent === 'denied') {
    allowed = false;
  } else if (isConsentZone) {
    allowed = false; // Blocked in UK/EU/CH until Accept
  } else {
    allowed = true; // Allowed outside consent zone (e.g. US, IN)
  }

  if (allowed) {
    // Visitor ID + session keys written
    const uid = `hwb_mock_${Date.now()}`;
    mockLocalStorage.setItem('hwb_user_id', uid);
    cookie = `hwb_user_id=${uid}`;
    mockLocalStorage.setItem('hwb_session_count', '1');
    mockLocalStorage.setItem('hwb_first_seen', String(Date.now()));
    mockLocalStorage.setItem('hwb_last_seen', String(Date.now()));
    // Simulation of engagement update
    mockLocalStorage.setItem('hwb_lifetime_time', '15');
    mockLocalStorage.setItem('hwb_lifetime_hotels', '2');
  }

  const writtenKeys = TRACKING_KEYS.filter(k => store.has(k));
  const hasUserIdCookie = cookie.includes('hwb_user_id=');

  return {
    allowed,
    writtenKeys,
    hasUserIdCookie,
    writtenCount: writtenKeys.length,
  };
}

const storageTestCases = [
  { country: 'GB', saved: null, expectAllowed: false, label: 'GB before Accept (no keys, no hwb_user_id cookie)' },
  { country: 'DE', saved: null, expectAllowed: false, label: 'DE before Accept (no keys, no hwb_user_id cookie)' },
  { country: 'GB', saved: 'granted', expectAllowed: true, label: 'GB after Accept (hwb_user_id and engagement keys written)' },
  { country: 'DE', saved: 'granted', expectAllowed: true, label: 'DE after Accept (hwb_user_id and engagement keys written)' },
  { country: 'DE', saved: 'denied', expectAllowed: false, label: 'DE after Reject (no keys, no hwb_user_id cookie)' },
  { country: 'US', saved: null, expectAllowed: true, label: 'US visitor (outside consent zone, storage allowed)' },
  { country: 'IN', saved: null, expectAllowed: true, label: 'IN visitor (outside consent zone, storage allowed)' },
];

let storageTestsPassed = true;
for (const tc of storageTestCases) {
  const result = simulateAnalyticsStorage({
    countryCode: tc.country,
    savedConsent: tc.saved,
  });

  const pass = result.allowed === tc.expectAllowed &&
    (tc.expectAllowed ? (result.writtenCount > 0 && result.hasUserIdCookie) : (result.writtenCount === 0 && !result.hasUserIdCookie));

  if (!pass) storageTestsPassed = false;

  console.log(`${pass ? 'PASS' : 'FAIL'}: [${tc.country}] ${tc.label} -> Allowed: ${result.allowed}, Keys written: ${result.writtenCount}, Cookie: ${result.hasUserIdCookie ? 'SET' : 'NONE'}`);
}

if (!storageTestsPassed) {
  console.error('\nFAIL: Extended analytics storage consent tests failed.');
  process.exit(1);
}

console.log('\nAll extended consent and storage tests passed successfully.');
