import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

export const songsMdTable = pgTable("songs_md", {
    id: uuid("id").primaryKey().defaultRandom(),
    s3Key: text("s3_key").notNull().unique(),
    title: text("title"),
    artist: text("artist"),
    albumArtUrl: text("album_art_url"),
    durationMillis: integer("duration_millis").notNull(),
});

export type SongMd = typeof songsMdTable.$inferSelect;
