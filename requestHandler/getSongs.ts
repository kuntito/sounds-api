import { Request, Response, RequestHandler } from "express";
import {
    ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { _Object } from "@aws-sdk/client-s3";
import toObjectWithUrl from "../util/toObjectWithUrl";
import s3 from "../services/s3Client";

const { AWS_BUCKET_NAME } = process.env;


const getSongs: RequestHandler = async (req: Request, res: Response) => {
    const command = new ListObjectsV2Command({
        Bucket: AWS_BUCKET_NAME,
    });

    const response = await s3.send(command);
    const responseContents = response.Contents ?? [];

    const songs = await Promise.all(
        responseContents.map(
            (item) => toObjectWithUrl(s3, item, AWS_BUCKET_NAME!)
        )
    );

    return res.status(200).json({
        success: true,
        data: songs,
    });
};

export default getSongs;
