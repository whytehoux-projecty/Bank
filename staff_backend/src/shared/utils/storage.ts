import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, BUCKET_NAME as ENV_BUCKET_NAME } from '../../config/storage';
import { logger } from '../../config/logger';
import { getSystemSetting } from './settings.utils';

export class StorageService {

    private async getBucketName(): Promise<string> {
        return await getSystemSetting('s3_bucket', ENV_BUCKET_NAME) || 'uhi-staff-portal';
    }

    /**
     * Upload a file to object storage
     */
    async uploadFile(key: string, body: Buffer | Uint8Array, contentType: string) {
        try {
            const bucket = await this.getBucketName();
            const command = new PutObjectCommand({
                Bucket: bucket,
                Key: key,
                Body: body,
                ContentType: contentType,
            });

            await s3Client.send(command);
            logger.info(`File uploaded successfully: ${key}`);
            return key;
        } catch (error) {
            logger.error(`Error uploading file: ${key}`, error);
            throw error;
        }
    }

    /**
     * Delete a file from object storage
     */
    async deleteFile(key: string) {
        try {
            const bucket = await this.getBucketName();
            const command = new DeleteObjectCommand({
                Bucket: bucket,
                Key: key,
            });

            await s3Client.send(command);
            logger.info(`File deleted successfully: ${key}`);
        } catch (error) {
            logger.error(`Error deleting file: ${key}`, error);
            throw error;
        }
    }

    /**
     * Generate a signed URL for viewing a file (valid for 1 hour)
     */
    async getSignedUrl(key: string, expiresIn: number = 3600) {
        try {
            const bucket = await this.getBucketName();
            const command = new GetObjectCommand({
                Bucket: bucket,
                Key: key,
            });

            const url = await getSignedUrl(s3Client, command, { expiresIn });
            return url;
        } catch (error) {
            logger.error(`Error generating signed URL for: ${key}`, error);
            throw error;
        }
    }
}

export const storageService = new StorageService();
