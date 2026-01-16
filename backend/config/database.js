const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

// Create/open SQLite database
const dbPath = path.join(__dirname, '..', 'registration.db');
const db = new Database(dbPath);

console.log('Database connected:', dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    passbook_no TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    passbook_no TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    device_info TEXT,
    FOREIGN KEY (member_id) REFERENCES members(id)
  );

  CREATE INDEX IF NOT EXISTS idx_members_passbook ON members(passbook_no);
  CREATE INDEX IF NOT EXISTS idx_registrations_passbook ON registrations(passbook_no);
  CREATE INDEX IF NOT EXISTS idx_registrations_date ON registrations(registration_date);
`);

// Wrapper to match PostgreSQL-style query interface
const query = (text, params = []) => {
  try {
    // Convert PostgreSQL $1, $2 placeholders to SQLite ? placeholders
    let sqliteQuery = text;
    if (params && params.length > 0) {
      for (let i = params.length; i >= 1; i--) {
        sqliteQuery = sqliteQuery.replace(new RegExp(`\\$${i}`, 'g'), '?');
      }
    }

    // Handle SELECT queries
    if (sqliteQuery.trim().toUpperCase().startsWith('SELECT')) {
      const stmt = db.prepare(sqliteQuery);
      const rows = stmt.all(...params);
      return { rows };
    }

    // Handle INSERT/UPDATE/DELETE with RETURNING
    if (sqliteQuery.includes('RETURNING')) {
      const returningMatch = sqliteQuery.match(/RETURNING\s+\*/i);
      const baseQuery = sqliteQuery.replace(/\s+RETURNING\s+\*/i, '');
      
      const stmt = db.prepare(baseQuery);
      const info = stmt.run(...params);
      
      if (info.changes > 0 && baseQuery.trim().toUpperCase().startsWith('INSERT')) {
        // Get the inserted row
        const selectStmt = db.prepare('SELECT * FROM ' + 
          baseQuery.match(/INSERT\s+INTO\s+(\w+)/i)[1] + 
          ' WHERE id = ?');
        const rows = [selectStmt.get(info.lastInsertRowid)];
        return { rows };
      }
      
      return { rows: [{ id: info.lastInsertRowid }] };
    }

    // Handle regular INSERT/UPDATE/DELETE
    const stmt = db.prepare(sqliteQuery);
    const info = stmt.run(...params);
    return { rows: [], rowCount: info.changes };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

module.exports = {
  query,
  db,
};
