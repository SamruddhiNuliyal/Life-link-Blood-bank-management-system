// migrations/patch_hospital_row.js
const path = require('path');
const db = require(path.resolve(__dirname, '..', 'db'));

// Replace this id with the id from your check_hospitals output
const hospitalId = '7d763115-030a-4936-baf0-df00caa6c135';

const data = {
  name: 'Test Hospital',
  phone: '9876543210',
  address: '12 Example Street',
  city: 'Kannur',
  state: 'Kerala'
};

console.log('Updating hospital id=', hospitalId, 'with', data);

db.prepare(`
  UPDATE hospitals
  SET name = ?, phone = ?, address = ?, city = ?, state = ?, updatedAt = ?
  WHERE id = ?
`).run(data.name, data.phone, data.address, data.city, data.state, new Date().toISOString(), hospitalId);

const row = db.prepare('SELECT * FROM hospitals WHERE id = ?').get(hospitalId);
console.log('Updated row:', row);
