import Database from "better-sqlite3";

const db__sounds_md = new Database("songs_md.db");

db__sounds_md.exec(`
    CREATE TABLE IF NOT EXISTS songs_md (
        id TEXT PRIMARY KEY,
        is_uploaded INTEGER DEFAULT 0
    )
`)

export default db__sounds_md;