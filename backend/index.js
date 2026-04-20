// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('./db'); // expects your existing better-sqlite3 db wrapper
const util = require('util');

const app = express();
app.use(cors());
app.use(express.json());

// ---------------------------------------------------
// CONFIG
// ---------------------------------------------------
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const DIAG_ENABLED = process.env.DIAG === 'true' || process.env.NODE_ENV !== 'production';

// ---------------------------------------------------
// Logging / diagnostic helpers
// ---------------------------------------------------
function nowIso() { return new Date().toISOString(); }

function makeLogger(requestId) {
  return {
    info: (...args) => console.log(`[${nowIso()}] [${requestId}] INFO:`, ...args),
    warn: (...args) => console.warn(`[${nowIso()}] [${requestId}] WARN:`, ...args),
    error: (...args) => console.error(`[${nowIso()}] [${requestId}] ERROR:`, ...args),
    debug: (...args) => { if (DIAG_ENABLED) console.log(`[${nowIso()}] [${requestId}] DEBUG:`, ...args); }
  };
}

app.use((req, res, next) => {
  req.requestId = uuidv4();
  req.startTime = Date.now();
  req.logger = makeLogger(req.requestId);
  req.logger.debug('Incoming request', { method: req.method, path: req.path, query: req.query, body: req.body });
  res.locals.diagnostic = { requestId: req.requestId, ts: nowIso() };
  next();
});

// ---------------------------------------------------
// Respond helpers (include diag in dev)
function respondOk(res, payload = {}) {
  if (DIAG_ENABLED) {
    payload.__diagnostic = Object.assign({}, res.locals.diagnostic, { latencyMs: Date.now() - (res.req.startTime || Date.now()) });
  }
  return res.json(payload);
}
function respondError(res, status = 500, message = 'internal error') {
  const body = { error: message };
  if (DIAG_ENABLED) body.__diagnostic = Object.assign({}, res.locals.diagnostic, { latencyMs: Date.now() - (res.req.startTime || Date.now()) });
  return res.status(status).json(body);
}

// ---------------------------------------------------
// AUTH MIDDLEWARE
// ---------------------------------------------------
function ensureAuth(req, res, next) {
  const logger = req.logger || makeLogger('no-request');
  const auth = req.headers.authorization;
  if (!auth) {
    logger.warn('Missing Authorization header');
    return res.status(401).json({ error: 'missing auth header', __diagnostic: res.locals.diagnostic });
  }
  const token = auth.replace(/^Bearer\s+/, '');
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, email }
    logger.debug('Token verified', { tokenPayload: payload });
    next();
  } catch (err) {
    logger.warn('Invalid token', err && err.message);
    return res.status(401).json({ error: 'invalid token', __diagnostic: res.locals.diagnostic });
  }
}

// ---------------------------------------------------
// EMAIL TRANSPORT
// ---------------------------------------------------
async function makeTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });
  }
}
let transporterPromise = makeTransporter();

async function sendOtpEmail(email, otp) {
  const transporter = await transporterPromise;
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"BloodDonate Dev" <no-reply@example.com>',
    to: email,
    subject: 'Your OTP code',
    text: `Your OTP code: ${otp} (valid for 5 minutes)`,
    html: `<p>Your OTP code: <b>${otp}</b> (valid for 5 minutes)</p>`
  });
  return info;
}

// ---------------------------------------------------
// ROUTES
// ---------------------------------------------------

// debug
app.get('/debug', (req, res) => {
  req.logger.info('GET /debug');
  respondOk(res, { ok: true, message: 'THIS IS THE CORRECT BACKEND FILE' });
});

// --------------------
// DONOR OTP send + verify (trim inputs, case-insensitive email lookup)
// --------------------
app.post('/auth/send-otp', async (req, res) => {
  const logger = req.logger;
  try {
    const emailRaw = req.body && req.body.email;
    const email = (emailRaw || '').toString().trim().toLowerCase();
    if (!email) {
      logger.warn('send-otp missing email');
      return respondError(res, 400, 'email required');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const id = uuidv4();
    const expiresAt = Date.now() + OTP_TTL_MS;

    db.prepare(`
      INSERT INTO otps(email, otp, expiresAt, uuid)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET otp=?, expiresAt=?, uuid=?
    `).run(email, otp, expiresAt, id, otp, expiresAt, id);

    const info = await sendOtpEmail(email, otp);
    const preview = nodemailer.getTestMessageUrl(info);

    logger.info('Sent donor OTP', { email, preview });
    respondOk(res, { ok: true, preview });
  } catch (err) {
    req.logger.error('send-otp error', err && err.stack || err);
    respondError(res, 500, 'failed to send OTP');
  }
});

app.post('/auth/verify-otp', (req, res) => {
  const logger = req.logger;
  try {
    const rawEmail = req.body && req.body.email;
    const rawOtp = req.body && req.body.otp;
    const email = (rawEmail || '').toString().trim().toLowerCase();
    const otp = (rawOtp || '').toString().trim();

    if (!email || !otp) {
      logger.warn('verify-otp missing fields', { received: req.body });
      return respondError(res, 400, 'email + otp required');
    }

    const row = db.prepare(`SELECT * FROM otps WHERE LOWER(email) = LOWER(?)`).get(email);
    if (!row) {
      logger.warn('verify-otp no otp found for email', email);
      return respondError(res, 400, 'no otp found');
    }

    if (Date.now() > row.expiresAt) {
      db.prepare('DELETE FROM otps WHERE email = ?').run(row.email || email);
      logger.warn('verify-otp expired for email', email);
      return respondError(res, 400, 'otp expired');
    }

    if ((row.otp || '').toString().trim() !== otp) {
      logger.warn('verify-otp invalid otp', { email, sentOtp: otp, storedOtp: (row.otp||'').toString().trim() });
      return respondError(res, 400, 'invalid otp');
    }

    db.prepare('DELETE FROM otps WHERE email = ?').run(row.email || email);

    db.prepare(`
      INSERT OR IGNORE INTO users (id, email, createdAt)
      VALUES (?, ?, ?)
    `).run(row.uuid, email, new Date().toISOString());

    const user = { id: row.uuid, email };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '8h' });

    logger.info('Donor verified, issuing token', { id: row.uuid, email });
    respondOk(res, { ok: true, token, user });
  } catch (err) {
    req.logger.error('verify-otp error', err && err.stack || err);
    respondError(res, 500, 'verify failed');
  }
});

// --------------------
// HOSPITAL OTP send + verify (trim inputs, optional profile fields)
// --------------------
app.post('/hospital/auth/send-otp', async (req, res) => {
  const logger = req.logger;
  try {
    const emailRaw = req.body && req.body.email;
    const email = (emailRaw || '').toString().trim().toLowerCase();
    if (!email) {
      logger.warn('hospital/send-otp missing email');
      return respondError(res, 400, 'email required');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const id = uuidv4();
    const expiresAt = Date.now() + OTP_TTL_MS;

    db.prepare(`
      INSERT INTO otps(email, otp, expiresAt, uuid)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET otp=?, expiresAt=?, uuid=?
    `).run(email, otp, expiresAt, id, otp, expiresAt, id);

    const info = await sendOtpEmail(email, otp);
    const preview = nodemailer.getTestMessageUrl(info);

    logger.info('Sent hospital OTP', { email, preview });
    respondOk(res, { ok: true, preview });
  } catch (err) {
    req.logger.error('hospital send-otp error', err && err.stack || err);
    respondError(res, 500, 'failed to send otp');
  }
});

// verify hospital OTP and save optional profile fields in one shot
app.post('/hospital/auth/verify-otp', (req, res) => {
  const logger = req.logger;
  try {
    const rawEmail = req.body && req.body.email;
    const rawOtp = req.body && req.body.otp;
    const email = (rawEmail || '').toString().trim().toLowerCase();
    const otp = (rawOtp || '').toString().trim();

    const { name, phone, address, city, state } = req.body;
    logger.info('hospital/verify-otp called', { email, hasProfile: !!(name||phone||address||city||state) });

    if (!email || !otp) {
      logger.warn('hospital/verify-otp missing fields', { received: req.body });
      return respondError(res, 400, 'email + otp required');
    }

    const row = db.prepare(`SELECT * FROM otps WHERE LOWER(email) = LOWER(?)`).get(email);
    if (!row) {
      logger.warn('hospital/verify-otp no otp found', email);
      return respondError(res, 400, 'no otp found');
    }

    if (Date.now() > row.expiresAt) {
      db.prepare('DELETE FROM otps WHERE email = ?').run(row.email || email);
      logger.warn('hospital/verify-otp expired', email);
      return respondError(res, 400, 'otp expired');
    }

    if ((row.otp || '').toString().trim() !== otp) {
      logger.warn('hospital/verify-otp invalid otp', email, { sentOtp: otp, storedOtp: (row.otp||'').toString().trim() });
      return respondError(res, 400, 'invalid otp');
    }

    // consume OTP
    db.prepare('DELETE FROM otps WHERE email = ?').run(row.email || email);
    logger.debug('Consumed OTP for email', email);

    // ensure hospital row exists
    db.prepare(`
      INSERT OR IGNORE INTO hospitals (id, email, createdAt)
      VALUES (?, ?, ?)
    `).run(row.uuid, email, new Date().toISOString());

    // update profile if fields provided
    const profileFields = { name, phone, address, city, state };
    const keys = Object.keys(profileFields).filter(k => profileFields[k] !== undefined && profileFields[k] !== null && profileFields[k] !== '');
    if (keys.length > 0) {
      const updates = keys.map(k => `${k} = ?`).join(', ');
      const values = keys.map(k => profileFields[k]);
      values.push(new Date().toISOString(), row.uuid);
      const info = db.prepare(`UPDATE hospitals SET ${updates}, updatedAt = ? WHERE id = ?`).run(...values);
      logger.info('Updated hospital profile during verify-otp', { id: row.uuid, keys, updateInfo: info });
    } else {
      logger.debug('No profile fields provided during verify-otp');
    }

    const hospital = db.prepare(`SELECT * FROM hospitals WHERE id = ?`).get(row.uuid);
    const tokenPayload = { id: row.uuid, email };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '8h' });

    logger.info('hospital verified, issuing token and returning hospital', { id: row.uuid, email });
    respondOk(res, { ok: true, token, hospital });
  } catch (err) {
    req.logger.error('hospital verify-otp error', err && err.stack || err);
    respondError(res, 500, 'verify failed');
  }
});

// ---------------------------------------------------
// Basic auth check
// ---------------------------------------------------
app.get('/me', ensureAuth, (req, res) => {
  req.logger.info('GET /me', { user: req.user });
  respondOk(res, { ok: true, user: req.user });
});

// ---------------------------------------------------
// HOSPITAL PROFILE ROUTES (PUT + GET) with robust logging and fallback by email
// ---------------------------------------------------
app.put('/hospital/profile', ensureAuth, (req, res) => {
  const logger = req.logger;
  try {
    const hospitalId = req.user.id;
    logger.info('PUT /hospital/profile called', { hospitalId, body: req.body });

    const allowed = ['name', 'phone', 'address', 'city', 'state'];
    const fields = [];
    const values = [];

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(req.body[key]);
      }
    }

    if (fields.length === 0) {
      logger.warn('PUT /hospital/profile nothing to update', { hospitalId });
      return respondError(res, 400, 'nothing to update');
    }

    values.push(new Date().toISOString());
    values.push(hospitalId);

    const info = db.prepare(`
      UPDATE hospitals SET ${fields.join(', ')}, updatedAt = ?
      WHERE id = ?
    `).run(...values);

    logger.info('Executed UPDATE hospitals', { hospitalId, fields, updateInfo: info });

    const hospital = db.prepare(`SELECT * FROM hospitals WHERE id = ?`).get(hospitalId);
    logger.debug('Selected hospital after update', hospital);

    respondOk(res, { ok: true, hospital });
  } catch (err) {
    req.logger.error('PUT /hospital/profile error', err && err.stack || err);
    respondError(res, 500, 'failed to update hospital profile');
  }
});

app.get('/hospital/profile', ensureAuth, (req, res) => {
  const logger = req.logger;
  try {
    const hospitalId = req.user && req.user.id;
    const hospitalEmail = req.user && req.user.email;
    logger.info('GET /hospital/profile called', { hospitalId, hospitalEmail });

    let hospital = db.prepare(`SELECT * FROM hospitals WHERE id = ?`).get(hospitalId);
    logger.debug('selected by id', hospital);

    if (!hospital && hospitalEmail) {
      hospital = db.prepare(`SELECT * FROM hospitals WHERE LOWER(email) = LOWER(?)`).get(hospitalEmail);
      logger.debug('fallback selected by email', hospital);
    }

    if (!hospital) {
      logger.warn('No hospital row found by id or email', { hospitalId, hospitalEmail });
      return respondOk(res, { ok: true, hospital: null });
    }

    const nullFields = [];
    ['name', 'phone', 'address', 'city', 'state'].forEach(f => {
      if (hospital[f] === null || hospital[f] === undefined || hospital[f] === '') nullFields.push(f);
    });
    if (nullFields.length > 0) {
      logger.warn('Hospital row has empty profile fields', { hospitalId: hospital.id, nullFields });
    } else {
      logger.info('Hospital profile fully populated', { hospitalId: hospital.id });
    }

    respondOk(res, { ok: true, hospital });
  } catch (err) {
    req.logger.error('GET /hospital/profile error', err && err.stack || err);
    respondError(res, 500, 'failed to fetch hospital profile');
  }
});

// ---------------------------------------------------
// DONOR routes (instrumented)
// ---------------------------------------------------
app.post('/donors', ensureAuth, (req, res) => {
  const logger = req.logger;
  try {
    const userId = req.user.id;
    const email = req.user.email;
    const { name, phone, age, gender, bloodType, state, city } = req.body;
    logger.info('POST /donors', { userId, email, body: req.body });

    const now = new Date().toISOString();
    const result = db.prepare(`
      INSERT INTO donors (userId, email, name, phone, age, gender, bloodType, state, city, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, email, name, phone, age, gender, bloodType, state, city, now, now);

    const donor = db.prepare(`SELECT * FROM donors WHERE id = ?`).get(result.lastInsertRowid);
    logger.info('Donor created', { donorId: donor.id });
    respondOk(res, { ok: true, donor });
  } catch (err) {
    req.logger.error('POST /donors error', err && err.stack || err);
    respondError(res, 500, 'failed to create donor profile');
  }
});

app.get('/donors/me', ensureAuth, (req, res) => {
  const logger = req.logger;
  try {
    const userId = req.user.id;
    const donor = db.prepare(`SELECT * FROM donors WHERE userId = ?`).get(userId);
    logger.info('GET /donors/me', { userId, found: !!donor });
    respondOk(res, { ok: true, donor });
  } catch (err) {
    req.logger.error('GET /donors/me error', err && err.stack || err);
    respondError(res, 500, 'failed to fetch donor profile');
  }
});

app.put('/donors/me', ensureAuth, (req, res) => {
  const logger = req.logger;
  try {
    const userId = req.user.id;
    logger.info('PUT /donors/me', { userId, body: req.body });

    const allowed = ['name', 'phone', 'age', 'gender', 'bloodType', 'state', 'city'];
    const fields = [];
    const values = [];

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(req.body[key]);
      }
    }

    if (fields.length === 0) {
      logger.warn('PUT /donors/me nothing to update', { userId });
      return respondError(res, 400, 'nothing to update');
    }

    values.push(new Date().toISOString());
    values.push(userId);

    const info = db.prepare(`
      UPDATE donors SET ${fields.join(', ')}, updatedAt = ?
      WHERE userId = ?
    `).run(...values);

    logger.info('Updated donors row', { userId, updateInfo: info });
    const donor = db.prepare(`SELECT * FROM donors WHERE userId = ?`).get(userId);
    respondOk(res, { ok: true, donor });
  } catch (err) {
    req.logger.error('PUT /donors/me error', err && err.stack || err);
    respondError(res, 500, 'failed to update donor profile');
  }
});

// ---------------------------------------------------
// REQUESTS & MATCHING
// ---------------------------------------------------
app.post('/requests', (req, res) => {
  const logger = req.logger;
  try {
    const { requesterEmail, bloodType, city, state, message } = req.body;
    logger.info('POST /requests', { body: req.body });

    if (!requesterEmail || !bloodType || !city || !state) {
      logger.warn('POST /requests missing fields', req.body);
      return respondError(res, 400, 'missing fields');
    }

    const now = new Date().toISOString();
    const result = db.prepare(`
      INSERT INTO requests (requesterEmail, bloodType, city, state, message, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(requesterEmail, bloodType, city, state, message || '', now);

    const request = db.prepare(`SELECT * FROM requests WHERE id = ?`).get(result.lastInsertRowid);
    logger.info('Created request', { requestId: request.id });
    respondOk(res, { ok: true, request });
  } catch (err) {
    req.logger.error('POST /requests error', err && err.stack || err);
    respondError(res, 500, 'failed to create request');
  }
});

app.get('/requests', (req, res) => {
  const logger = req.logger;
  try {
    const requests = db.prepare(`SELECT * FROM requests ORDER BY createdAt DESC`).all();
    logger.info('GET /requests', { count: requests.length });
    respondOk(res, { ok: true, requests });
  } catch (err) {
    req.logger.error('GET /requests error', err && err.stack || err);
    respondError(res, 500, 'failed to fetch requests');
  }
});

app.get('/requests/search', (req, res) => {
  const logger = req.logger;
  try {
    const { bloodType, city, state } = req.query;
    logger.info('GET /requests/search', { query: req.query });

    let sql = `SELECT * FROM requests WHERE 1=1`;
    const params = [];

    if (bloodType) { sql += ` AND bloodType = ?`; params.push(bloodType); }
    if (city) { sql += ` AND city = ?`; params.push(city); }
    if (state) { sql += ` AND state = ?`; params.push(state); }

    sql += ` ORDER BY createdAt DESC`;

    const results = db.prepare(sql).all(...params);
    logger.info('Search results', { count: results.length });
    respondOk(res, { ok: true, results });
  } catch (err) {
    req.logger.error('GET /requests/search error', err && err.stack || err);
    respondError(res, 500, 'search failed');
  }
});

// Hospital's own requests
app.get('/hospital/requests', ensureAuth, (req, res) => {
  const logger = req.logger;
  try {
    const hospitalEmail = req.user.email;
    logger.info('GET /hospital/requests', { hospitalEmail });

    const requests = db.prepare(`
      SELECT * FROM requests
      WHERE requesterEmail = ?
      ORDER BY createdAt DESC
    `).all(hospitalEmail);

    respondOk(res, { ok: true, requests });
  } catch (err) {
    req.logger.error('GET /hospital/requests error', err && err.stack || err);
    respondError(res, 500, 'failed to fetch hospital requests');
  }
});

app.put('/hospital/requests/:id', ensureAuth, (req, res) => {
  const logger = req.logger;
  try {
    const hospitalEmail = req.user.email;
    const { id } = req.params;
    logger.info('PUT /hospital/requests/:id', { hospitalEmail, id, body: req.body });

    const fields = ['bloodType', 'city', 'state', 'message'];
    const updates = [];
    const values = [];

    for (const f of fields) {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = ?`);
        values.push(req.body[f]);
      }
    }

    if (updates.length === 0) {
      logger.warn('PUT /hospital/requests nothing to update', { id, hospitalEmail });
      return respondError(res, 400, 'nothing to update');
    }

    values.push(id, hospitalEmail);

    const result = db.prepare(`
      UPDATE requests
      SET ${updates.join(', ')}
      WHERE id = ? AND requesterEmail = ?
    `).run(...values);

    if (result.changes === 0) {
      logger.warn('PUT /hospital/requests no rows changed (not found or not allowed)', { id, hospitalEmail, result });
      return respondError(res, 403, 'not allowed or request not found');
    }

    const request = db.prepare(`SELECT * FROM requests WHERE id = ?`).get(id);
    logger.info('Updated hospital request', { id });
    respondOk(res, { ok: true, request });
  } catch (err) {
    req.logger.error('PUT /hospital/requests error', err && err.stack || err);
    respondError(res, 500, 'update failed');
  }
});

app.delete('/hospital/requests/:id', ensureAuth, (req, res) => {
  const logger = req.logger;
  try {
    const hospitalEmail = req.user.email;
    const { id } = req.params;
    logger.info('DELETE /hospital/requests/:id', { hospitalEmail, id });

    const result = db.prepare(`
      DELETE FROM requests
      WHERE id = ? AND requesterEmail = ?
    `).run(id, hospitalEmail);

    if (result.changes === 0) {
      logger.warn('DELETE /hospital/requests no rows deleted', { id, hospitalEmail });
      return respondError(res, 403, 'not allowed or request not found');
    }

    logger.info('Deleted hospital request', { id });
    respondOk(res, { ok: true, deleted: true });
  } catch (err) {
    req.logger.error('DELETE /hospital/requests error', err && err.stack || err);
    respondError(res, 500, 'delete failed');
  }
});

// Matching donors
function compatibleDonorTypes(recipientType) {
  const t = (recipientType || '').toUpperCase();
  const map = {
    'O-': ['O-'],
    'O+': ['O-','O+'],
    'A-': ['O-','A-'],
    'A+': ['O-','O+','A-','A+'],
    'B-': ['O-','B-'],
    'B+': ['O-','O+','B-','B+'],
    'AB-': ['O-','A-','B-','AB-'],
    'AB+': ['O-','O+','A-','A+','B-','B+','AB-','AB+']
  };
  return map[t] || ['O-','O+','A-','A+','B-','B+','AB-','AB+'];
}

app.post('/match', ensureAuth, (req, res) => {
  const logger = req.logger;
  try {
    const rawBlood = req.body?.bloodType || "";
    const rawState = req.body?.state || "";
    const rawCity  = req.body?.city  || "";

    const bloodType = rawBlood.trim();
    const state = rawState.trim();
    const city  = rawCity.trim();

    logger.info("POST /match", { bloodType, state, city });

    if (!bloodType) return respondError(res, 400, "bloodType required");

    const compatible = compatibleDonorTypes(bloodType);

    // ------------------------------------------------------
    // 1️⃣ Try strict match: bloodType-compatible + same city + same state
    // ------------------------------------------------------
    let sql = `
      SELECT * FROM donors
      WHERE bloodType IN (${compatible.map(() => "?").join(",")})
        AND LOWER(state) = LOWER(?)
        AND LOWER(city)  = LOWER(?)
      ORDER BY createdAt DESC
    `;
    let params = [...compatible, state, city];

    let donors = db.prepare(sql).all(...params);

    logger.info("City match count", { count: donors.length });

    // If city match found → return immediately
    if (donors.length > 0) {
      return respondOk(res, {
        ok: true,
        mode: "city-match",
        compatibleWith: compatible,
        donors
      });
    }

    // ------------------------------------------------------
    // 2️⃣ Fallback match: only same state + bloodType
    // ------------------------------------------------------
    sql = `
      SELECT * FROM donors
      WHERE bloodType IN (${compatible.map(() => "?").join(",")})
        AND LOWER(state) = LOWER(?)
      ORDER BY createdAt DESC
    `;
    params = [...compatible, state];

    donors = db.prepare(sql).all(...params);

    logger.info("State fallback count", { count: donors.length });

    if (donors.length > 0) {
      return respondOk(res, {
        ok: true,
        mode: "state-match",
        compatibleWith: compatible,
        donors
      });
    }

    // ------------------------------------------------------
    // 3️⃣ Final fallback: any compatible donor in entire system
    // ------------------------------------------------------
    sql = `
      SELECT * FROM donors
      WHERE bloodType IN (${compatible.map(() => "?").join(",")})
      ORDER BY createdAt DESC
    `;
    params = [...compatible];

    donors = db.prepare(sql).all(...params);

    logger.info("Global fallback count", { count: donors.length });

    return respondOk(res, {
      ok: true,
      mode: "global-match",
      compatibleWith: compatible,
      donors
    });

  } catch (err) {
    logger.error("/match error", err);
    respondError(res, 500, "match failed");
  }
});// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

