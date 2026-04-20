// migrations/check_hospitals.js
const path = require('path');
const db = require(path.resolve(__dirname, '..', 'db'));

console.log('--- table columns for hospitals ---');
const cols = db.prepare("PRAGMA table_info(hospitals)").all();
console.table(cols.map(c => ({ name: c.name, type: c.type })));

console.log('--- first hospital row ---');
const row = db.prepare("SELECT * FROM hospitals LIMIT 1").get();
console.log(row);
