import {
    GetObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { _Object } from "@aws-sdk/client-s3";
import secs from "../util/secs";

/**
 * Transforms an S3 object into an object with a signed URL.
 * @param item - S3 object metadata from ListObjectsV2
 * @returns Object containing key, bytes, and temporary download URL
 */
const toObjectWithUrl = async (
    s3Client: S3Client,
    item: _Object,
    bucketName: string,
) => ({
    key: item.Key,
    bytes: item.Size,
    url: await getSignedUrl(
        s3Client,
        new GetObjectCommand({
            Bucket: bucketName,
            Key: item.Key,
        }),
        {
            expiresIn: secs("1h"),
        }
    ),
});

export default toObjectWithUrl;