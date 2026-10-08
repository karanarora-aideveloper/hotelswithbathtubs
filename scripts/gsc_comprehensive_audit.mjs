import { google } from 'googleapis';
import fs from 'fs';

async function runGSCAudit() {
  const auth = new google.auth.GoogleAuth({
    keyFile: '/Users/karanarora/.config/gcloud/gsc-service-account-key.json',
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
  const sc = google.searchconsole({ version: 'v1', auth });
  const siteUrl = 'sc-domain:hotelswithbathtubs.com';

  const endDate = '2026-10-06';
  const startDate28d = '2026-09-08';
  const startDate90d = '2026-07-08';

  console.log(`📡 Fetching Google Search Console data for ${siteUrl}...`);

  // 1. Overall Domain Summary (28 days)
  const resSummary28 = await sc.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: startDate28d,
      endDate,
    },
  });
  const summary28 = resSummary28.data.rows?.[0] || {};

  // 2. Overall Domain Summary (90 days)
  const resSummary90 = await sc.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: startDate90d,
      endDate,
    },
  });
  const summary90 = resSummary90.data.rows?.[0] || {};

  // 3. Performance by Country (28 days)
  const resCountries = await sc.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: startDate28d,
      endDate,
      dimensions: ['country'],
      rowLimit: 100,
    },
  });
  const countries = (resCountries.data.rows || []).map(r => ({
    countryCode: r.keys[0].toUpperCase(),
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: +(r.ctr * 100).toFixed(2),
    position: +r.position.toFixed(1),
  })).sort((a, b) => b.impressions - a.impressions);

  // 4. Performance by Device
  const resDevice = await sc.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: startDate28d,
      endDate,
      dimensions: ['device'],
    },
  });
  const devices = (resDevice.data.rows || []).map(r => ({
    device: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: +(r.ctr * 100).toFixed(2),
    position: +r.position.toFixed(1),
  }));

  // 5. Performance by Page (top 200 pages)
  const resPages = await sc.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: startDate28d,
      endDate,
      dimensions: ['page'],
      rowLimit: 500,
    },
  });
  const pages = (resPages.data.rows || []).map(r => {
    const url = r.keys[0];
    const path = url.replace('https://www.hotelswithbathtubs.com', '').replace('https://hotelswithbathtubs.com', '') || '/';
    return {
      url,
      path,
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: +(r.ctr * 100).toFixed(2),
      position: +r.position.toFixed(1),
    };
  }).sort((a, b) => b.impressions - a.impressions);

  // 6. Performance by Query (top 500 queries)
  const resQueries = await sc.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: startDate28d,
      endDate,
      dimensions: ['query'],
      rowLimit: 500,
    },
  });
  const queries = (resQueries.data.rows || []).map(r => ({
    query: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: +(r.ctr * 100).toFixed(2),
    position: +r.position.toFixed(1),
  })).sort((a, b) => b.impressions - a.impressions);

  // 7. Page + Query breakdown for top pages
  const resPageQueries = await sc.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: startDate28d,
      endDate,
      dimensions: ['page', 'query'],
      rowLimit: 1000,
    },
  });
  const pageQueries = (resPageQueries.data.rows || []).map(r => ({
    page: r.keys[0].replace('https://www.hotelswithbathtubs.com', '').replace('https://hotelswithbathtubs.com', '') || '/',
    query: r.keys[1],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: +(r.ctr * 100).toFixed(2),
    position: +r.position.toFixed(1),
  })).sort((a, b) => b.impressions - a.impressions);

  // Compute City aggregations: classify pages into city directories
  const cityAggregates = {};
  for (const p of pages) {
    const parts = p.path.split('/').filter(Boolean);
    // e.g. /india/delhi or /usa/new-york or /india/delhi/hotel-name
    if (parts.length >= 2 && !['blog', 'api', 'admin'].includes(parts[0])) {
      const country = parts[0];
      const city = parts[1];
      const key = `${city} (${country.toUpperCase()})`;
      if (!cityAggregates[key]) {
        cityAggregates[key] = {
          city,
          country,
          clicks: 0,
          impressions: 0,
          weightedPositionSum: 0,
          urlsCount: 0,
          topUrl: p.path,
        };
      }
      cityAggregates[key].clicks += p.clicks;
      cityAggregates[key].impressions += p.impressions;
      cityAggregates[key].weightedPositionSum += p.position * p.impressions;
      cityAggregates[key].urlsCount += 1;
    }
  }

  const citiesList = Object.entries(cityAggregates).map(([key, data]) => ({
    name: key,
    city: data.city,
    country: data.country,
    clicks: data.clicks,
    impressions: data.impressions,
    ctr: data.impressions > 0 ? +((data.clicks / data.impressions) * 100).toFixed(2) : 0,
    avgPosition: data.impressions > 0 ? +(data.weightedPositionSum / data.impressions).toFixed(1) : 0,
    urlsCount: data.urlsCount,
    topUrl: data.topUrl,
  })).sort((a, b) => b.impressions - a.impressions);

  // Striking distance queries: Position between 4.0 and 20.0
  const strikingDistance = queries.filter(q => q.position >= 4.0 && q.position <= 20.0 && q.impressions >= 15)
    .sort((a, b) => b.impressions - a.impressions);

  // High Opportunity queries: impressions >= 40, ctr < 2.0%
  const highOpportunity = queries.filter(q => q.impressions >= 40 && q.ctr < 2.0)
    .sort((a, b) => b.impressions - a.impressions);

  // Top Page 1 queries: Position < 10
  const pageOneQueries = queries.filter(q => q.position < 10.0 && q.clicks > 0)
    .sort((a, b) => b.clicks - a.clicks);

  const report = {
    generatedAt: new Date().toISOString(),
    siteUrl,
    period28d: {
      startDate: startDate28d,
      endDate,
      totalClicks: summary28.clicks || 0,
      totalImpressions: summary28.impressions || 0,
      avgCtr: summary28.ctr ? +(summary28.ctr * 100).toFixed(2) : 0,
      avgPosition: summary28.position ? +summary28.position.toFixed(1) : 0,
    },
    period90d: {
      startDate: startDate90d,
      endDate,
      totalClicks: summary90.clicks || 0,
      totalImpressions: summary90.impressions || 0,
      avgCtr: summary90.ctr ? +(summary90.ctr * 100).toFixed(2) : 0,
      avgPosition: summary90.position ? +summary90.position.toFixed(1) : 0,
    },
    devices,
    countries: countries.slice(0, 30),
    cities: citiesList.slice(0, 40),
    topPages: pages.slice(0, 30),
    topQueries: queries.slice(0, 40),
    strikingDistance: strikingDistance.slice(0, 30),
    highOpportunity: highOpportunity.slice(0, 30),
    pageOneQueries: pageOneQueries.slice(0, 30),
    pageQueriesSample: pageQueries.slice(0, 50),
  };

  fs.writeFileSync('scratch/gsc_live_audit_oct2026.json', JSON.stringify(report, null, 2));
  console.log('✅ GSC Audit completed successfully!');
  console.log(`📊 28-day Summary: ${report.period28d.totalClicks} clicks, ${report.period28d.totalImpressions} impressions, Avg Position: ${report.period28d.avgPosition}, CTR: ${report.period28d.avgCtr}%`);
  console.log(`📊 90-day Summary: ${report.period90d.totalClicks} clicks, ${report.period90d.totalImpressions} impressions, Avg Position: ${report.period90d.avgPosition}, CTR: ${report.period90d.avgCtr}%`);
  console.log(`🌍 Top 5 Countries:`, countries.slice(0, 5).map(c => `${c.countryCode}: ${c.clicks} clicks / ${c.impressions} imps / pos ${c.position}`));
  console.log(`🏙️ Top 5 Cities:`, citiesList.slice(0, 5).map(c => `${c.name}: ${c.clicks} clicks / ${c.impressions} imps / pos ${c.avgPosition}`));
}

runGSCAudit().catch(console.error);
