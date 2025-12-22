import { Request, Response, RequestHandler } from "express";
import {
    S3Client,
    ListObjectsV2Command,
    GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import ms from "ms";
import { _Object } from "@aws-sdk/client-s3";
import secs from "../util/secs";

const { AWS_REGION, AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME } =
    process.env;

// TODO might need to refactor this
// it'd be re-used... or maybe, just commit as-is. move it when necessary.
const s3 = new S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY!,
        secretAccessKey: AWS_SECRET_ACCESS_KEY!,
    },
});

/**
 * Transforms an S3 object into an object with a signed URL.
 * @param item - S3 object metadata from ListObjectsV2
 * @returns Object containing key, bytes, and temporary download URL
 */
const toObjectWithUrl = async (item: _Object) => ({
    key: item.Key,
    bytes: item.Size,
    url: await getSignedUrl(
        s3,
        new GetObjectCommand({
            Bucket: AWS_BUCKET_NAME,
            Key: item.Key,
        }),
        {
            expiresIn: secs("1h"),
        }
    ),
});

const getSongs: RequestHandler = async (req: Request, res: Response) => {
    const command = new ListObjectsV2Command({
        Bucket: AWS_BUCKET_NAME,
    });

    const response = await s3.send(command);

    const songs = await Promise.all(
        (response.Contents || []).map(toObjectWithUrl)
    );

    return res.status(200).json({
        success: true,
        data: songs,
    });
};

export default getSongs;
