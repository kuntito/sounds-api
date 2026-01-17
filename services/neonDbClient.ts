import { Pool } from "pg";
import { envConfig } from "../config/envConfig";

console.log("neonClient module loaded");

const neonDbClient = new Pool({
    connectionString: envConfig.NEON_CONN_STR,
    // encrypts connection, skips certificate verification (acceptable for personal app)
    ssl: { rejectUnauthorized: false },
});

neonDbClient
    .query(
        `
    CREATE TABLE IF NOT EXISTS songs_md (
        id TEXT PRIMARY KEY,
        title TEXT,
        artist TEXT
    )
`
    )
    .catch((err) => console.error("Table creation failed:", err));

export default neonDbClient;
