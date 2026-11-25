#!/usr/bin/env node
/**
 * GROWTH-FIX1 (25 Nov 2026, founder approved "fix all"): add MakeMyTrip and Cleartrip hotel-page
 * links to India hotels from the matched plans, after a strict two-way name check and a city check.
 *   node scripts/data/india-links-write.mjs <final-links.json>            # dry run
 *   node scripts/data/india-links-write.mjs <final-links.json> --write    # backup, then write
 *   node scripts/data/india-links-write.mjs --rollback <backup.json> [--write]
 * Only sets makemytripUrl / cleartripUrl where the hotel has none; nothing else changes.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: path.join(ROOT, '.env.local'), quiet: true });
const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const rb = args.indexOf('--rollback');
const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const hotels = client.db().collection('hotels');
const before = await hotels.countDocuments();

if (rb >= 0) {
  const backup = JSON.parse(fs.readFileSync(path.resolve(args[rb + 1]), 'utf8'));
  console.log(`${WRITE ? 'ROLLBACK' : 'DRY RUN rollback'}: ${backup.rows.length} fields`);
  if (WRITE) for (const r of backup.rows) await hotels.updateOne({ _id: new ObjectId(r.id) }, { $unset: { [r.field]: '' } });
  await client.close();
  process.exit(0);
}

const plan = JSON.parse(fs.readFileSync(path.resolve(args[0]), 'utf8'));
const rows = [
  ...plan.mmt.map((r) => ({ id: r.id, field: 'makemytripUrl', url: r.url })),
  ...plan.cleartrip.map((r) => ({ id: r.id, field: 'cleartripUrl', url: r.url })),
];
const todo = [];
for (const r of rows) {
  const h = await hotels.findOne({ _id: new ObjectId(r.id) }, { projection: { [r.field]: 1, country: 1, name: 1 } });
  if (!h || !/india/i.test(h.country || '') || h[r.field]) continue;
  todo.push({ ...r, name: h.name });
}
const per = todo.reduce((a, r) => ((a[r.field] = (a[r.field] || 0) + 1), a), {});
console.log(`${WRITE ? 'WRITE' : 'DRY RUN'}: ${todo.length} links to add`, per, `(hotels: ${before})`);
if (WRITE && todo.length) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(ROOT, '.cache', `india-links-backup-${stamp}.json`);
  fs.mkdirSync(path.dirname(backupPath), { recursive: true });
  fs.writeFileSync(backupPath, JSON.stringify({ createdAt: new Date().toISOString(), rows: todo }, null, 1));
  console.log(`Backup (fields added, for --rollback): ${path.relative(ROOT, backupPath)}`);
  for (const r of todo) await hotels.updateOne({ _id: new ObjectId(r.id), [r.field]: { $in: [null, ''] } }, { $set: { [r.field]: r.url } });
  console.log(`Done. Hotels: ${before} -> ${await hotels.countDocuments()}`);
}
await client.close();
