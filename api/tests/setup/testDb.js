const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const testDbPath = path.join(__dirname, '../../database.test.sqlite');
const schemaPath = path.join(__dirname, '../../src/database/schema.sql');

let db;

const initTestDatabase = () => {
  // Remove existing test database if it exists
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  // Create new test database
  db = new Database(testDbPath);

  // Read and execute schema
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);

  return db;
};

const getTestDatabase = () => {
  if (!db) {
    db = initTestDatabase();
  }
  return db;
};

const clearDatabase = () => {
  if (!db) return;

  // Clear all tables in reverse order to respect foreign keys
  db.prepare('DELETE FROM votes').run();
  db.prepare('DELETE FROM features').run();
  db.prepare('DELETE FROM users').run();
};

const closeTestDatabase = () => {
  if (db) {
    db.close();
    db = null;
  }

  // Remove test database file
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
};

module.exports = {
  initTestDatabase,
  getTestDatabase,
  clearDatabase,
  closeTestDatabase,
  testDbPath
};
