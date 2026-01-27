const nodemailer = require('nodemailer');
const MessagingSettings = require('../models/messagingSettingsSchema');

/**
 * Email Service using Nodemailer
 * Handles sending emails via SMTP
 */
class EmailService {
    
    /**
     * Create SMTP transporter from school settings
     * @param {string} schoolId - School ID
     * @returns {Object} Nodemailer transporter
     */
    static async getTransporter(schoolId) {
        const settings = await MessagingSettings.findOne({ school: schoolId });
        
        if (!settings?.email?.smtpHost) {
            throw new Error('Email settings not configured');
        }
        
        const email = settings.email;
        
        const transporter = nodemailer.createTransport({
            host: email.smtpHost,
            port: parseInt(email.smtpPort) || 587,
            secure: email.smtpPort === '465', // true for 465, false for other ports
            auth: {
                user: email.smtpUser,
                pass: email.smtpPassword
            }
        });
        
        return {
            transporter,
            senderName: email.senderName || 'School Management System',
            senderEmail: email.senderEmail || email.smtpUser
        };
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
            const { transporter, senderEmail } = await this.getTransporter(schoolId);
            
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
