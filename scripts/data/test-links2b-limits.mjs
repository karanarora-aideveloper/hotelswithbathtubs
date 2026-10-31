#!/usr/bin/env node
/**
 * scripts/data/test-links2b-limits.mjs
 *
 * Offline Unit Tests for LINKS2B Hard Limits (CEO Sheet T13)
 *
 * Verifies:
 * (a) with the clock before the cooldown end, the main function exits and the fake is called 0 times;
 * (b) across 5 fake hotels, every gap between fake calls is at least 20,000 ms;
 * (c) with the counter at 399, exactly 1 more hotel is processed;
 * (d) a fake block on hotel 2 writes BLOCKED and stops, and a second start refuses.
 *
 * Makes 0 real web requests.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BlockError } from './saver.mjs';
import {
  checkCooldown,
  runCollector,
  setSavePage,
  setNowFn,
  setSleepFn,
  setLastRequestTime,
  readDailyCounter,
  writeDailyCounter,
  BLOCK_TIMESTAMP_ISO,
  EARLIEST_ALLOWED_MS,
  MIN_REQUEST_GAP_MS,
  DAILY_CAP
} from './collect-booking-links2b.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const worktreeDir = path.resolve(__dirname, '../..');
const privateDir = path.join(worktreeDir, 'data-collect', 'private');

const testCounterPath = path.join(privateDir, 'test-links2b-daily.json');
const testResultsPath = path.join(privateDir, 'test-links2b-results.json');
const testNotFoundPath = path.join(privateDir, 'test-links2b-notfound.csv');

// Fixture paths
const searchFixtureGz = path.join(worktreeDir, 'data-collect/pages/booking-links2/search-links2-1886crescenthotelandspa-eurekasprings-ar.html.gz');
const hotelFixtureGz = path.join(worktreeDir, 'data-collect/pages/booking-links2/hotel-links2-1886crescenthotelandspa-eurekasprings-ar.html.gz');

function cleanupTestFiles() {
  if (fs.existsSync(testCounterPath)) fs.unlinkSync(testCounterPath);
  if (fs.existsSync(testResultsPath)) fs.unlinkSync(testResultsPath);
  if (fs.existsSync(testNotFoundPath)) fs.unlinkSync(testNotFoundPath);
}

const testCandidates = [
  { key: 'hotel1|eurekasprings|ar', name: '1886 Crescent Hotel and Spa', town: 'Eureka Springs', state: 'AR', address: { street: '75 Prospect Ave' } },
  { key: 'hotel2|eurekasprings|ar', name: '1886 Crescent Hotel and Spa', town: 'Eureka Springs', state: 'AR', address: { street: '75 Prospect Ave' } },
  { key: 'hotel3|eurekasprings|ar', name: '1886 Crescent Hotel and Spa', town: 'Eureka Springs', state: 'AR', address: { street: '75 Prospect Ave' } },
  { key: 'hotel4|eurekasprings|ar', name: '1886 Crescent Hotel and Spa', town: 'Eureka Springs', state: 'AR', address: { street: '75 Prospect Ave' } },
  { key: 'hotel5|eurekasprings|ar', name: '1886 Crescent Hotel and Spa', town: 'Eureka Springs', state: 'AR', address: { street: '75 Prospect Ave' } }
];

async function runTests() {
  console.log('=============================================================');
  console.log('>>> TEST-LINKS2B-LIMITS: Offline Validation of 4 Hard Limits');
  console.log('=============================================================');

  let allPass = true;

  // -------------------------------------------------------------------------
  // Test (a): Clock before cooldown end -> exits with 0 fake calls
  // -------------------------------------------------------------------------
  console.log('\n--- TEST (a): Clock before cooldown end -> Refuses to run, 0 requests ---');
  cleanupTestFiles();
  let fakeCallsA = 0;
  setSavePage(async () => {
    fakeCallsA++;
    throw new Error('SavePage should NOT be called before cooldown expires!');
  });

  // Set simulated clock to 31 Oct 2026 (cooldown active until 02 Nov)
  const timeBeforeCooldown = new Date('2026-10-31T12:00:00.000Z').getTime();
  setNowFn(() => timeBeforeCooldown);

  let testAPassed = false;
  try {
    await runCollector({
      candidates: testCandidates,
      isDryRun: false,
      dailyCounterPath: testCounterPath,
      resultsFilePath: testResultsPath,
      notFoundFilePath: testNotFoundPath
    });
  } catch (err) {
    if (err.isCooldownActive && fakeCallsA === 0) {
      testAPassed = true;
      console.log(`[PASS] Test (a) caught expected cooldown error: "${err.message}"`);
      console.log(`[PASS] Fake savePage called: ${fakeCallsA} times (Expected: 0)`);
    } else {
      console.error(`[FAIL] Unexpected error in Test (a):`, err);
    }
  }

  if (!testAPassed) {
    console.error(`[FAIL] Test (a) did not pass.`);
    allPass = false;
  }

  // -------------------------------------------------------------------------
  // Test (b): Enforced >= 20,000ms gap across 5 fake hotels
  // -------------------------------------------------------------------------
  console.log('\n--- TEST (b): Minimum 20,000ms gap between all calls across 5 hotels ---');
  cleanupTestFiles();

  let simTimeB = new Date('2026-11-02T10:00:00.000Z').getTime(); // After cooldown
  setNowFn(() => simTimeB);
  setLastRequestTime(0);

  const callTimestampsB = [];
  setSleepFn(async (ms) => {
    // Advance simulated clock instantly by sleep duration
    simTimeB += ms;
  });

  setSavePage(async (folder, url, slug, opts) => {
    callTimestampsB.push(simTimeB);
    const isSearch = url.includes('searchresults');
    const fixture = isSearch ? searchFixtureGz : hotelFixtureGz;
    return {
      gzPath: fixture,
      meta: {
        url,
        status: 200,
        fetchedAt: new Date(simTimeB).toISOString(),
        finalUrl: url
      }
    };
  });

  let testBPassed = false;
  try {
    const resB = await runCollector({
      candidates: testCandidates, // 5 hotels
      isDryRun: false,
      dailyCounterPath: testCounterPath,
      resultsFilePath: testResultsPath,
      notFoundFilePath: testNotFoundPath
    });

    console.log(`Total fake requests made for 5 hotels: ${callTimestampsB.length}`);
    const gaps = [];
    let minGap = Infinity;
    let gapsUnder20s = 0;

    for (let i = 1; i < callTimestampsB.length; i++) {
      const gap = callTimestampsB[i] - callTimestampsB[i - 1];
      gaps.push(gap);
      if (gap < minGap) minGap = gap;
      if (gap < MIN_REQUEST_GAP_MS) gapsUnder20s++;
    }

    console.log(`Measured gaps (ms):`, gaps);
    console.log(`Smallest gap: ${minGap}ms (Target: >= 20000ms)`);
    console.log(`Gaps under 20,000ms: ${gapsUnder20s} (Target: 0)`);

    if (gaps.length >= 4 && gapsUnder20s === 0 && minGap >= 20000) {
      testBPassed = true;
      console.log(`[PASS] Test (b) verified: every request gap is >= 20,000ms across all 5 hotels.`);
    } else {
      console.error(`[FAIL] Test (b) failed: minGap = ${minGap}, gapsUnder20s = ${gapsUnder20s}`);
    }
  } catch (err) {
    console.error(`[FAIL] Test (b) threw unexpected error:`, err);
  }

  if (!testBPassed) allPass = false;

  // -------------------------------------------------------------------------
  // Test (c): Counter at 399 -> exactly 1 more hotel processed
  // -------------------------------------------------------------------------
  console.log('\n--- TEST (c): Counter at 399 -> stops after exactly 1 more hotel ---');
  cleanupTestFiles();

  let simTimeC = new Date('2026-11-02T12:00:00.000Z').getTime();
  setNowFn(() => simTimeC);
  setLastRequestTime(0);

  // Initialize counter with 399 for 2026-11-02
  const initialDataC = {
    status: 'OK',
    blocked: null,
    dailyCounts: {
      '2026-11-02': 399
    }
  };
  writeDailyCounter(initialDataC, testCounterPath);

  let processedCountC = 0;
  setSavePage(async (folder, url) => {
    const isSearch = url.includes('searchresults');
    if (isSearch) processedCountC++;
    const fixture = isSearch ? searchFixtureGz : hotelFixtureGz;
    return {
      gzPath: fixture,
      meta: { url, status: 200, fetchedAt: new Date(simTimeC).toISOString() }
    };
  });

  let testCPassed = false;
  try {
    await runCollector({
      candidates: testCandidates, // 5 hotels available
      isDryRun: false,
      dailyCounterPath: testCounterPath,
      resultsFilePath: testResultsPath,
      notFoundFilePath: testNotFoundPath
    });

    const finalCounterC = readDailyCounter(testCounterPath);
    console.log(`Processed hotels before daily cap hit: ${processedCountC} (Expected: 1)`);
    console.log(`Final daily counter for 2026-11-02:     ${finalCounterC.dailyCounts['2026-11-02']} / ${DAILY_CAP}`);

    if (processedCountC === 1 && finalCounterC.dailyCounts['2026-11-02'] === 400) {
      testCPassed = true;
      console.log(`[PASS] Test (c) verified: counter stopped at 400 after exactly 1 hotel.`);
    } else {
      console.error(`[FAIL] Test (c) failed: processedCount = ${processedCountC}, finalCounter = ${finalCounterC.dailyCounts['2026-11-02']}`);
    }
  } catch (err) {
    console.error(`[FAIL] Test (c) threw unexpected error:`, err);
  }

  if (!testCPassed) allPass = false;

  // -------------------------------------------------------------------------
  // Test (d): Fake block on hotel 2 writes BLOCKED and halts; second start refuses
  // -------------------------------------------------------------------------
  console.log('\n--- TEST (d): Block on hotel 2 writes BLOCKED; second start refuses ---');
  cleanupTestFiles();

  let simTimeD = new Date('2026-11-02T14:00:00.000Z').getTime();
  setNowFn(() => simTimeD);
  setLastRequestTime(0);

  let hotelIndexD = 0;
  setSavePage(async (folder, url) => {
    const isSearch = url.includes('searchresults');
    if (isSearch) hotelIndexD++;
    if (hotelIndexD === 2) {
      throw new BlockError('HTTP 403 Challenge', 403, url);
    }
    const fixture = isSearch ? searchFixtureGz : hotelFixtureGz;
    return {
      gzPath: fixture,
      meta: { url, status: 200, fetchedAt: new Date(simTimeD).toISOString() }
    };
  });

  let testDPassed = false;
  let blockCaught = false;

  try {
    await runCollector({
      candidates: testCandidates,
      isDryRun: false,
      dailyCounterPath: testCounterPath,
      resultsFilePath: testResultsPath,
      notFoundFilePath: testNotFoundPath
    });
  } catch (err) {
    blockCaught = true;
    console.log(`[1st Run] Block intercepted as expected: "${err.message}"`);
  }

  const counterAfterBlock = readDailyCounter(testCounterPath);
  console.log(`[1st Run] Counter status:  "${counterAfterBlock.status}"`);
  console.log(`[1st Run] Counter blocked: "${counterAfterBlock.blocked}"`);

  const hasBlockedRecord = counterAfterBlock.status === 'BLOCKED' &&
    typeof counterAfterBlock.blocked === 'string' &&
    counterAfterBlock.blocked.startsWith('BLOCKED ');

  // Second run: must refuse to start without making any requests
  let secondRunCalls = 0;
  setSavePage(async () => {
    secondRunCalls++;
    throw new Error('SavePage MUST NOT be called on second run when BLOCKED!');
  });

  let secondRunRefused = false;
  try {
    await runCollector({
      candidates: testCandidates,
      isDryRun: false,
      dailyCounterPath: testCounterPath,
      resultsFilePath: testResultsPath,
      notFoundFilePath: testNotFoundPath
    });
  } catch (err) {
    if (err.isBlockHalt && secondRunCalls === 0) {
      secondRunRefused = true;
      console.log(`[2nd Run] Second start cleanly refused with isBlockHalt: true`);
      console.log(`[2nd Run] Fake savePage called: ${secondRunCalls} times (Expected: 0)`);
    } else {
      console.error(`[2nd Run] Unexpected error on second run:`, err);
    }
  }

  if (blockCaught && hasBlockedRecord && secondRunRefused) {
    testDPassed = true;
    console.log(`[PASS] Test (d) verified: block wrote BLOCKED to counter and second start was refused.`);
  } else {
    console.error(`[FAIL] Test (d) failed: blockCaught=${blockCaught}, hasBlockedRecord=${hasBlockedRecord}, secondRunRefused=${secondRunRefused}`);
  }

  if (!testDPassed) allPass = false;

  // Cleanup
  cleanupTestFiles();

  console.log('\n=============================================================');
  console.log(`>>> OVERALL TEST RESULT: ${allPass ? 'ALL TESTS PASS (a, b, c, d)' : 'SOME TESTS FAILED'}`);
  console.log('=============================================================');

  process.exit(allPass ? 0 : 1);
}

runTests().catch(err => {
  console.error('Fatal test runner failure:', err);
  process.exit(1);
});
