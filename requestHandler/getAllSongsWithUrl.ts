import { SongMd, songsMdTable } from "../schema/songsMd"
import { RequestHandler, Request, Response } from "express";
import { songMdDb } from "../services/neonDbClient";
import getS3ObjectUrl from "../util/getS3ObjectUrl";
import soundsS3 from "../services/s3Client";
import { envConfig } from "../config/envConfig";

type SongWithUrl = {
    id: string,
    title: string,
    artist: string,
    albumArtUrl: string,
    songUrl: string,
}

type GetAllSongsWithUrlResponse = {
    success: true,
    songsWithUrl: SongWithUrl[],
} | {
    success: false,
    debug: object,
}

const getAllSongsWithUrl: RequestHandler = async (
    req: Request,
    res: Response<GetAllSongsWithUrlResponse>
) => {
    
    try {
        const md = await songMdDb
            .select()
            .from(songsMdTable);

        // TODO clean up `...` after addressing missing tags
        const normalizedMd: SongMd[] = md.map(song => ({
            id: song.id,
            s3Key: song.s3Key,
            title: song.title ?? "...",
            artist: song.artist ?? "...",
            albumArtUrl: song.albumArtUrl
        }));

        const songPromises = normalizedMd.map((song) => 
            getS3ObjectUrl(
                soundsS3,
                song.s3Key,
                envConfig.AWS_BUCKET_NAME
            )
            .then(songUrl => ({
                id: song.id,
                title: song.title,
                artist: song.artist,
                albumArtUrl: song.albumArtUrl,
                songUrl: songUrl,
            }))
            .catch(err => {
                console.log(`error occurred fetching songWithUrl for ${song.id}: ${(err as Error).message}`);
                return undefined;
            })
        );

        const songsWithUrl = (await Promise.all(songPromises))
            .filter(Boolean) as SongWithUrl[];

        return res.status(200).json({
            success: true,
            songsWithUrl: songsWithUrl,
        })
    } catch (e) {
        return res.status(500).json({
            success: false,
            debug: {
                errorMessage: `couldn't fetch all songs with url, ${(e as Error).message}`
            }
        });
    }
}

export { getAllSongsWithUrl };