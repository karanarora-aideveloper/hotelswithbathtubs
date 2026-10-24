// Applies results computed on a second machine (repair-all-links.mjs --no-db --tag remote) to MongoDB.
//   node scripts/apply-remote-results.mjs            (dry run: counts)
//   node scripts/apply-remote-results.mjs --apply
// Only writes the link fields in each result's `set`. Old values go to link-repair-backup-all.remote.jsonl.
// It does NOT touch .cache/all-hotels.json or the main state file, because the primary run owns those
// while it is running; re-export the cache from MongoDB after all passes finish.
import fs from 'fs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config({ path: '.env.local', quiet: true });
const APPLY = process.argv.includes('--apply');
const TAG = (process.argv.find((a) => a.startsWith('--tag=')) || '--tag=remote').split('=')[1];
const resultsPath = `.cache/link-repair-state.${TAG}.json`;
const appliedPath = TAG === 'remote' ? '.cache/remote-applied.json' : `.cache/remote-applied.${TAG}.json`;
const ALLOWED = new Set(['bookingUrl', 'agodaUrl', 'tripUrl', 'url']);

const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
const applied = fs.existsSync(appliedPath) ? JSON.parse(fs.readFileSync(appliedPath, 'utf8')) : {};
const todo = Object.entries(results).filter(([id, r]) => !applied[id] && r.set && Object.keys(r.set).length);
const noChange = Object.keys(results).length - todo.length;
console.log(`remote results: ${Object.keys(results).length} hotels; ${todo.length} with changes to apply; ${noChange} unchanged or already applied`);
if (!APPLY || !todo.length) process.exit(0);

for (const [, r] of todo) for (const k of Object.keys(r.set)) if (!ALLOWED.has(k)) throw new Error(`refusing to write field ${k}`);
fs.appendFileSync(`.cache/link-repair-backup-all.${TAG}.jsonl`, todo.map(([id, r]) => JSON.stringify({ _id: id, name: r.name, old: r.old, set: r.set })).join('\n') + '\n');
await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 20000 });
const col = mongoose.connection.db.collection('hotels');
const now = new Date();
const res = await col.bulkWrite(todo.map(([id, r]) => ({ updateOne: { filter: { _id: new mongoose.Types.ObjectId(id) }, update: { $set: { ...r.set, updatedAt: now } } } })));
for (const [id] of todo) applied[id] = true;
fs.writeFileSync(appliedPath, JSON.stringify(applied));
console.log('applied', todo.length, '; db modified', res.modifiedCount);
await mongoose.disconnect();
