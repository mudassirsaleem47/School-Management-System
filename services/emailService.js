const nodemailer = require('nodemailer');
const MessagingSettings = require('../models/messagingSettingsSchema');

/**
 * Email Service using Nodemailer
 * Handles sending emails via SMTP
 */
class EmailService {
    static getSystemEmailConfig() {
        return {
            smtpHost: process.env.SYSTEM_SMTP_HOST || process.env.SMTP_HOST || '',
            smtpPort: process.env.SYSTEM_SMTP_PORT || process.env.SMTP_PORT || '587',
            smtpUser: process.env.SYSTEM_SMTP_USER || process.env.SMTP_USER || '',
            smtpPassword: process.env.SYSTEM_SMTP_PASSWORD || process.env.SMTP_PASSWORD || '',
            senderName: process.env.SYSTEM_SMTP_SENDER_NAME || process.env.SMTP_SENDER_NAME || 'School Management System',
            senderEmail: process.env.SYSTEM_SMTP_SENDER_EMAIL || process.env.SMTP_SENDER_EMAIL || process.env.SYSTEM_SMTP_USER || process.env.SMTP_USER || ''
        };
    }

    static buildTransporter(email) {
        return nodemailer.createTransport({
            host: email.smtpHost,
            port: parseInt(email.smtpPort) || 587,
            secure: String(email.smtpPort) === '465',
            auth: {
                user: email.smtpUser,
                pass: email.smtpPassword
            }
        });
    }
    
    /**
     * Create SMTP transporter from school settings
     * @param {string} schoolId - School ID
     * @returns {Object} Nodemailer transporter
     */
    static async getTransporter(schoolId, options = {}) {
        const { allowSystemFallback = true } = options;
        const settings = await MessagingSettings.findOne({ school: schoolId });

        const schoolEmail = settings?.email || {};
        const schoolConfigured = Boolean(
            schoolEmail.smtpHost && schoolEmail.smtpUser && schoolEmail.smtpPassword
        );

        if (schoolConfigured) {
            const transporter = this.buildTransporter(schoolEmail);
            return {
                transporter,
                senderName: schoolEmail.senderName || 'School Management System',
                senderEmail: schoolEmail.senderEmail || schoolEmail.smtpUser
            };
        }

        if (allowSystemFallback) {
            const systemEmail = this.getSystemEmailConfig();
            const systemConfigured = Boolean(
                systemEmail.smtpHost && systemEmail.smtpUser && systemEmail.smtpPassword
            );

            if (systemConfigured) {
                const transporter = this.buildTransporter(systemEmail);
                return {
                    transporter,
                    senderName: systemEmail.senderName,
                    senderEmail: systemEmail.senderEmail || systemEmail.smtpUser
                };
            }
        }

        throw new Error('Email settings not configured');
    }
    
    /**
     * Send email to a recipient
     * @param {string} schoolId - School ID
     * @param {Object} options - Email options
     * @param {string} options.to - Recipient email
     * @param {string} options.subject - Email subject
     * @param {string} options.text - Plain text content
     * @param {string} options.html - HTML content (optional)
     * @returns {Object} Send result
     */
    static async sendEmail(schoolId, { to, subject, text, html }) {
        try {
            const { transporter, senderName, senderEmail } = await this.getTransporter(schoolId);
            
            const mailOptions = {
                from: `"${senderName}" <${senderEmail}>`,
                to,
                subject,
                text,
                html: html || text
            };
            
            const result = await transporter.sendMail(mailOptions);
            
            return {
                success: true,
                messageId: result.messageId,
                response: result.response
            };
        } catch (err) {
            console.error('Email send error:', err);
            return {
                success: false,
                error: err.message
            };
        }
    }
    
    /**
     * Send bulk emails
     * @param {string} schoolId - School ID
     * @param {Array} recipients - Array of {email, name, subject, text}
     * @returns {Object} Results
     */
    static async sendBulkEmails(schoolId, recipients) {
        const results = {
            total: recipients.length,
            sent: 0,
            failed: 0,
            details: []
        };
        
        for (const recipient of recipients) {
            const result = await this.sendEmail(schoolId, {
                to: recipient.email,
                subject: recipient.subject || 'Message from School',
                text: recipient.text
            });
            
            if (result.success) {
                results.sent++;
            } else {
                results.failed++;
            }
            
            results.details.push({
                email: recipient.email,
                ...result
            });
        }
        
        return results;
    }
    
    /**
     * Test SMTP connection
     * @param {string} schoolId - School ID
     * @returns {Object} Test result
     */
    static async testConnection(schoolId) {
        try {
            const { transporter, senderEmail } = await this.getTransporter(schoolId, { allowSystemFallback: false });
            
            // Verify connection
            await transporter.verify();
            
            // Send test email
            await transporter.sendMail({
                from: senderEmail,
                to: senderEmail,
                subject: 'Test Email - School Management System',
                text: 'This is a test email to verify your SMTP configuration is working correctly.'
            });
            
            return { success: true, message: 'Connection verified and test email sent!' };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }
}

module.exports = EmailService;
