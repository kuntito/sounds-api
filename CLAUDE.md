# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

sounds-api is a TypeScript/Express REST API for managing music files. It handles MP3 uploads to AWS S3 with metadata storage in Neon PostgreSQL, and provides song synchronization via signed URLs.

## Commands

```bash
npm run dev    # Start server with nodemon (hot reload)
```

Server runs on port 5000. Base API path: `/api/sounds`

## Architecture

```
server.ts                    # Express app entry, mounts routes
├── routes/songRoutes.ts     # Route definitions
├── requestHandler/          # Business logic for each endpoint
│   ├── uploadSong.ts        # POST /song - uploads MP3 to S3, stores metadata
│   ├── getNewSongs.ts       # POST /new-songs - returns signed URLs for songs client doesn't have
│   └── deleteSong.ts        # DELETE /:songId - removes from DB and S3
├── services/
│   ├── neonDbClient.ts      # PostgreSQL connection pool
│   └── s3Client.ts          # AWS S3 client
├── config/envConfig.ts      # Environment variable validation (fails fast on missing vars)
└── util/
    ├── getS3ObjectUrl.ts    # Generates 1-hour signed S3 URLs
    └── secs.ts              # Time conversion helper
```

## Key Flows

**Upload:** Validate MP3 exists → Generate UUID → Embed S3 key in ID3 tags → Upload to S3 → Store metadata in PostgreSQL → Cleanup S3 on DB failure

**Sync:** Receive client's song IDs → Query all server IDs → Return signed URLs for set difference

## Database

PostgreSQL table `songs_md`: `id` (S3 key, PK), `title`, `artist`

## Environment Variables

All required in `.env`: `AWS_REGION`, `AWS_ACCESS_KEY`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET_NAME`, `NEON_CONN_STR`

## Testing Endpoints

Use `.rest` files in `requestHandler/` directory with REST Client extension.
