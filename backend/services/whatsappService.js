const { Client, LocalAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const MessagingSettings = require('../models/messagingSettingsSchema');

/**
 * WhatsApp Service using whatsapp-web.js
 * Puppeteer-based WhatsApp Web automation
 */

// Store active WhatsApp clients
const activeClients = new Map();
const pendingQRs = new Map();

// Sessions directory
const SESSIONS_DIR = path.join(__dirname, '../whatsapp_sessions');

// Ensure sessions directory exists
if (!fs.existsSync(SESSIONS_DIR)) {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

class WhatsAppService {
    
    /**
     * Initialize WhatsApp connection for a school
     * Returns QR code for authentication
     * @param {string} schoolId - School ID
     * @returns {Object} QR code data or connection status
     */
    static async connect(schoolId) {
        try {
            // Check if already connected
            if (activeClients.has(schoolId)) {
                const clientData = activeClients.get(schoolId);
                if (clientData.ready) {
                    return { 
                        success: true, 
                        connected: true, 
                        phoneNumber: clientData.phoneNumber 
                    };
                }
                // If client exists but not ready, check for pending QR
                if (pendingQRs.has(schoolId)) {
                    return {
                        success: true,
                        qrCode: pendingQRs.get(schoolId),
                        message: 'Scan QR code with WhatsApp'
                    };
                }
            }
            
            const sessionPath = path.join(SESSIONS_DIR, schoolId);
            
            // Create new client with local auth
            const client = new Client({
                authStrategy: new LocalAuth({
                    clientId: schoolId,
                    dataPath: SESSIONS_DIR
                }),
                puppeteer: {
                    headless: true,
                    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--no-first-run',
                        '--no-zygote',
                        '--disable-gpu',
                        '--single-process'
                    ]
                }
            });
            
            // Store client reference
            activeClients.set(schoolId, { 
                client, 
                ready: false, 
                phoneNumber: null 
            });
            
            // Promise to return QR code
            return new Promise((resolve, reject) => {
                let qrResolved = false;
                
                // QR Code event
                client.on('qr', async (qr) => {
                    try {
                        const qrCodeDataURL = await QRCode.toDataURL(qr, {
                            width: 256,
                            margin: 2,
                            color: {
                                dark: '#128C7E',
                                light: '#FFFFFF'
                            }
                        });
                        
                        pendingQRs.set(schoolId, qrCodeDataURL);
                        
                        if (!qrResolved) {
                            qrResolved = true;
                            resolve({
                                success: true,
                                qrCode: qrCodeDataURL,
                                message: 'Scan QR code with WhatsApp'
                            });
                        }
                    } catch (err) {
                        console.error('QR generation error:', err);
                    }
                });
                
                // Ready event
                client.on('ready', async () => {
                    const info = client.info;
                    const phoneNumber = info?.wid?.user || info?.wid?._serialized?.split('@')[0];
                    
                    const clientData = activeClients.get(schoolId);
                    if (clientData) {
                        clientData.ready = true;
                        clientData.phoneNumber = phoneNumber;
                    }
                    
                    pendingQRs.delete(schoolId);
                    
                    // Save to database
                    await MessagingSettings.findOneAndUpdate(
                        { school: schoolId },
                        { 
                            'whatsapp.connected': true,
                            'whatsapp.phoneNumber': phoneNumber,
                            'whatsapp.lastConnected': new Date()
                        },
                        { upsert: true }
                    );
                    
                    console.log(`[WhatsApp] Connected: ${phoneNumber} for school ${schoolId}`);
                    
                    if (!qrResolved) {
                        qrResolved = true;
                        resolve({
                            success: true,
                            connected: true,
                            phoneNumber
                        });
                    }
                });
                
                // Authenticated event (already logged in)
                client.on('authenticated', () => {
                    console.log(`[WhatsApp] Authenticated for school ${schoolId}`);
                });
                
                // Auth failure
                client.on('auth_failure', (msg) => {
                    console.error(`[WhatsApp] Auth failed for ${schoolId}:`, msg);
                    activeClients.delete(schoolId);
                    pendingQRs.delete(schoolId);
                    
                    if (!qrResolved) {
                        qrResolved = true;
                        resolve({
                            success: false,
                            error: 'Authentication failed: ' + msg
                        });
                    }
                });
                
                // Disconnected
                client.on('disconnected', async (reason) => {
                    console.log(`[WhatsApp] Disconnected for ${schoolId}:`, reason);
                    activeClients.delete(schoolId);
                    pendingQRs.delete(schoolId);
                    
                    await MessagingSettings.findOneAndUpdate(
                        { school: schoolId },
                        { 'whatsapp.connected': false }
                    );
                });
                
                // Initialize client
                client.initialize().catch(err => {
                    console.error('WhatsApp initialize error:', err);
                    if (!qrResolved) {
                        qrResolved = true;
                        resolve({
                            success: false,
                            error: 'Failed to initialize: ' + err.message
                        });
                    }
                });
                
                // Timeout after 60 seconds
                setTimeout(() => {
                    if (!qrResolved) {
                        qrResolved = true;
                        resolve({
                            success: false,
                            error: 'Connection timeout. Please try again.'
                        });
                    }
                }, 60000);
            });
            
        } catch (err) {
            console.error('WhatsApp connect error:', err);
            return { success: false, error: err.message };
        }
    }
    
    /**
     * Get connection status
     * @param {string} schoolId - School ID
     * @returns {Object} Connection status
     */
    static async getStatus(schoolId) {
        // Check active client
        if (activeClients.has(schoolId)) {
            const clientData = activeClients.get(schoolId);
            if (clientData.ready) {
                return {
                    connected: true,
                    phoneNumber: clientData.phoneNumber
                };
            }
            if (pendingQRs.has(schoolId)) {
                return {
                    connected: false,
                    qrCode: pendingQRs.get(schoolId),
                    status: 'waiting_scan'
                };
            }
        }
        
        // Check database
        const settings = await MessagingSettings.findOne({ school: schoolId });
        
        return {
            connected: settings?.whatsapp?.connected || false,
            phoneNumber: settings?.whatsapp?.phoneNumber || ''
        };
    }
    
    /**
     * Disconnect WhatsApp
     * @param {string} schoolId - School ID
     * @returns {Object} Result
     */
    static async disconnect(schoolId) {
        try {
            // Destroy client
            if (activeClients.has(schoolId)) {
                const clientData = activeClients.get(schoolId);
                if (clientData.client) {
                    await clientData.client.destroy();
                }
                activeClients.delete(schoolId);
            }
            
            pendingQRs.delete(schoolId);
            
            // Clear session files
            const sessionPath = path.join(SESSIONS_DIR, `session-${schoolId}`);
            if (fs.existsSync(sessionPath)) {
                fs.rmSync(sessionPath, { recursive: true, force: true });
            }
            
            // Update database
            await MessagingSettings.findOneAndUpdate(
                { school: schoolId },
                { 
                    'whatsapp.connected': false,
                    'whatsapp.phoneNumber': ''
                }
            );
            
            return { success: true, message: 'WhatsApp disconnected' };
        } catch (err) {
            console.error('WhatsApp disconnect error:', err);
            return { success: false, error: err.message };
        }
    }
    
    /**
     * Send WhatsApp message
     * @param {string} schoolId - School ID
     * @param {string} phoneNumber - Recipient phone (with country code)
     * @param {string} message - Message text
     * @returns {Object} Send result
     */
    static async sendMessage(schoolId, phoneNumber, message) {
        try {
            const clientData = activeClients.get(schoolId);
            
            if (!clientData?.ready || !clientData?.client) {
                return { 
                    success: false, 
                    error: 'WhatsApp not connected. Please connect first.' 
                };
            }
            
            // Format phone number
            let formattedNumber = phoneNumber.replace(/\D/g, '');
            
            // Add Pakistan country code if not present
            if (formattedNumber.startsWith('0')) {
                formattedNumber = '92' + formattedNumber.substring(1);
            } else if (!formattedNumber.startsWith('92')) {
                formattedNumber = '92' + formattedNumber;
            }
            
            const chatId = `${formattedNumber}@c.us`;
            
            // Send message
            const result = await clientData.client.sendMessage(chatId, message);
            
            console.log(`[WhatsApp] Message sent to ${formattedNumber}`);
            
            return { 
                success: true, 
                messageId: result.id?.id || result.id,
                message: 'Message sent successfully'
            };
        } catch (err) {
            console.error('WhatsApp send error:', err);
            return { success: false, error: err.message };
        }
    }
    
    /**
     * Send bulk WhatsApp messages
     * @param {string} schoolId - School ID
     * @param {Array} recipients - Array of {phone, message}
     * @returns {Object} Results
     */
    static async sendBulkMessages(schoolId, recipients) {
        const results = {
            total: recipients.length,
            sent: 0,
            failed: 0,
            details: []
        };
        
        for (const recipient of recipients) {
            const result = await this.sendMessage(schoolId, recipient.phone, recipient.message);
            
            if (result.success) {
                results.sent++;
            } else {
                results.failed++;
            }
            
            results.details.push({
                phone: recipient.phone,
                ...result
            });
            
            // Add delay between messages (3 seconds) to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
        return results;
    }
}

module.exports = WhatsAppService;
