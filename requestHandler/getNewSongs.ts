import { Request, Response, RequestHandler } from "express";
import getS3ObjectUrl from "../util/getS3ObjectUrl";
import s3Client from "../services/s3Client";

import { envConfig } from "../config/envConfig";
import neonDbClient from "../services/neonDbClient";

interface RequestType {
    songIds: string[];
}

const getNewSongs: RequestHandler = async (req: Request, res: Response) => {
    const { songIds: clientSongIds } = req.body as RequestType;

    const clientSongIdsValid = clientSongIds && Array.isArray(clientSongIds);
    if (!clientSongIdsValid) {
        return res.status(400).json({
            success: false,
            error: "invalid song ids, pass array of strings",
        });
    }


    const setOfNewIds = await getSongIdsClientLacks(clientSongIds);
    if (setOfNewIds === undefined){
        return res.status(500).json({
            success: false,
            error: "couldn't sync with repo"
        })
    }

    const idArray = [...setOfNewIds];

    const urlPromises = idArray.map((id) =>
        getS3ObjectUrl(s3Client, id, envConfig.AWS_BUCKET_NAME)
            .catch(err => {
                console.log(`error occurred: ${(err as Error).message}`);
            })
    );

    const newSongUrls = (
        await Promise.all(urlPromises)
    ).filter(Boolean);

    return res.status(200).json({
        success: true,
        data: newSongUrls,
    });
};

export default getNewSongs;

/**
 * Returns song IDs present in repo but not on client.
 */
const getSongIdsClientLacks = async (clientIds: string[]): Promise<Set<string> | undefined> => {
    const maybeAllSongIds = await getAllSongIds();
    if (maybeAllSongIds === undefined) {
        return undefined;
    }

    const idsToReturn = maybeAllSongIds;

    clientIds.forEach((id) => idsToReturn.delete(id));

    return idsToReturn;
};


const getAllSongIds = async (): Promise<Set<string> | undefined> => {

    try {
        const result = await neonDbClient.query(`SELECT id FROM songs_md`);
        const ids = result.rows.map(
            row => row.id
        ) as string[];

        return new Set(ids);
    } catch (e) {
        console.log(`couldn't get all song ids, ${(e as Error).message}`);
        return undefined;
    }
};