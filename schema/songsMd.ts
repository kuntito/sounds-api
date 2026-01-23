import { pgTable, text } from "drizzle-orm/pg-core";

export const songsMdTable = pgTable("songs_md", {
    id: text("id").primaryKey(),
    title: text("title"),
    artist: text("artist"),
});

export type SongMd = typeof songsMdTable.$inferSelect;
