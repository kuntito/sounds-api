import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { _Object } from "@aws-sdk/client-s3";
import secs from "./secs";

const getS3ObjectUrl = async (
    s3Client: S3Client,
    s3Key: string,
    bucketName: string
) => {
    return getSignedUrl(
        s3Client,
        new GetObjectCommand({
            Bucket: bucketName,
            Key: s3Key,
        }),
        {
            expiresIn: secs("1h"),
        }
    );
};

export default getS3ObjectUrl;
