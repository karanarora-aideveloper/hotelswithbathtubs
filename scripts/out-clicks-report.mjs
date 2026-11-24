#!/usr/bin/env node
/**
 * Booking clicks logged by /out (D1 table out_clicks). Read-only.
 *   node scripts/out-clicks-report.mjs          # last 7 days
 *   node scripts/out-clicks-report.mjs 30       # last 30 days
 */
import { execFileSync } from 'child_process';

const days = Math.max(1, parseInt(process.argv[2] || '7', 10) || 7);
const since = new Date(Date.now() - days * 864e5).toISOString();

function q(sql) {
  const out = execFileSync('npx', ['wrangler', 'd1', 'execute', 'hotelswithbathtubs-clicks', '--remote', '--json', '--command', sql], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  return JSON.parse(out)[0].results;
}
const where = `WHERE ts >= '${since}'`;
const show = (title, rows) => { console.log(`\n${title}`); console.table(rows); };

console.log(`Booking clicks via /out since ${since.slice(0, 10)} (${days} days)`);
show('Per day', q(`SELECT substr(ts,1,10) day, COUNT(*) clicks, SUM(link_type='affiliate') affiliate FROM out_clicks ${where} GROUP BY day ORDER BY day`));
show('Per partner', q(`SELECT partner, link_type, COUNT(*) clicks FROM out_clicks ${where} GROUP BY partner, link_type ORDER BY clicks DESC`));
show('Per page type and placement', q(`SELECT page_type, placement, COUNT(*) clicks FROM out_clicks ${where} GROUP BY page_type, placement ORDER BY clicks DESC`));
show('Per visitor country (top 15)', q(`SELECT visitor_country, COUNT(*) clicks FROM out_clicks ${where} GROUP BY visitor_country ORDER BY clicks DESC LIMIT 15`));
show('Top pages (top 20)', q(`SELECT page_path, COUNT(*) clicks FROM out_clicks ${where} GROUP BY page_path ORDER BY clicks DESC LIMIT 20`));
