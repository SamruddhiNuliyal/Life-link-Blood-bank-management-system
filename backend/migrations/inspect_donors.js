// migrations/inspect_donors.js
const db = require('../db'); // same require path you use in index.js

console.log("=== donors table schema ===");
try {
  const info = db.prepare("PRAGMA table_info(donors)").all();
  console.table(info.map(r => ({ cid: r.cid, name: r.name, type: r.type, notnull: r.notnull, dflt: r.dflt_value })));
} catch (e) {
  console.error("failed reading schema:", e.message);
}

console.log("\n=== first 20 donors rows ===");
try {
  const rows = db.prepare("SELECT * FROM donors ORDER BY createdAt DESC LIMIT 20").all();
  console.log("Found", rows.length, "row(s).");
  rows.forEach((r, i) => {
    console.log(`--- row[${i}] ---`);
    console.log(r);
  });
} catch (e) {
  console.error("failed reading rows:", e.message);
}
