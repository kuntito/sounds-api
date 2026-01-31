import { RequestHandler, Request, Response } from "express";
import getAllSongIds from "../helpers/getAllSongIds";
import getS3ObjectUrl from "../util/getS3ObjectUrl";
import { envConfig } from "../config/envConfig";
import soundsS3 from "../services/s3Client";

// TODO start here, rewrite this so it returns song title and artist..
type SongUrl = {
    songId: string;
    url: string;
}

type GetAllSongsUrlResponse = {
    success: true
    songUrls: SongUrl[]
} | {
    success: false,
    debug: object,
}

const getAllSongsUrl: RequestHandler = async (
    req: Request, 
    res: Response<GetAllSongsUrlResponse>
) => {


    const maybeAllSongIds = await getAllSongIds();
    if (maybeAllSongIds === undefined) {
        return res.status(500).json({
            success: false,
            debug: {
                errorMessage: "db fetch for song ids returns 'undefined'"
            }
        });
    }

    const urlPromises = maybeAllSongIds.map((s3Key) => 
        getS3ObjectUrl(
            soundsS3,
            s3Key,
            envConfig.AWS_BUCKET_NAME
        )
        .then(url => ({songId: s3Key, url: url}))
        .catch(err => {
            console.log(`error occurred: ${(err as Error).message}`);
            return undefined;
        })
    )

    const songUrls = (
        await Promise.all(urlPromises)
    )
    .filter(Boolean) as SongUrl[];

    return res.status(200).json({
        success: true,
        songUrls: songUrls
    })
}

export { getAllSongsUrl };