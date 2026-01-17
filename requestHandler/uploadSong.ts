import { Request, Response, RequestHandler } from "express";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import path from "path";
import fs from "fs"
import { randomUUID } from "crypto";
import NodeID3 from "node-id3";
import soundsS3 from "../services/s3Client";
import { envConfig } from "../config/envConfig";
import neonDbClient from "../services/neonDbClient";


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


const uploadSong: RequestHandler = async (req: Request, res: Response) => {
    const { filePath: fp } = req.body;

    const isMp3 = path.extname(fp).toLowerCase() === ".mp3";
    if (!isMp3) {
        return res.status(400).json({
            success: false,
            message: "only mp3 files allowed",
        });
    }

    const fileExists = fs.existsSync(fp);
    if (!fileExists) {
        return res.status(400).json({
            success: false,
            message: `song file, ${fp}, does not exist`
        });
    }



    
    const mp3suffix = ".mp3"
    const uuid = randomUUID();
    const fileStem = path.basename(fp, mp3suffix);
    
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
        fp
    )

    const fileBuffer = fs.readFileSync(fp);

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
                message: `s3 upload failed, ${(error as Error).message}`
            })
    }

    const tags = NodeID3.read(fp);

    try {
        await neonDbClient.query(
            `INSERT INTO songs_md (id, title, artist)
            VALUES ($1, $2, $3)`,
            [uniqueS3Key, tags.title, tags.artist]
        )
    } catch (error) {

        // if insert fails, delete uploaded song
        deleteUploadedSong(uniqueS3Key);

        return res
        .status(500)
        .json({
            success: false,
            message: `new song, db insert failed, ${(error as Error).message}`
        })

    }

    return res
        .status(201)
        .json({
            success: true,
            message: "upload succeeded"
        })

};

export default uploadSong;