import { S3Client } from '@aws-sdk/client-s3';

const region = process.env.S3_REGION || 'us-east-1';
const endpoint = process.env.S3_ENDPOINT; // For MinIO or other S3 compatibles
const accessKeyId = process.env.S3_ACCESS_KEY || 'minioadmin';
const secretAccessKey = process.env.S3_SECRET_KEY || 'minioadmin';

export const s3Client = new S3Client({
    region,
    endpoint,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
    forcePathStyle: !!endpoint, // Needed for MinIO
});

export const BUCKET_NAME = process.env.S3_BUCKET || 'uhi-staff-portal';
