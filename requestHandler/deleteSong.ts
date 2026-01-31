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
    const s3Key = songId;

    const isValidSongId = s3Key && typeof s3Key === "string";
    if (!isValidSongId) {
        return res.status(400).json({
            success: false,
            clientErrorMessage: "song id should be a string",
        });
    }

    let isDeletedFromDb = false;
    try {
        const result = await songMdDb
            .delete(songsMdTable)
            .where(eq(songsMdTable.id, s3Key));
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

    safeDeleteFromS3(s3Key);

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
