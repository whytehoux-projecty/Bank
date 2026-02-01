import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { logger } from './logger';

/**
 * AWS Secrets Manager Integration
 * 
 * This service handles fetching secrets from AWS Secrets Manager
 * with fallback to environment variables for local development.
 */

interface SecretsCache {
    [key: string]: {
        value: any;
        timestamp: number;
    };
}

class SecretsManager {
    private client: SecretsManagerClient;
    private cache: SecretsCache = {};
    private cacheTTL: number = 300000; // 5 minutes in milliseconds
    private useSecretsManager: boolean;

    constructor() {
        this.useSecretsManager = process.env.USE_AWS_SECRETS === 'true';

        if (this.useSecretsManager) {
            this.client = new SecretsManagerClient({
                region: process.env.AWS_SECRETS_REGION || process.env.AWS_REGION || 'us-east-1',
            });
            logger.info('AWS Secrets Manager initialized');
        } else {
            logger.info('Using environment variables for secrets (AWS Secrets Manager disabled)');
        }
    }

    /**
     * Get secret from AWS Secrets Manager or environment variable
     */
    async getSecret(secretName: string, envVarName?: string): Promise<string> {
        // If AWS Secrets Manager is disabled, use environment variable
        if (!this.useSecretsManager) {
            const envValue = process.env[envVarName || secretName];
            if (!envValue) {
                throw new Error(`Environment variable ${envVarName || secretName} not found`);
            }
            return envValue;
        }

        // Check cache first
        const cached = this.cache[secretName];
        if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
            logger.debug(`Using cached secret: ${secretName}`);
            return cached.value;
        }

        try {
            logger.info(`Fetching secret from AWS Secrets Manager: ${secretName}`);

            const command = new GetSecretValueCommand({
                SecretId: secretName,
            });

            const response = await this.client.send(command);

            let secretValue: string;
            if (response.SecretString) {
                secretValue = response.SecretString;
            } else if (response.SecretBinary) {
                secretValue = Buffer.from(response.SecretBinary).toString('utf-8');
            } else {
                throw new Error(`Secret ${secretName} has no value`);
            }

            // Cache the secret
            this.cache[secretName] = {
                value: secretValue,
                timestamp: Date.now(),
            };

            logger.info(`Successfully fetched secret: ${secretName}`);
            return secretValue;
        } catch (error: any) {
            logger.error(`Error fetching secret ${secretName}:`, error);

            // Fallback to environment variable if AWS Secrets Manager fails
            if (envVarName && process.env[envVarName]) {
                logger.warn(`Falling back to environment variable: ${envVarName}`);
                return process.env[envVarName]!;
            }

            throw new Error(`Failed to fetch secret ${secretName}: ${error.message}`);
        }
    }

    /**
     * Get JSON secret from AWS Secrets Manager
     */
    async getJSONSecret(secretName: string): Promise<any> {
        const secretString = await this.getSecret(secretName);

        try {
            return JSON.parse(secretString);
        } catch (error) {
            logger.error(`Failed to parse JSON secret ${secretName}:`, error);
            throw new Error(`Secret ${secretName} is not valid JSON`);
        }
    }

    /**
     * Get all application secrets
     */
    async getApplicationSecrets(): Promise<ApplicationSecrets> {
        const secretName = process.env.AWS_SECRET_NAME || 'uhi-staff-portal/production';

        if (!this.useSecretsManager) {
            // Return secrets from environment variables
            return {
                database: {
                    url: process.env.DATABASE_URL!,
                    password: process.env.POSTGRES_PASSWORD!,
                },
                redis: {
                    url: process.env.REDIS_URL!,
                    password: process.env.REDIS_PASSWORD!,
                },
                jwt: {
                    secret: process.env.JWT_SECRET!,
                    refreshSecret: process.env.JWT_REFRESH_SECRET!,
                },
                stripe: {
                    secretKey: process.env.STRIPE_SECRET_KEY!,
                    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
                },
                aws: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
                    region: process.env.AWS_REGION || 'us-east-1',
                    s3Bucket: process.env.S3_BUCKET!,
                },
                smtp: {
                    host: process.env.SMTP_HOST!,
                    port: parseInt(process.env.SMTP_PORT || '587'),
                    user: process.env.SMTP_USER!,
                    password: process.env.SMTP_PASSWORD!,
                },
                sentry: {
                    dsn: process.env.SENTRY_DSN || '',
                },
            };
        }

        // Fetch from AWS Secrets Manager
        const secrets = await this.getJSONSecret(secretName);
        return secrets as ApplicationSecrets;
    }

    /**
     * Clear cache (useful for testing or forced refresh)
     */
    clearCache(): void {
        this.cache = {};
        logger.info('Secrets cache cleared');
    }

    /**
     * Validate that all required secrets are available
     */
    async validateSecrets(): Promise<boolean> {
        try {
            const secrets = await this.getApplicationSecrets();

            const requiredFields = [
                secrets.database.url,
                secrets.jwt.secret,
                secrets.jwt.refreshSecret,
            ];

            const allPresent = requiredFields.every(field => !!field);

            if (allPresent) {
                logger.info('All required secrets validated successfully');
            } else {
                logger.error('Some required secrets are missing');
            }

            return allPresent;
        } catch (error) {
            logger.error('Secret validation failed:', error);
            return false;
        }
    }
}

// Types
export interface ApplicationSecrets {
    database: {
        url: string;
        password: string;
    };
    redis: {
        url: string;
        password: string;
    };
    jwt: {
        secret: string;
        refreshSecret: string;
    };
    stripe: {
        secretKey: string;
        webhookSecret: string;
    };
    aws: {
        accessKeyId: string;
        secretAccessKey: string;
        region: string;
        s3Bucket: string;
    };
    smtp: {
        host: string;
        port: number;
        user: string;
        password: string;
    };
    sentry: {
        dsn: string;
    };
}

// Export singleton instance
export const secretsManager = new SecretsManager();
