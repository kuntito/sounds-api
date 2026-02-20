import { RequestHandler, Request, Response } from "express";
import { songMdDb } from "../services/neonDbClient";
import { SongMd, songsMdTable } from "../schema/songsMd";

type SongMdBasic = Omit<SongMd, 'albumArtUrl' | 's3Key'>;

type GetSongsMetadataResponse = {
    success: true;
    songsMd: SongMdBasic[];
} | {
    success: false;
    debug: object;
};

/**
* Returns metadata for all songs.
* 
* 200 OK
* {
*     "success": true,
*     "songsMd": [
*         { 
*          "id": "string (S3 key)",
*          "title": "string",
*          "artist": "string",
*        }
*     ]
* }
*
* 500 Internal Server Error
* {
*     "success": false,
*     "debug": { "message": "string" }
* }
*/
const getSongsMetadata = async (
    req: Request, 
    res: Response<GetSongsMetadataResponse>
) => {
    try {
        const md = await songMdDb
            .select()
            .from(songsMdTable);

        // TODO clean up `...` after addressing missing tags
        const normalizedMd: SongMdBasic[] = md.map(song => ({
            id: song.id,
            title: song.title ?? "...",
            artist: song.artist ?? "...",
            durationMillis: song.durationMillis,
        }))

        return res
            .status(200)
            .json({
                success: true,
                songsMd: normalizedMd
            })
    } catch (e) {
        return res
            .status(500)
            .json({
                success: false,
                debug: {
                    errorMessage: `md fetch failed, ${(e as Error).message}`
                }
            })

    }
}

export default getSongsMetadata;