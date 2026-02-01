import { eq } from "drizzle-orm";
import { Request, RequestHandler, Response } from "express";
import { safeDeleteFromS3 } from "../helpers/deleteFromS3";
import { songsMdTable } from "../schema/songsMd";
import { songMdDb } from "../services/neonDbClient";

type DeleteSongResponse = {
    success: true;
} | {
    success: false;
    clientErrorMessage?: string,
    debug?: object
}

const deleteSong: RequestHandler = async (
    req: Request,
    res: Response<DeleteSongResponse>
) => {
    const { songId } = req.params;

    const isValidSongId = songId && typeof songId === "string";
    if (!isValidSongId) {
        return res.status(400).json({
            success: false,
            clientErrorMessage: "song id should be a string",
        });
    }

    let s3Key: string | undefined = undefined;
    try {
        const song = await songMdDb
            .select({ s3Key: songsMdTable.s3Key})
            .from(songsMdTable)
            .where(eq(songsMdTable.id, songId))
            .limit(1);

        if (song.length > 0) {
            s3Key = song[0].s3Key;
        } else {
            console.log(`couldn't get s3 key, songId: ${songId}`);
        }
    } catch {
        console.log(`couldn't get s3 key, songId: ${songId}`);
    }

    if (s3Key !== undefined) {
        safeDeleteFromS3(s3Key);
    }

    let isDeletedFromDb = false;
    try {
        const result = await songMdDb
            .delete(songsMdTable)
            .where(eq(songsMdTable.id, songId));
        isDeletedFromDb = (result.rowCount ?? 0) > 0;
    } catch (e) {
        return res.status(500).json({
            success: false,
            clientErrorMessage: `error occurred`,
            debug: {
                errorMessage: `${(e as Error).message}`
            }
        })
    }


    if (isDeletedFromDb) {
        return res.status(200).json({
            success: true,
        });
    } else {
        return res.status(500).json({
            success: false,
            debug: {
                errorMessage: `delete failed, check song id, ${songId}`
            }
        });
    }
};

export default deleteSong;
