

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { songsMdTable } from "../schema/songsMd";
import { songMdDb } from "../services/neonDbClient";
import soundsS3 from "../services/s3Client";
import { envConfig } from "../config/envConfig";
import { parseBuffer } from "music-metadata";
import { eq } from "drizzle-orm";

// i added a new column to the SongMd schema,  `durationMillis`
// the column defaults to `0` for existing rows                                                
// to give existing songs the correct duration
// this function fetches them from S3, parses their duration, and updates the db 
const backfillDuration = async () => {
    const songsMd = await songMdDb.select().from(songsMdTable);

    for (const sng of songsMd) {
        const response = await soundsS3.send(
            new GetObjectCommand({
                Bucket: envConfig.AWS_BUCKET_NAME,
                Key: sng.s3Key,
            })
        );

        const songFileBuffer = Buffer.from(
            await response.Body!.transformToByteArray()
        );
        const song_metadata = await parseBuffer(songFileBuffer);
        const durationMillis = Math.round(
            song_metadata.format.duration! * 1000
        );

        await songMdDb
            .update(songsMdTable)
            .set({ durationMillis })
            .where(eq(songsMdTable.id, sng.id));

        console.log(`updated ${sng.title} - ${durationMillis}ms`);
    }
    console.log("backfill complete");
};

backfillDuration();
