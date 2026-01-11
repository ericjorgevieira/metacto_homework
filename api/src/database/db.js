const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../../database.sqlite');
const schemaPath = path.join(__dirname, 'schema.sql');

// Create database connection
const db = new Database(dbPath);

console.log('Connected to SQLite database');

// Initialize database with schema
const initializeDatabase = () => {
  const schema = fs.readFileSync(schemaPath, 'utf8');

  try {
    db.exec(schema);
    console.log('Database schema initialized');
  } catch (err) {
    console.error('Error initializing database:', err.message);
  }
};

// Run initialization
initializeDatabase();

module.exports = db;
