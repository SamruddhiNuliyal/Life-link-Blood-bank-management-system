// db.js
const Database = require('better-sqlite3');
const path = require('path');

// DB file will be created in the backend folder
const dbPath = path.join(__dirname, 'data.sqlite3');
const db = new Database(dbPath);

// create tables if not exist
db.exec(`
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS donors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT,
  email TEXT,
  name TEXT,
  phone TEXT,
  age TEXT,
  gender TEXT,
  bloodType TEXT,
  state TEXT,
  city TEXT,
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requesterEmail TEXT,
  bloodType TEXT,
  city TEXT,
  state TEXT,
  message TEXT,
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS otps (
  email TEXT PRIMARY KEY,
  otp TEXT,
  expiresAt INTEGER,
  uuid TEXT
);
CREATE TABLE IF NOT EXISTS hospitals (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  license TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  createdAt TEXT,
  updatedAt TEXT
);

`);

module.exports = db;
