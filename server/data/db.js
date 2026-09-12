import { DatabaseSync } from "node:sqlite";
import path from "path";
import { fileURLToPath } from "url";
import { PROBLEM_CATEGORIES } from "../data/problemCategories.js";
import { STEPS_BY_CATEGORY } from "../data/troubleshootingSteps.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "smartdesk.db");

/**
 * Real SQLite database, replacing the plain JS arrays in server/data/*.js
 * as the actual source of truth — those files are now only used to seed
 * the database on first run, per the proposal's "efficient IndexedDB /
 * SQLite search database" requirement.
 *
 * Uses Node's built-in `node:sqlite` module (available from Node 22.5+,
 * confirmed working on this machine) instead of a third-party package
 * like better-sqlite3, specifically to avoid a native-compilation
 * install step that could fail depending on what build tools are
 * present on a given machine.
 *
 * NOTE: node:sqlite is still marked experimental by Node.js itself — it
 * works correctly as of this Node version, but its API could change in
 * a future Node release. Prints a one-line harmless warning on startup.
 */
export function getDb() {
  const db = new DatabaseSync(DB_PATH);
  initSchema(db);
  seedIfEmpty(db);
  return db;
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      issueCount INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS steps (
      id TEXT PRIMARY KEY,
      categoryId TEXT NOT NULL,
      stepOrder INTEGER NOT NULL,
      title TEXT NOT NULL,
      instruction TEXT,
      image TEXT,
      type TEXT,
      FOREIGN KEY (categoryId) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS diagnostic_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      categoryId TEXT,
      outcome TEXT,
      payload TEXT,
      createdAt TEXT DEFAULT (datetime('now'))
    );
  `);
}

function seedIfEmpty(db) {
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM categories").get();
  if (count > 0) return;

  const insertCategory = db.prepare(
    "INSERT INTO categories (id, label, description, icon, issueCount) VALUES (?, ?, ?, ?, ?)"
  );
  for (const c of PROBLEM_CATEGORIES) {
    insertCategory.run(c.id, c.label, c.description, c.icon, c.issueCount);
  }

  const insertStep = db.prepare(
    "INSERT INTO steps (id, categoryId, stepOrder, title, instruction, image, type) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  for (const [categoryId, steps] of Object.entries(STEPS_BY_CATEGORY)) {
    steps.forEach((step, index) => {
      insertStep.run(
        step.id,
        categoryId,
        index,
        step.title,
        step.instruction,
        step.image,
        step.type ?? null
      );
    });
  }
}

export function getCategoriesFromDb(db) {
  return db.prepare("SELECT * FROM categories").all();
}

export function getStepsForCategoryFromDb(db, categoryId) {
  return db
    .prepare("SELECT * FROM steps WHERE categoryId = ? ORDER BY stepOrder ASC")
    .all(categoryId);
}

export function insertDiagnosticLog(db, { categoryId, outcome, payload }) {
  db.prepare(
    "INSERT INTO diagnostic_logs (categoryId, outcome, payload) VALUES (?, ?, ?)"
  ).run(categoryId, outcome, JSON.stringify(payload ?? {}));
}
