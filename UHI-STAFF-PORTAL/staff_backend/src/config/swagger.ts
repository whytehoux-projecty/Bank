import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'UHI Staff Portal API',
            version: '1.0.0',
            description: 'Comprehensive API documentation for the UHI Staff Portal Backend',
            contact: {
                name: 'API Support',
                email: 'support@uhiportal.org',
            },
            license: {
                name: 'ISC',
                url: 'https://opensource.org/licenses/ISC',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
            {
                url: 'https://api.uhiportal.org',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        message: {
                            type: 'string',
                            example: 'Error message',
                        },
                        error: {
                            type: 'string',
                            example: 'Detailed error information',
                        },
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        staff_id: {
                            type: 'string',
                            example: 'STF-001',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                        },
                        first_name: {
                            type: 'string',
                        },
                        last_name: {
                            type: 'string',
                        },
                        status: {
                            type: 'string',
                            enum: ['active', 'inactive', 'suspended'],
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                Loan: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        user_id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        amount: {
                            type: 'number',
                            format: 'decimal',
                        },
                        balance: {
                            type: 'number',
                            format: 'decimal',
                        },
                        currency: {
                            type: 'string',
                            example: 'USD',
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'approved', 'rejected', 'active', 'paid_off'],
                        },
                        interest_rate: {
                            type: 'number',
                            format: 'decimal',
                        },
                        repayment_months: {
                            type: 'integer',
                        },
                        monthly_payment: {
                            type: 'number',
                            format: 'decimal',
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                PayrollRecord: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        user_id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        period_month: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 12,
                        },
                        period_year: {
                            type: 'integer',
                        },
                        basic_salary: {
                            type: 'number',
                            format: 'decimal',
                        },
                        allowances: {
                            type: 'number',
                            format: 'decimal',
                        },
                        deductions: {
                            type: 'number',
                            format: 'decimal',
                        },
                        net_pay: {
                            type: 'number',
                            format: 'decimal',
                        },
                        status: {
                            type: 'string',
                            enum: ['draft', 'processed', 'paid'],
                        },
                    },
                },
                Application: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        user_id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        type: {
                            type: 'string',
                            enum: ['leave', 'transfer', 'training', 'loan'],
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'approved', 'rejected', 'cancelled'],
                        },
                        data: {
                            type: 'object',
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        tags: [
            {
                name: 'Authentication',
                description: 'Authentication and authorization endpoints',
            },
            {
                name: 'Staff',
                description: 'Staff profile and management endpoints',
            },
            {
                name: 'Finance',
                description: 'Financial operations including loans and payroll',
            },
            {
                name: 'Applications',
                description: 'Application submission and management',
            },
            {
                name: 'Admin',
                description: 'Administrative endpoints',
            },
            {
                name: 'CMS',
                description: 'Content Management System endpoints',
            },
            {
                name: 'Webhooks',
                description: 'Webhook endpoints for external integrations',
            },
        ],
    },
    apis: [
        './src/modules/**/*.routes.ts',
        './src/modules/**/*.controller.ts',
    ],
};

export const swaggerSpec = swaggerJsdoc(options);
