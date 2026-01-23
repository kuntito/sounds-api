import { RequestHandler, Request, Response } from "express";
import { songMdDb } from "../services/neonDbClient";
import { SongMd, songsMdTable } from "../schema/songsMd";

type GetSongsMetadataResponse = {
    success: true;
    songsMd: SongMd[];
} | {
    success: false;
    debug: object;
};

<<<<<<< HEAD
/**
 * Returns metadata for all songs.
=======
/**                                                                                                                                          * Returns metadata for all songs.
>>>>>>> 7c8e001b23c7b673c1b524e82bcea9b09239f452
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

        return res
            .status(200)
            .json({
                success: true,
                songsMd: md
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