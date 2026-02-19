const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    isJidUser
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const QRCode = require('qrcode');
const MessagingSettings = require('../models/messagingSettingsSchema');
const WhatsAppSession = require('../models/whatsappSessionSchema');

// Store active socket connections in memory
const activeSockets = new Map();
const qrCodes = new Map(); // Store current QR for a school

/**
 * MongoDB Auth Adapter for Baileys
 * Adapts MongoDB to Baileys AuthState interface
 */
const useMongoDBAuthState = async (collection) => {
    // Helper to read data
    const readData = async (key) => {
        try {
            const data = await WhatsAppSession.findOne({ _id: collection });
            if (data && data.creds && key === 'creds') {
                return data.creds;
            }
            if (data && data.keys && data.keys[key]) {
                return JSON.parse(data.keys[key]);
            }
            return null;
        } catch (error) {
            console.error('Error reading auth state:', error);
            return null;
        }
    };

    // Helper to write data
    const writeData = async (data, key) => {
        try {
            const update = {};
            if (key === 'creds') {
                update.creds = data;
            } else {
                update[`keys.${key}`] = JSON.stringify(data);
            }

            await WhatsAppSession.findOneAndUpdate(
                { _id: collection },
                { $set: update },
                { upsert: true, new: true }
            );
        } catch (error) {
            console.error('Error writing auth state:', error);
        }
    };

    // Helper to remove data
    const removeData = async (key) => {
        try {
            const update = {};
            update[`keys.${key}`] = 1;
            await WhatsAppSession.updateOne(
                { _id: collection },
                { $unset: update }
            );
        } catch (error) {
            console.error('Error removing auth state:', error);
        }
    };

    const creds = (await readData('creds')) || (await (async () => {
        const { state } = await useMultiFileAuthState('temp'); // Values will be overwritten
        return state.creds;
        // We actually need to initialize empty creds if not found.
        // Baileys 'initAuthCreds' is not directly exported but useMultiFileAuthState does it.
        // Let's rely on makeWASocket to init if we pass null? No.
        // We can import initAuthCreds from baileys/lib/Utils/auth-utils if needed, 
        // but easier to just let a local temp state init it once?
        // Actually, let's just use the init function if available or empty object?
        // Better:
        const { initAuthCreds } = require('@whiskeysockets/baileys');
        return initAuthCreds();
    })());

    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data = {};
                    await Promise.all(
                        ids.map(async (id) => {
                            let value = await readData(`${type}-${id}`);
                            if (type === 'app-state-sync-key' && value) {
                                // value = value; // proto
                            }
                            if (value) {
                                data[id] = value;
                            }
                        })
                    );
                    return data;
                },
                set: async (data) => {
                    await Promise.all(
                        Object.keys(data).map(async (category) => {
                            await Promise.all(
                                Object.keys(data[category]).map(async (id) => {
                                    const value = data[category][id];
                                    const key = `${category}-${id}`;
                                    if (value) {
                                        await writeData(value, key);
                                    } else {
                                        await removeData(key);
                                    }
                                })
                            );
                        })
                    );
                }
            }
        },
        saveCreds: async () => {
            await writeData(creds, 'creds');
        }
    };
};


class WhatsAppService {

    /**
     * Initialize/Connect WhatsApp for a school
     */
    static async connect(schoolId) {
        try {
            // If already connected, return status
            if (activeSockets.has(schoolId)) {
                const sock = activeSockets.get(schoolId);
                // Check if socket is actually open/connected?
                // Baileys doesn't have a simple 'isConnected' property exposed easily 
                // but we can check the user presence or if we receive events.
                // For now, if it's in the map, we assume it's valid or reconnecting.

                // If we have a user JID, we are connected.
                if (sock.user) {
                    return { 
                        success: true, 
                        connected: true, 
                         phoneNumber: sock.user.id.split(':')[0] 
                    };
                }
            }

            // Clean up existing QR if any
            qrCodes.delete(schoolId);

            // Fetch latest version
            const { version, isLatest } = await fetchLatestBaileysVersion();
            console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`);

            // Initialize Auth State with MongoDB
            const { state, saveCreds } = await useMongoDBAuthState(schoolId);

            // Create Socket
            const sock = makeWASocket({
                version,
                logger: pino({ level: 'silent' }), // 'debug' for more info
                printQRInTerminal: false, // We will handle QR manually
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
                },
                generateHighQualityLinkPreview: true,
            // browser: ['School Management System', 'Chrome', '10.0.0'],
            });

            // Save schoolId to socket for reference
            sock.schoolId = schoolId;
            activeSockets.set(schoolId, sock);

            // Store QR promise resolver
            let qrResolve;
            const qrPromise = new Promise((resolve) => { qrResolve = resolve; });

            // Connection Update Handler
            sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;

                if (qr) {
                    console.log(`QR Generated for ${schoolId}`);
                    try {
                        const qrDataURL = await QRCode.toDataURL(qr, {
                            width: 256,
                            margin: 2,
                            color: { dark: '#128C7E', light: '#FFFFFF' }
                        });
                        
                        qrCodes.set(schoolId, qrDataURL);
                        
                        // If this is the first QR, resolve the connect promise
                        if (qrResolve) {
                            qrResolve({
                                success: true,
                                qrCode: qrDataURL,
                                message: 'Scan QR code with WhatsApp'
                            });
                            qrResolve = null; // Only resolve once
                        }
                    } catch (err) {
                        console.error('QR Generate Error:', err);
                    }
                }

                if (connection === 'close') {
                    const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                    console.log(`Connection closed for ${schoolId}:`, lastDisconnect.error, ', reconnecting:', shouldReconnect);

                    // Remove from active map
                    activeSockets.delete(schoolId);
                    
                    if (shouldReconnect) {
                        // Reconnect
                        this.connect(schoolId);
                    } else {
                        // Logged out
                        console.log(`Logged out ${schoolId}`);
                        await WhatsAppSession.deleteOne({ _id: schoolId });
                        await MessagingSettings.findOneAndUpdate(
                            { school: schoolId },
                            { 'whatsapp.connected': false, 'whatsapp.phoneNumber': '' }
                        );
                    }
                } else if (connection === 'open') {
                    console.log('Opened connection to WA for', schoolId);
                    
                    const phoneNumber = sock.user.id.split(':')[0];
                    
                    // Update Database
                    await MessagingSettings.findOneAndUpdate(
                        { school: schoolId },
                        { 
                            'whatsapp.connected': true, 
                            'whatsapp.phoneNumber': phoneNumber,
                            'whatsapp.lastConnected': new Date()
                        },
                        { upsert: true }
                    );

                    qrCodes.delete(schoolId);
                    
                    if (qrResolve) {
                        qrResolve({
                            success: true,
                            connected: true,
                            phoneNumber
                        });
                        qrResolve = null;
                    }
                }
            });

            sock.ev.on('creds.update', saveCreds);

            // Wait for initial QR or Connection
            // We set a timeout to allow the event listeners to fire
            // But we already return a promise that resolves on QR or Open
            // We can also return a race with timeout

            const timeoutPromise = new Promise(resolve => setTimeout(() => {
                if (qrResolve) {
                    qrResolve({ success: false, error: "Connection timed out" });
                    qrResolve = null;
                }
            }, 20000)); // 20s timeout for initial response

            return Promise.race([qrPromise, timeoutPromise]);
            
        } catch (error) {
            console.error('WhatsApp Connect Error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get Connection Status
     */
    static async getStatus(schoolId) {
        // Check active memory
        if (activeSockets.has(schoolId)) {
            const sock = activeSockets.get(schoolId);
            if (sock.user) {
                return {
                    connected: true,
                    phoneNumber: sock.user.id.split(':')[0]
                };
            }
        }

        // Check pending QR
        if (qrCodes.has(schoolId)) {
            return {
                connected: false,
                 qrCode: qrCodes.get(schoolId),
                 status: 'waiting_scan'
             };
        }

        // Check Database
        // If server restarted, we might not have socket in memory but have session in DB.
        // We might want to trigger a background reconnect here if we have creds?
        // But for getStatus, we typically want current live status.
        // If we have creds in DB, we could try to "restore" connection silently?
        // Let's check DB setting
        const settings = await MessagingSettings.findOne({ school: schoolId });
        if (settings?.whatsapp?.connected) {
            // Attempt to restore connection if not in memory
            if (!activeSockets.has(schoolId)) {
                this.connect(schoolId); // Trigger background connect
                return {
                    connected: true, // Optimistic
                    phoneNumber: settings.whatsapp.phoneNumber,
                    message: "Reconnecting session..."
                };
            }
        }

        return {
            connected: false,
            phoneNumber: settings?.whatsapp?.phoneNumber || ''
        };
    }

    /**
     * Disconnect/Logout
     */
    static async disconnect(schoolId) {
        try {
            if (activeSockets.has(schoolId)) {
                const sock = activeSockets.get(schoolId);
                sock.end(undefined); // Close connection
                activeSockets.delete(schoolId);
            }
            
            // Clear session data from DB
            await WhatsAppSession.deleteOne({ _id: schoolId });

            await MessagingSettings.findOneAndUpdate(
                { school: schoolId },
                { 'whatsapp.connected': false, 'whatsapp.phoneNumber': '' }
            );

            qrCodes.delete(schoolId);
            
            return { success: true, message: 'Disconnected and session cleared' };
        } catch (error) {
            console.error('Disconnect Error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send Message
     */
    static async sendMessage(schoolId, phoneNumber, message) {
        try {
            let sock = activeSockets.get(schoolId);

            // If socket not active, try to reconnect using stored session
            if (!sock) {
                const sessionExists = await WhatsAppSession.exists({ _id: schoolId });
                if (sessionExists) {
                    await this.connect(schoolId);
                    // Wait a bit for connection?
                    await new Promise(r => setTimeout(r, 2000));
                    sock = activeSockets.get(schoolId);
                }
            }

            if (!sock) {
                return { success: false, error: 'WhatsApp not connected' };
            }
            
            // Wait for connection to be open if it's connecting
            // TODO: Better state checking

            // Format number
            let formattedNumber = phoneNumber.replace(/\D/g, '');
            if (!formattedNumber.startsWith('92') && formattedNumber.startsWith('0')) {
                formattedNumber = '92' + formattedNumber.substring(1);
            } else if (!formattedNumber.startsWith('92')) {
                formattedNumber = '92' + formattedNumber;
            }
            const jid = formattedNumber + '@s.whatsapp.net';

            // Send
            const sent = await sock.sendMessage(jid, { text: message });
            
            return {
                success: true,
                messageId: sent.key.id,
                message: 'Message sent successfully'
            };

        } catch (error) {
            console.error('Send Message Error:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = WhatsAppService;
