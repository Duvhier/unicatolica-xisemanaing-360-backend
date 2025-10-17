import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const defaultDbPath = process.env.DATABASE_PATH || './data/database.sqlite';

export function getDb(dbPath = defaultDbPath) {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const db = new Database(dbPath);
  return db;
}

export function migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS inscripciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      cedula TEXT NOT NULL,
      correo TEXT NOT NULL,
      telefono TEXT NOT NULL,
      programa TEXT NOT NULL,
      semestre TEXT NOT NULL,
      actividad TEXT NOT NULL,
      grupo_nombre TEXT,
      grupo_institucion TEXT,
      grupo_correo TEXT,
      grupo_telefono TEXT,
      proyecto_nombre TEXT,
      proyecto_descripcion TEXT,
      proyecto_categoria TEXT,
      integrantes_json TEXT,
      created_at TEXT NOT NULL
    );
  `);
}

// Allow running migrations via: node src/db.js --migrate
if (process.argv.includes('--migrate')) {
  const db = getDb();
  migrate(db);
  db.close();
  console.log('Database migrated.');
}


