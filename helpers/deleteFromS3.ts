import { DeleteObjectCommand } from "@aws-sdk/client-s3"
import soundsS3 from "../services/s3Client"
import { envConfig } from "../config/envConfig"

const safeDeleteFromS3 = async (s3Key: string) => {
    try {
        await soundsS3.send(new DeleteObjectCommand({
            Bucket: envConfig.AWS_BUCKET_NAME,
            Key: s3Key
        }))
    } catch (e) {
        console.log(
            `could not delete from s3, songKey is `,
            s3Key,
            `error: `,
            (e as Error).message
        );
    }
}

export { safeDeleteFromS3 };