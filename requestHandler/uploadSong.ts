import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { Request, RequestHandler, Response } from "express";
import fs from "fs";
import NodeID3 from "node-id3";
import path from "path";
import { envConfig } from "../config/envConfig";
import { songsMdTable } from "../schema/songsMd";
import { songMdDb } from "../services/neonDbClient";
import soundsS3 from "../services/s3Client";
import { safeDeleteFromS3 } from "../helpers/deleteFromS3";
import { getExtensionFromContentType } from "../helpers/getExtensionFromContentType";
import { generateS3imageUrl } from "../helpers/generateS3imageUrl";


type UploadSongResponse = {
    success: true,
} | {
    success: false,
    clientErrorMessage?: string,
    debug?: object,
}

const uploadSong: RequestHandler = async (
    req: Request,
    res: Response<UploadSongResponse>
) => {
    // `req.file` is from multer
    const uploadedFile = req.file;
    if (!uploadedFile) {
        return res.status(400).json({
            success: false,
            clientErrorMessage: "no file uploaded",
        });
    }

    const isMp3 = path.extname(uploadedFile.originalname).toLowerCase() === '.mp3';
    if (!isMp3) {
        fs.unlinkSync(uploadedFile.path); // deletes file
        return res.status(400).json({
            success: false,
            clientErrorMessage: "only mp3 files allowed",
        });
    }
    
    const tempFp = uploadedFile.path;
    const id3Tags = NodeID3.read(tempFp);


    // TODO put this elsewhere
    const unknownArtworkUrl = String.raw`https://sounds-xyz.s3.eu-north-1.amazonaws.com/albumArt/artworkUnknown.png`;

    let albumArtUrl = unknownArtworkUrl;
    if (id3Tags.image && typeof id3Tags.image !== 'string' && id3Tags.image.mime !== undefined) {
        const imgBuffer = Buffer.from(id3Tags.image.imageBuffer);
        const imgUuid = randomUUID();

        const contentType = id3Tags.image.mime;
        const imgExtension = getExtensionFromContentType(contentType);
        const imgFileName = `${imgUuid}.${imgExtension}`;

        const imgS3Prefix = "albumArt/";
        const imgS3Key = `${imgS3Prefix}${imgFileName}`;

        try {
            await soundsS3.send(new PutObjectCommand({
                Bucket: envConfig.AWS_BUCKET_NAME,
                Key: imgS3Key,
                Body: imgBuffer,
                ContentType: contentType,
            }))

            albumArtUrl = generateS3imageUrl(imgS3Key);
        } catch(e) {
            console.log(`couldn't upload album art, ${(e as Error).message}`);
        }
    }


    
    const mp3suffix = ".mp3"
    const uuid = randomUUID();
    const songFileStem = path.basename(
        uploadedFile.originalname, // `multer` uses a random file name without extension
        mp3suffix
    );
    
    // uuid alone ensures uniqueness
    // `fileStem` included for readability in S3 console
    // `fileSuffix` included for accurate display type in S3 console
    const songUniqueFileName = `${songFileStem}-${uuid}${mp3suffix}`;

    const s3Prefix = "tracks/";
    const songUniqueS3Key = `${s3Prefix}${songUniqueFileName}`;

    const fileBuffer = fs.readFileSync(tempFp);

    try {
        await soundsS3.send(new PutObjectCommand({
            Bucket: envConfig.AWS_BUCKET_NAME,
            Key: songUniqueS3Key,
            Body: fileBuffer,
            ContentType: "audio/mpeg"
        }));

    } catch (error) {

        return res
            .status(500)
            .json({
                success: false,
                clientErrorMessage: "error occurred",
                debug: {
                    errorMessage: `s3 upload failed, ${(error as Error).message}`
                }
            })
    }


    try {
        await songMdDb.insert(songsMdTable).values({
            s3Key: songUniqueS3Key,
            title: id3Tags.title,
            artist: id3Tags.artist,
            albumArtUrl: albumArtUrl,
        });
    } catch (error) {

        // if insert fails, delete uploaded song
        safeDeleteFromS3(songUniqueS3Key);

        return res
        .status(500)
        .json({
            success: false,
            clientErrorMessage: "error occurred",
            debug: {
                errorMessage: `new song, db insert failed, ${(error as Error).message}`
            }
        })

    }

    fs.unlinkSync(tempFp); // delete file after processing..

    return res
        .status(201)
        .json({
            success: true,
        })

};

export default uploadSong;
