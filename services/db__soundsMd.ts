import Database from "better-sqlite3";
import path from "path";

const db_name = "songs_md.db"
const db_path = path.join(
    process.cwd(),
    db_name,
)
const db__sounds_md = new Database(db_path);

db__sounds_md.exec(`
    CREATE TABLE IF NOT EXISTS songs_md (
        id TEXT PRIMARY KEY
    )
`)

export default db__sounds_md;