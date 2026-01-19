import { defineConfig } from 'drizzle-kit';
import { envConfig } from './config/envConfig';

export default defineConfig({
    schema: "./schema/songsMd.ts",
    dialect: 'postgresql',
    dbCredentials: {
        url: envConfig.NEON_CONN_STR
    }
})