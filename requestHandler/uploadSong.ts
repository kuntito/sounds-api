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


type UploadSongResponse = {
    success: true,
} | {
    success: false,
    clientErrorMessage?: string,
    debug?: object;
}

const uploadSong: RequestHandler = async (
    req: Request,
    res: Response<UploadSongResponse>
) => {
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
    
    const mp3suffix = ".mp3"
    const uuid = randomUUID();
    const fileStem = path.basename(
        uploadedFile.originalname, // `multer` uses a random file name without extension
        mp3suffix
    );
    
    // uuid alone ensures uniqueness
    // `fileStem` included for readability in S3 console
    // `fileSuffix` included for accurate display type in S3 console
    const uniqueS3Key = `${fileStem}-${uuid}${mp3suffix}`

    // embed id into file..
    NodeID3.update(
        {
            userDefinedText: [{
                description: "id",
                value: uniqueS3Key
            }]
        },
        tempFp
    )

    const fileBuffer = fs.readFileSync(tempFp);

    try {
        await soundsS3.send(new PutObjectCommand({
            Bucket: envConfig.AWS_BUCKET_NAME,
            Key: uniqueS3Key,
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

    const tags = NodeID3.read(tempFp);

    try {
        await songMdDb.insert(songsMdTable).values({
            id: uniqueS3Key,
            title: tags.title,
            artist: tags.artist,
        });
    } catch (error) {

        // if insert fails, delete uploaded song
        deleteUploadedSong(uniqueS3Key);

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




const deleteUploadedSong = async (key: string) => {
    try {
        await soundsS3.send(new DeleteObjectCommand({
            Bucket: envConfig.AWS_BUCKET_NAME,
            Key: key
        }))
    } catch (e) {
        console.log(`could delete song with key: ${key}`);
    }
}