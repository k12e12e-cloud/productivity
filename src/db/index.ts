import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function initTables(sqlite: InstanceType<typeof Database>) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      okr_alignment TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT NOT NULL DEFAULT 'P1',
      status TEXT NOT NULL DEFAULT 'BACKLOG',
      project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
      context_tags TEXT NOT NULL DEFAULT '[]',
      due_date TEXT,
      time_estimate_minutes INTEGER,
      block_type TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
    CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
    CREATE TABLE IF NOT EXISTS inbox_items (
      id TEXT PRIMARY KEY,
      raw_input TEXT NOT NULL,
      processed INTEGER NOT NULL DEFAULT 0,
      classification_result TEXT,
      task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_inbox_processed_created ON inbox_items(processed, created_at);
    CREATE TABLE IF NOT EXISTS time_blocks (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
      block_type TEXT NOT NULL DEFAULT 'deep',
      label TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_timeblocks_date_start ON time_blocks(date, start_time);
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      metadata TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_chat_created ON chat_messages(created_at);
  `);
}

function getDb() {
  if (!_db) {
    const dbPath = path.join(process.cwd(), "data", "productivity.db");
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const sqlite = new Database(dbPath);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("busy_timeout = 5000");
    sqlite.pragma("foreign_keys = ON");

    initTables(sqlite);

    _db = drizzle(sqlite, { schema });
  }
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export { schema };
