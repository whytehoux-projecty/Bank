import nodemailer from 'nodemailer';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

// Create transporter - in production, use real SMTP settings
const createTransporter = () => {
    // For development, use ethereal.email or console output
    if (process.env.NODE_ENV === 'development' || !process.env.SMTP_HOST) {
        // Log emails to console in development
        return {
            sendMail: async (options: EmailOptions) => {
                console.log('📧 Email would be sent:');
                console.log('   To:', options.to);
                console.log('   Subject:', options.subject);
                console.log('   Body:', options.text || options.html.substring(0, 200) + '...');
                return { messageId: 'dev-' + Date.now() };
            }
        };
    }

    // Production SMTP configuration
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
    try {
        const transporter = createTransporter();
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"Staff Portal" <noreply@organization.org>',
            ...options,
        });
        return true;
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        return false;
    }
};

export const sendPasswordResetEmail = async (
    email: string,
    resetToken: string,
    firstName: string
): Promise<boolean> => {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:8000'}/reset-password.html?token=${resetToken}`;

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #0066CC; color: white; padding: 20px; text-align: center; }
                .content { padding: 30px; background-color: #f9f9f9; }
                .button { display: inline-block; padding: 12px 30px; background-color: #0066CC; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
                .warning { color: #cc0000; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Password Reset Request</h1>
                </div>
                <div class="content">
                    <p>Hello ${firstName},</p>
                    <p>We received a request to reset your password for the Staff Portal. Click the button below to create a new password:</p>
                    <p style="text-align: center;">
                        <a href="${resetUrl}" class="button">Reset Password</a>
                    </p>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; font-size: 14px; color: #0066CC;">${resetUrl}</p>
                    <p class="warning">⚠️ This link will expire in 1 hour for security reasons.</p>
                    <p>If you did not request a password reset, please ignore this email or contact IT support if you have concerns.</p>
                </div>
                <div class="footer">
                    <p>© ${new Date().getFullYear()} Global Organization. All rights reserved.</p>
                    <p>This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    const text = `
Hello ${firstName},

We received a request to reset your password for the Staff Portal.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour for security reasons.

If you did not request a password reset, please ignore this email.

© ${new Date().getFullYear()} Global Organization
    `.trim();

    return sendEmail({
        to: email,
        subject: 'Password Reset Request - Staff Portal',
        html,
        text,
    });
};

export const sendPasswordChangedEmail = async (
    email: string,
    firstName: string
): Promise<boolean> => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #0066CC; color: white; padding: 20px; text-align: center; }
                .content { padding: 30px; background-color: #f9f9f9; }
                .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
                .alert { color: #cc0000; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Password Changed</h1>
                </div>
                <div class="content">
                    <p>Hello ${firstName},</p>
                    <p>Your password for the Staff Portal has been successfully changed.</p>
                    <p>If you made this change, no further action is required.</p>
                    <p class="alert"><strong>If you did NOT make this change, please contact IT support immediately.</strong></p>
                </div>
                <div class="footer">
                    <p>© ${new Date().getFullYear()} Global Organization. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({
        to: email,
        subject: 'Password Changed - Staff Portal',
        html,
    });
};
