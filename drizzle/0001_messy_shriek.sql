ALTER TABLE "songs_md" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "songs_md" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "songs_md" ADD COLUMN "s3_key" text NOT NULL;--> statement-breakpoint
ALTER TABLE "songs_md" ADD COLUMN "duration_millis" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "songs_md" ADD CONSTRAINT "songs_md_s3_key_unique" UNIQUE("s3_key");