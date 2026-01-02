import { Request, Response, RequestHandler } from "express";
import db__sounds_md from "../services/db__soundsMd";
import soundsS3 from "../services/s3Client";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { envConfig } from "../config/envConfig";

const deleteSong: RequestHandler = async (req: Request, res: Response) => {
    const { songId: s3Key } = req.params;

    const isValidSongId = s3Key && typeof s3Key === "string";
    if (!isValidSongId) {
        return res.status(400).json({
            success: false,
            error: "song id should be a string",
        });
    }

    let isDeletedFromDb = false;
    try {

        isDeletedFromDb = db__sounds_md
            .prepare(`DELETE FROM songs_md WHERE id = ?`)
            .run(s3Key)
            .changes > 0;
    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `error occurred, ${(e as Error).message}`,
        });
    }

    try {
        await soundsS3.send(
            new DeleteObjectCommand({
                Bucket: envConfig.AWS_BUCKET_NAME,
                Key: s3Key,
            })
        );
    } catch (e) {
        console.log(
            `could not delete from s3, songKey is `,
            s3Key,
            `error: `,
            (e as Error).message
        );
    }

    if (isDeletedFromDb) {
        return res.status(200).json({
            success: true,
            message: "delete successful",
        });
    } else {
        return res.status(500).json({
            success: false,
            message: "delete failed, check song id",
        });
    }
};

export default deleteSong;
