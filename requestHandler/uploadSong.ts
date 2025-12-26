import { Request, Response, RequestHandler } from "express";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import db__sounds_md from "../services/db__soundsMd";
import NodeID3 from "node-id3";
import soundsS3 from "../services/s3Client";


const { AWS_BUCKET_NAME } = process.env;


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


    const id = randomUUID();
    // embed id into file..
    NodeID3.update(
        {
            userDefinedText: [{
                description: "id",
                value: id
            }]
        },
        fp
    )

    const fileBuffer = fs.readFileSync(fp);

    const fileName = path.basename(fp);
    try {
        await soundsS3.send(new PutObjectCommand({
            Bucket: AWS_BUCKET_NAME,
            Key: fileName,
            Body: fileBuffer
        }));

        db__sounds_md.prepare(`INSERT INTO songs_md (id, is_uploaded)
            VALUES (?, 1)
        `).run(id);

    } catch (error) {

        return res
            .status(500)
            .json({
                success: false,
                message: "upload failed"
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