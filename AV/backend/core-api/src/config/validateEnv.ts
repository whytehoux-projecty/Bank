/**
 * Environment Variable Validation
 * 
 * Validates that all required environment variables are present
 * and properly configured before the application starts.
 */

interface EnvironmentConfig {
    // Database
    DATABASE_URL: string;

    // Authentication
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    COOKIE_SECRET: string;

    // Redis
    REDIS_URL: string;

    // Server
    PORT: string;
    NODE_ENV: string;

    // CORS
    CORS_ORIGIN: string;

    // Rate Limiting
    RATE_LIMIT_MAX: string;
    RATE_LIMIT_WINDOW: string;
}

const REQUIRED_ENV_VARS: (keyof EnvironmentConfig)[] = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'COOKIE_SECRET',
    'REDIS_URL',
    'PORT',
    'NODE_ENV',
    'CORS_ORIGIN',
    'RATE_LIMIT_MAX',
    'RATE_LIMIT_WINDOW',
];

const OPTIONAL_ENV_VARS = [
    'SKIP_REDIS',
    'USE_REDIS',
    'LOG_LEVEL',
    'SENTRY_DSN',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASSWORD',
];

/**
 * Validate environment variables
 * @throws Error if required variables are missing
 */
export function validateEnvironment(): void {
    const missing: string[] = [];

    // Check required variables
    REQUIRED_ENV_VARS.forEach((varName) => {
        if (!process.env[varName]) {
            missing.push(varName);
        }
    });

    // Throw error if any required variables are missing
    if (missing.length > 0) {
        const errorMessage = `
╔════════════════════════════════════════════════════════════════╗
║  ENVIRONMENT CONFIGURATION ERROR                               ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  Missing required environment variables:                       ║
║  ${missing.map(v => `- ${v}`).join('\n║  ')}
║                                                                ║
║  Please ensure all required variables are set in your .env     ║
║  file or environment configuration.                            ║
║                                                                ║
║  See .env.example for reference.                               ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
    `.trim();

        throw new Error(errorMessage);
    }

    // Validate specific formats
    validateDatabaseUrl(process.env['DATABASE_URL']!);
    validateJwtSecret(process.env['JWT_SECRET']!);
    validatePort(process.env['PORT']!);
    validateNodeEnv(process.env['NODE_ENV']!);

    // Log successful validation
    console.log('✅ Environment variables validated successfully');

    // Log optional variables status
    const presentOptional = OPTIONAL_ENV_VARS.filter(v => process.env[v]);
    if (presentOptional.length > 0) {
        console.log(`ℹ️  Optional variables configured: ${presentOptional.join(', ')}`);
    }
}

/**
 * Validate DATABASE_URL format
 */
function validateDatabaseUrl(url: string): void {
    if (!url.startsWith('postgresql://') && !url.startsWith('postgres://')) {
        throw new Error('DATABASE_URL must be a valid PostgreSQL connection string');
    }
}

/**
 * Validate JWT_SECRET strength
 */
function validateJwtSecret(secret: string): void {
    if (secret.length < 32) {
        console.warn('⚠️  WARNING: JWT_SECRET should be at least 32 characters for security');
    }

    if (secret === 'your-super-secret-jwt-key-change-in-production') {
        throw new Error('JWT_SECRET must be changed from default value in production');
    }
}

/**
 * Validate PORT is a number
 */
function validatePort(port: string): void {
    const portNum = parseInt(port, 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        throw new Error('PORT must be a valid port number (1-65535)');
    }
}

/**
 * Validate NODE_ENV is a valid value
 */
function validateNodeEnv(env: string): void {
    const validEnvs = ['development', 'test', 'production', 'staging'];
    if (!validEnvs.includes(env)) {
        console.warn(`⚠️  WARNING: NODE_ENV "${env}" is not standard. Expected: ${validEnvs.join(', ')}`);
    }
}

/**
 * Get environment configuration with type safety
 */
export function getEnvironmentConfig(): EnvironmentConfig {
    return {
        DATABASE_URL: process.env['DATABASE_URL']!,
        JWT_SECRET: process.env['JWT_SECRET']!,
        JWT_EXPIRES_IN: process.env['JWT_EXPIRES_IN']!,
        COOKIE_SECRET: process.env['COOKIE_SECRET']!,
        REDIS_URL: process.env['REDIS_URL']!,
        PORT: process.env['PORT']!,
        NODE_ENV: process.env['NODE_ENV']!,
        CORS_ORIGIN: process.env['CORS_ORIGIN']!,
        RATE_LIMIT_MAX: process.env['RATE_LIMIT_MAX']!,
        RATE_LIMIT_WINDOW: process.env['RATE_LIMIT_WINDOW']!,
    };
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
    return process.env['NODE_ENV'] === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
    return process.env['NODE_ENV'] === 'development';
}

/**
 * Check if running in test
 */
export function isTest(): boolean {
    return process.env['NODE_ENV'] === 'test';
}
