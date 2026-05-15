// lib/gsc-client.js — Google Search Console API client (OAuth refresh-token based)
import { google } from 'googleapis';

let cachedAuth = null;

function getAuth() {
  if (cachedAuth) return cachedAuth;
  const oauth2 = new google.auth.OAuth2(
    process.env.GSC_OAUTH_CLIENT_ID,
    process.env.GSC_OAUTH_CLIENT_SECRET,
    'urn:ietf:wg:oauth:2.0:oob'
  );
  oauth2.setCredentials({ refresh_token: process.env.GSC_OAUTH_REFRESH_TOKEN });
  cachedAuth = oauth2;
  return oauth2;
}

/**
 * Fetch top queries for the configured GSC property over the last N days.
 * Returns aggregated rows by (query, page).
 */
export async function fetchTopQueries(days = 28, rowLimit = 1000) {
  const auth = getAuth();
  const webmasters = google.searchconsole({ version: 'v1', auth });

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - days);

  const res = await webmasters.searchanalytics.query({
    siteUrl: process.env.GSC_PROPERTY_URL,
    requestBody: {
      startDate: startDate.toISOString().slice(0, 10),
      endDate: today.toISOString().slice(0, 10),
      dimensions: ['query', 'page'],
      rowLimit,
      dataState: 'all',
    },
  });

  const rows = res.data.rows || [];
  return rows.map((r) => ({
    query: r.keys?.[0] || '',
    page: r.keys?.[1] || '',
    clicks: r.clicks || 0,
    impressions: r.impressions || 0,
    ctr: r.ctr || 0,
    position: r.position || 0,
  }));
}
