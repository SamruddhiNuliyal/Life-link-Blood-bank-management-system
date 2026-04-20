// migrations/debug_hospital_profile.js
// Usage:
// 1) Dry run (no remote requests): node migrations/debug_hospital_profile.js
// 2) With server HTTP checks (needs HOSP_TOKEN): 
//    Linux/macOS: HOSP_TOKEN="..." node migrations/debug_hospital_profile.js
//    Windows PS: $env:HOSP_TOKEN="..."; node migrations\\debug_hospital_profile.js
// 3) To actually run PUT test (will modify DB via server): add --apply
//    e.g. HOSP_TOKEN="..." node migrations/debug_hospital_profile.js --apply

const path = require('path');
const db = require(path.resolve(__dirname, '..', 'db'));
const { argv, env } = require('process');

const APPLY = argv.includes('--apply');
const PORT = env.PORT || 4000;
const API_BASE = `http://localhost:${PORT}`;
const HOSP_TOKEN = env.HOSP_TOKEN || null;

function printDivider(title) {
  console.log('\n' + '='.repeat(10) + ' ' + title + ' ' + '='.repeat(10));
}

async function httpGet(pathname, token) {
  try {
    const res = await fetch(`${API_BASE}${pathname}`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const txt = await res.text();
    let j;
    try { j = JSON.parse(txt); } catch { j = txt; }
    return { ok: true, status: res.status, body: j };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

async function httpPut(pathname, token, body) {
  try {
    const res = await fetch(`${API_BASE}${pathname}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body)
    });
    const txt = await res.text();
    let j;
    try { j = JSON.parse(txt); } catch { j = txt; }
    return { ok: true, status: res.status, body: j };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

(async function main(){
  try {
    printDivider('LOCAL DB: hospitals table schema');
    const cols = db.prepare("PRAGMA table_info(hospitals)").all();
    if (!cols || cols.length === 0) {
      console.log('No hospitals table found (PRAGMA returned empty).');
    } else {
      console.table(cols.map(c => ({ cid: c.cid, name: c.name, type: c.type, notnull: c.notnull, dflt_value: c.dflt_value })));
    }

    printDivider('LOCAL DB: sample hospital rows (first 10)');
    const rows = db.prepare("SELECT * FROM hospitals ORDER BY createdAt DESC LIMIT 10").all();
    console.log(`Found ${rows.length} row(s).`);
    rows.forEach((r, i) => {
      console.log(`--- row[${i}] ---`);
      console.log(r);
    });

    // If server reachable check
    printDivider('SERVER: health check /debug');
    const debugRes = await httpGet('/debug', null);
    if (!debugRes.ok) {
      console.log('Server HTTP check failed:', debugRes.error);
      console.log(`Make sure your server is running (node index.js) on port ${PORT}`);
    } else {
      console.log('Server response status:', debugRes.status);
      console.log('Server /debug response body (truncated):', typeof debugRes.body === 'string' ? debugRes.body.slice(0,200) : debugRes.body);
    }

    if (!HOSP_TOKEN) {
      printDivider('NOTE: HOSP_TOKEN not set');
      console.log('To check GET/PUT endpoints you must set env var HOSP_TOKEN to your hospital token.');
      console.log('Example (PowerShell):');
      console.log('  $env:HOSP_TOKEN=\"your-token-here\"; node migrations\\\\debug_hospital_profile.js');
      console.log('Example (Linux/macOS):');
      console.log('  HOSP_TOKEN=\"your-token-here\" node migrations/debug_hospital_profile.js');
      return;
    }

    printDivider('SERVER: GET /hospital/profile with provided token');
    const getRes = await httpGet('/hospital/profile', HOSP_TOKEN);
    if (!getRes.ok) {
      console.log('GET /hospital/profile failed:', getRes.error);
    } else {
      console.log('Status:', getRes.status);
      console.log('Response body:', JSON.stringify(getRes.body, null, 2));
    }

    if (!APPLY) {
      printDivider('DRY RUN: PUT test skipped (use --apply to run a real PUT via server)');
      console.log('If you want the script to attempt a save (PUT), re-run with --apply:');
      console.log('  e.g. HOSP_TOKEN="..." node migrations/debug_hospital_profile.js --apply');
      return;
    }

    printDivider('RUNNING: PUT /hospital/profile (test payload)');

    const testPayload = {
      name: 'AutoTest Hospital',
      phone: '9999999999',
      address: 'Debug Street 1',
      city: 'DebugCity',
      state: 'DebugState'
    };

    const putRes = await httpPut('/hospital/profile', HOSP_TOKEN, testPayload);
    if (!putRes.ok) {
      console.log('PUT failed:', putRes.error);
    } else {
      console.log('PUT status:', putRes.status);
      console.log('PUT response body:', JSON.stringify(putRes.body, null, 2));
    }

    printDivider('VERIFY: GET /hospital/profile after PUT');
    const getAfter = await httpGet('/hospital/profile', HOSP_TOKEN);
    if (!getAfter.ok) {
      console.log('GET (after) failed:', getAfter.error);
    } else {
      console.log('GET (after) status:', getAfter.status);
      console.log('GET (after) body:', JSON.stringify(getAfter.body, null, 2));
    }

    printDivider('DB VERIFY: re-select hospital row for token id (if server returned hospital.id)');
    let idFromServer = null;
    if (getAfter.ok && getAfter.body && typeof getAfter.body === 'object') {
      const maybeHospital = getAfter.body.hospital || getAfter.body.user || getAfter.body;
      if (maybeHospital && maybeHospital.id) idFromServer = maybeHospital.id;
    }
    if (idFromServer) {
      console.log('Server returned hospital id =', idFromServer);
      const dbRow = db.prepare('SELECT * FROM hospitals WHERE id = ?').get(idFromServer);
      console.log('DB row for that id:', dbRow);
    } else {
      console.log('Server did not return a hospital.id in GET response; cannot re-query DB by server id. Inspect GET response above.');
    }

    printDivider('END: Summary suggestions');
    console.log('- If GET /hospital/profile returns only { ok: true } then the server is not returning hospital data. Ensure you restarted the server after code changes and that the running server file is the edited one.');
    console.log('- If PUT returned success but GET still returns no data, check the token hospital id vs DB row id above (we printed DB rows earlier).');
    console.log('- If UPDATE returned "changes: 0" in the server response (if it returned info), it likely updated 0 rows: means the token id did not match any row id in DB.');

  } catch (err) {
    console.error('FATAL error in debug script:', err);
  }
})();
