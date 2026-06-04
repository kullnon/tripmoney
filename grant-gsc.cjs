// Requires service-account.json present in repo root to run (gitignored, not committed).
// Re-download the SA key from GCP before use, then shred it afterward.
const { google } = require('googleapis');
const path = require('path');
const KEY_FILE = path.join(__dirname, 'service-account.json');
const SITE_URL = 'sc-domain:mytripmoney.com';
async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/webmasters'],
  });
  const webmasters = google.webmasters({ version: 'v3', auth });
  try {
    await webmasters.sites.add({ siteUrl: SITE_URL });
    console.log('SUCCESS: site added / ' + SITE_URL);
  } catch (err) {
    console.error('FAILED:', err.errors || err.message);
  }
}
main();
