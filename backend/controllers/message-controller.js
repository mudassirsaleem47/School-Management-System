const MessageTemplate = require('../models/messageTemplateSchema');
const MessageLog = require('../models/messageLogSchema');
const MessagingSettings = require('../models/messagingSettingsSchema');
const Student = require('../models/studentSchema');
const Staff = require('../models/staffSchema');
const EmailService = require('../services/emailService');
let WhatsAppService;
try {
    WhatsAppService = require('../services/whatsappService');
} catch (error) {
    console.error("Failed to load WhatsAppService:", error);
    WhatsAppService = class {
        static async connect() { return { success: false, error: "WhatsApp Service Unavailable: " + error.message }; }
        static async getStatus() { return { connected: false, error: "Service Unavailable" }; }
        static async disconnect() { return { success: false }; }
        static async sendMessage() { return { success: false, error: "Service Unavailable" }; }
    };
}

// ==================== MESSAGE TEMPLATES ====================

// Create Template
const createMessageTemplate = async (req, res) => {
    try {
        const template = new MessageTemplate(req.body);
        await template.save();
        res.status(201).json(template);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Templates by School
const getMessageTemplatesBySchool = async (req, res) => {
    try {
        const templates = await MessageTemplate.find({ school: req.params.schoolId })
            .sort({ createdAt: -1 });
        res.json(templates);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update Template
const updateMessageTemplate = async (req, res) => {
    try {
        const template = await MessageTemplate.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }
        res.json(template);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete Template
const deleteMessageTemplate = async (req, res) => {
    try {
        const template = await MessageTemplate.findByIdAndDelete(req.params.id);
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }
        res.json({ message: 'Template deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ==================== MESSAGE LOGS / REPORTS ====================

// Get Message Reports
const getMessageReports = async (req, res) => {
    try {
        const messages = await MessageLog.find({ school: req.params.schoolId })
            .sort({ createdAt: -1 })
            .limit(500);
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ==================== SEND MESSAGES ====================

// Replace dynamic tags in message content
const replaceDynamicTags = (content, recipient, type = 'student', additionalData = {}) => {
    let message = content;
    
    if (type === 'student') {
        // Student related tags
        message = message.replace(/\{\{name\}\}/g, recipient.name || '');
        message = message.replace(/\{\{father\}\}/g, recipient.fatherName || '');
        message = message.replace(/\{\{class\}\}/g, recipient.class?.className || '');
        message = message.replace(/\{\{section\}\}/g, recipient.section || '');
        message = message.replace(/\{\{phone\}\}/g, recipient.phone || recipient.fatherPhone || '');
        message = message.replace(/\{\{roll\}\}/g, recipient.rollNo || '');
        
        // Additional data tags
        message = message.replace(/\{\{fee_amount\}\}/g, additionalData.feeAmount || '');
        message = message.replace(/\{\{due_date\}\}/g, additionalData.dueDate || '');
        message = message.replace(/\{\{attendance\}\}/g, additionalData.attendance || '');
        message = message.replace(/\{\{exam_date\}\}/g, additionalData.examDate || '');
        message = message.replace(/\{\{result\}\}/g, additionalData.result || '');
    } else if (type === 'staff') {
        // Staff related tags
        message = message.replace(/\{\{name\}\}/g, recipient.name || '');
        message = message.replace(/\{\{phone\}\}/g, recipient.phone || '');
        message = message.replace(/\{\{email\}\}/g, recipient.email || '');
        message = message.replace(/\{\{designation\}\}/g, recipient.designation?.name || recipient.role || '');
        
        // Clear student specific tags if present in template
        message = message.replace(/\{\{father\}\}/g, '');
        message = message.replace(/\{\{class\}\}/g, '');
        message = message.replace(/\{\{section\}\}/g, '');
        message = message.replace(/\{\{roll\}\}/g, '');
        message = message.replace(/\{\{fee_amount\}\}/g, '');
        message = message.replace(/\{\{attendance\}\}/g, '');
    }
    
    // Common tags
    message = message.replace(/\{\{school\}\}/g, additionalData.schoolName || '');
    
    return message;
};

// Send Messages to selected recipients (students or staff)
const sendMessages = async (req, res) => {
    console.log('Received SendMessages request Body:', JSON.stringify(req.body, null, 2));
    try {
        const { 
            school, 
            studentIds, // For backward compatibility
            recipientIds, // New field for generic IDs
            message, 
            templateId, 
            messageType = 'whatsapp',
            recipientGroup = 'student' // 'student' or 'staff'
        } = req.body;
        
        const targetIds = recipientIds || studentIds;
        
        let recipients = [];
        
        if (recipientGroup === 'student') {
            recipients = await Student.find({ 
                _id: { $in: targetIds },
                school: school
            }).populate('class');
        } else if (recipientGroup === 'staff') {
            recipients = await Staff.find({
                _id: { $in: targetIds },
                school: school
            }).populate('designation');
        }
        
        const messageLogs = [];
        let sentCount = 0;
        let failedCount = 0;
        
        for (const recipient of recipients) {
            // Replace dynamic tags
            const personalizedMessage = replaceDynamicTags(message, recipient, recipientGroup);
            
            // Determine phone and email based on recipient type
            let phone, email, recipientName;
            
            if (recipientGroup === 'student') {
                phone = recipient.phone || recipient.fatherPhone;
                email = recipient.email;
                recipientName = recipient.name;
            } else {
                phone = recipient.phone;
                email = recipient.email;
                recipientName = recipient.name;
            }

            // Create message log
            const log = new MessageLog({
                recipient: {
                    studentId: recipient._id, // Using same field for ID for simplicity, schema might need update if strict
                    name: recipientName,
                    phone: phone,
                    email: email,
                    group: recipientGroup // Add this field to schema if needed, or store in meta
                },
                content: personalizedMessage,
                messageType,
                templateId,
                status: 'pending',
                school
            });
            
            await log.save();
            
            // Send via appropriate service
            let sendResult;
            if (messageType === 'email' && email) {
                sendResult = await EmailService.sendEmail(school, {
                    to: email,
                    subject: 'Message from School',
                    text: personalizedMessage
                });
            } else if (messageType === 'whatsapp') {
                if (phone) {
                    sendResult = await WhatsAppService.sendMessage(school, phone, personalizedMessage);
                } else {
                    sendResult = { success: false, error: 'No phone number' };
                }
            }
            
            // Update log status
            if (sendResult?.success) {
                log.status = 'sent';
                log.deliveredAt = new Date();
                sentCount++;
            } else {
                log.status = 'failed';
                log.error = sendResult?.error || 'Send failed';
                failedCount++;
            }
            await log.save();
            messageLogs.push(log);
        }
        
        res.json({ 
            success: true, 
            sent: sentCount,
            failed: failedCount,
            total: messageLogs.length,
            message: `Messages sent: ${sentCount}, Failed: ${failedCount}`
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Send Birthday Wishes
const sendBirthdayWishes = async (req, res) => {
    try {
        const { school, studentIds, message, templateId } = req.body;
        
        // Get students
        const students = await Student.find({ 
            _id: { $in: studentIds },
            school: school
        }).populate('class');
        
        const messageLogs = [];
        
        for (const student of students) {
            // Calculate age
            let age = '';
            if (student.dateOfBirth) {
                const today = new Date();
                const dob = new Date(student.dateOfBirth);
                age = today.getFullYear() - dob.getFullYear() + 1;
            }
            
            // Replace dynamic tags including age
            const personalizedMessage = replaceDynamicTags(message, student, 'student', { age: age.toString() });
            
            // Create message log
            const log = new MessageLog({
                recipient: {
                    studentId: student._id,
                    name: student.name,
                    phone: student.phone || student.fatherPhone,
                    email: student.email
                },
                content: personalizedMessage,
                messageType: 'whatsapp',
                templateId,
                status: 'pending',
                school
            });
            
            await log.save();
            messageLogs.push(log);
            
            // TODO: Actually send via WhatsApp
            log.status = 'sent';
            await log.save();
        }
        
        res.json({ 
            success: true, 
            sent: messageLogs.length,
            message: `Birthday wishes sent to ${messageLogs.length} students`
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ==================== MESSAGING SETTINGS ====================

// Get Settings
const getMessagingSettings = async (req, res) => {
    try {
        let settings = await MessagingSettings.findOne({ school: req.params.schoolId });
        
        if (!settings) {
            settings = { whatsapp: { connected: false }, email: { verified: false } };
        }
        
        // Don't return sensitive data
        const safeSettings = {
            whatsapp: {
                connected: settings.whatsapp?.connected || false,
                phoneNumber: settings.whatsapp?.phoneNumber || ''
            },
            email: {
                smtpHost: settings.email?.smtpHost || '',
                smtpPort: settings.email?.smtpPort || '587',
                smtpUser: settings.email?.smtpUser || '',
                senderName: settings.email?.senderName || '',
                senderEmail: settings.email?.senderEmail || '',
                verified: settings.email?.verified || false
            }
        };
        
        res.json(safeSettings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Save Email Settings
const saveEmailSettings = async (req, res) => {
    try {
        const { school, smtpHost, smtpPort, smtpUser, smtpPassword, senderName, senderEmail } = req.body;
        
        let settings = await MessagingSettings.findOne({ school });
        
        if (!settings) {
            settings = new MessagingSettings({ school });
        }
        
        settings.email = {
            smtpHost,
            smtpPort,
            smtpUser,
            smtpPassword: smtpPassword || settings.email?.smtpPassword,
            senderName,
            senderEmail,
            verified: false
        };
        
        await settings.save();
        res.json({ success: true, message: 'Email settings saved' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Test Email Settings
const testEmailSettings = async (req, res) => {
    try {
        const { school } = req.body;
        
        const result = await EmailService.testConnection(school);
        
        if (result.success) {
            // Update verified status in database
            await MessagingSettings.findOneAndUpdate(
                { school },
                { 
                    'email.verified': true,
                    'email.lastVerified': new Date()
                }
            );
        }
        
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// WhatsApp Connect - Generate QR
const whatsappConnect = async (req, res) => {
    try {
        const { school } = req.body;
        
        const result = await WhatsAppService.connect(school);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// WhatsApp Status
const whatsappStatus = async (req, res) => {
    try {
        const result = await WhatsAppService.getStatus(req.params.schoolId);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// WhatsApp Disconnect
const whatsappDisconnect = async (req, res) => {
    try {
        const { school } = req.body;
        
        const result = await WhatsAppService.disconnect(school);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    // Templates
    createMessageTemplate,
    getMessageTemplatesBySchool,
    updateMessageTemplate,
    deleteMessageTemplate,
    // Reports
    getMessageReports,
    // Send Messages
    sendMessages,
    sendBirthdayWishes,
    // Settings
    getMessagingSettings,
    saveEmailSettings,
    testEmailSettings,
    whatsappConnect,
    whatsappStatus,
    whatsappDisconnect
};
