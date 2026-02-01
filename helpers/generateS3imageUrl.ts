import { envConfig } from "../config/envConfig";

const generateS3imageUrl = (
    imgS3Key: string,
) => {

    const albumArtUrl = `https://${envConfig.AWS_BUCKET_NAME}.s3.${envConfig.AWS_REGION}.amazonaws.com/${imgS3Key}`;

    return albumArtUrl;
}

export { generateS3imageUrl };