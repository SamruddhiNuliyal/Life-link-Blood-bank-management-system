// migrations/add_hospital_columns.js
// Run from project root: node migrations/add_hospital_columns.js

const path = require('path');
const db = require(path.resolve(__dirname, '..', 'db')); // uses your existing db.js

function columnExists(tableName, colName) {
  const rows = db.prepare(`PRAGMA table_info(${tableName})`).all();
  return rows.some(r => r.name === colName);
}

function addColumnIfMissing(tableName, colName, definition) {
  if (columnExists(tableName, colName)) {
    console.log(`Column ${colName} already exists on ${tableName}, skipping.`);
    return;
  }
  console.log(`Adding column ${colName} to ${tableName} ...`);
  db.prepare(`ALTER TABLE ${tableName} ADD COLUMN ${colName} ${definition}`).run();
  console.log(`Added ${colName}.`);
}

try {
  addColumnIfMissing('hospitals', 'name', 'TEXT');
  addColumnIfMissing('hospitals', 'phone', 'TEXT');
  addColumnIfMissing('hospitals', 'address', 'TEXT');
  addColumnIfMissing('hospitals', 'city', 'TEXT');
  addColumnIfMissing('hospitals', 'state', 'TEXT');

  console.log('Migration complete.');
  process.exit(0);
} catch (err) {
  console.error('Migration failed:', err);
  process.exit(1);
}
