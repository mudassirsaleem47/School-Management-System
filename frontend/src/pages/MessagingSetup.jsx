import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
    Settings, MessageSquare, Mail, Smartphone, QrCode, 
    CheckCircle2, XCircle, RefreshCw, Send, Eye, EyeOff,
    Wifi, WifiOff, AlertCircle, Loader2
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL;

const MessagingSetup = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    
    // Tab State
    const [activeTab, setActiveTab] = useState('whatsapp');
    
    // WhatsApp State
    const [whatsappStatus, setWhatsappStatus] = useState('disconnected'); // 'disconnected', 'connecting', 'connected', 'qr'
    const [qrCode, setQrCode] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [loadingWhatsapp, setLoadingWhatsapp] = useState(false);
    
    // Email State
    const [emailConfig, setEmailConfig] = useState({
        smtpHost: '',
        smtpPort: '587',
        smtpUser: '',
        smtpPassword: '',
        senderName: '',
        senderEmail: ''
    });
    const [emailStatus, setEmailStatus] = useState('disconnected'); // 'disconnected', 'connected', 'testing'
    const [showPassword, setShowPassword] = useState(false);
    const [savingEmail, setSavingEmail] = useState(false);
    const [testingEmail, setTestingEmail] = useState(false);

    // Fetch current settings
    const fetchSettings = useCallback(async () => {
        try {
            const schoolId = currentUser._id;
            const response = await axios.get(`${API_BASE}/MessagingSettings/${schoolId}`);
            
            if (response.data) {
                // WhatsApp settings
                if (response.data.whatsapp) {
                    setWhatsappStatus(response.data.whatsapp.connected ? 'connected' : 'disconnected');
                    setWhatsappNumber(response.data.whatsapp.phoneNumber || '');
                }
                
                // Email settings
                if (response.data.email) {
                    setEmailConfig({
                        smtpHost: response.data.email.smtpHost || '',
                        smtpPort: response.data.email.smtpPort || '587',
                        smtpUser: response.data.email.smtpUser || '',
                        smtpPassword: '', // Never return password from backend
                        senderName: response.data.email.senderName || '',
                        senderEmail: response.data.email.senderEmail || ''
                    });
                    setEmailStatus(response.data.email.verified ? 'connected' : 'disconnected');
                }
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) fetchSettings();
    }, [currentUser, fetchSettings]);

    // WhatsApp Functions
    const connectWhatsapp = async () => {
        try {
            setLoadingWhatsapp(true);
            setWhatsappStatus('connecting');
            
            const response = await axios.post(`${API_BASE}/WhatsApp/Connect`, {
                school: currentUser._id
            });
            
            if (response.data.qrCode) {
                setQrCode(response.data.qrCode);
                setWhatsappStatus('qr');
                
                // Poll for connection status
                pollWhatsappStatus();
            }
        } catch (err) {
            showToast('Error connecting to WhatsApp!', 'error');
            setWhatsappStatus('disconnected');
        } finally {
            setLoadingWhatsapp(false);
        }
    };

    const pollWhatsappStatus = async () => {
        const checkStatus = async () => {
            try {
                const response = await axios.get(`${API_BASE}/WhatsApp/Status/${currentUser._id}`);
                
                if (response.data.connected) {
                    setWhatsappStatus('connected');
                    setWhatsappNumber(response.data.phoneNumber || '');
                    setQrCode('');
                    showToast('WhatsApp connected successfully!', 'success');
                    return true;
                } else if (response.data.qrCode && response.data.qrCode !== qrCode) {
                    setQrCode(response.data.qrCode);
                }
                return false;
            } catch (err) {
                return false;
            }
        };
        
        // Poll every 3 seconds for 2 minutes
        let attempts = 0;
        const maxAttempts = 40;
        
        const poll = setInterval(async () => {
            const connected = await checkStatus();
            attempts++;
            
            if (connected || attempts >= maxAttempts) {
                clearInterval(poll);
                if (!connected && attempts >= maxAttempts) {
                    showToast('QR code expired. Please try again.', 'error');
                    setWhatsappStatus('disconnected');
                    setQrCode('');
                }
            }
        }, 3000);
    };

    const disconnectWhatsapp = async () => {
        try {
            setLoadingWhatsapp(true);
            await axios.post(`${API_BASE}/WhatsApp/Disconnect`, {
                school: currentUser._id
            });
            
            setWhatsappStatus('disconnected');
            setWhatsappNumber('');
            setQrCode('');
            showToast('WhatsApp disconnected!', 'success');
        } catch (err) {
            showToast('Error disconnecting WhatsApp!', 'error');
        } finally {
            setLoadingWhatsapp(false);
        }
    };

    // Email Functions
    const saveEmailConfig = async () => {
        if (!emailConfig.smtpHost || !emailConfig.smtpUser || !emailConfig.senderEmail) {
            showToast('Please fill in all required fields!', 'error');
            return;
        }

        try {
            setSavingEmail(true);
            
            await axios.post(`${API_BASE}/EmailSettings`, {
                school: currentUser._id,
                ...emailConfig
            });
            
            showToast('Email settings saved successfully!', 'success');
        } catch (err) {
            showToast('Error saving email settings!', 'error');
        } finally {
            setSavingEmail(false);
        }
    };

    const testEmailConnection = async () => {
        if (!emailConfig.smtpHost || !emailConfig.smtpUser) {
            showToast('Please save settings first!', 'error');
            return;
        }

        try {
            setTestingEmail(true);
            setEmailStatus('testing');
            
            const response = await axios.post(`${API_BASE}/EmailSettings/Test`, {
                school: currentUser._id,
                testEmail: emailConfig.senderEmail
            });
            
            if (response.data.success) {
                setEmailStatus('connected');
                showToast('Email configuration verified!', 'success');
            } else {
                setEmailStatus('disconnected');
                showToast(response.data.error || 'Email test failed!', 'error');
            }
        } catch (err) {
            setEmailStatus('disconnected');
            showToast('Error testing email connection!', 'error');
        } finally {
            setTestingEmail(false);
        }
    };

    // Get status badge component
    const getStatusBadge = (status) => {
        const badges = {
            connected: { icon: CheckCircle2, color: 'bg-green-100 text-green-700', label: 'Connected' },
            disconnected: { icon: XCircle, color: 'bg-red-100 text-red-700', label: 'Disconnected' },
            connecting: { icon: Loader2, color: 'bg-yellow-100 text-yellow-700', label: 'Connecting...' },
            qr: { icon: QrCode, color: 'bg-blue-100 text-blue-700', label: 'Scan QR Code' },
            testing: { icon: Loader2, color: 'bg-yellow-100 text-yellow-700', label: 'Testing...' }
        };
        const badge = badges[status] || badges.disconnected;
        const Icon = badge.icon;
        
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-600 ${badge.color}`}>
                <Icon className={`w-4 h-4 ${status === 'connecting' || status === 'testing' ? 'animate-spin' : ''}`} />
                {badge.label}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6 md:p-8">
            
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                    <Settings className="w-10 h-10 text-indigo-600" />
                    Messaging Setup
                </h1>
                <p className="text-gray-600 mt-2">Configure WhatsApp and Email for sending messages</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setActiveTab('whatsapp')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-600 transition ${
                        activeTab === 'whatsapp'
                            ? 'bg-green-500 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                >
                    <Smartphone className="w-5 h-5" />
                    WhatsApp
                </button>
                <button
                    onClick={() => setActiveTab('email')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-600 transition ${
                        activeTab === 'email'
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                >
                    <Mail className="w-5 h-5" />
                    Email (SMTP)
                </button>
            </div>

            {/* WhatsApp Tab */}
            {activeTab === 'whatsapp' && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-linear-to-r from-green-500 to-green-600">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                    <MessageSquare className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">WhatsApp Connection</h2>
                                    <p className="text-green-100 text-sm">Connect using Baileys (Web.js Alternative)</p>
                                </div>
                            </div>
                            {getStatusBadge(whatsappStatus)}
                        </div>
                    </div>

                    <div className="p-6">
                        {whatsappStatus === 'connected' ? (
                            <div className="text-center py-8">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">WhatsApp Connected!</h3>
                                <p className="text-gray-600 mb-2">Your WhatsApp is connected and ready to send messages.</p>
                                {whatsappNumber && (
                                    <p className="text-green-600 font-600 mb-6">
                                        Connected Number: {whatsappNumber}
                                    </p>
                                )}
                                <button
                                    onClick={disconnectWhatsapp}
                                    disabled={loadingWhatsapp}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-600"
                                >
                                    {loadingWhatsapp ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <WifiOff className="w-5 h-5" />
                                    )}
                                    Disconnect WhatsApp
                                </button>
                            </div>
                        ) : whatsappStatus === 'qr' ? (
                            <div className="text-center py-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Scan QR Code with WhatsApp</h3>
                                <p className="text-gray-600 mb-6">Open WhatsApp on your phone → Settings → Linked Devices → Link a Device</p>
                                
                                <div className="inline-block p-4 bg-white border-4 border-gray-200 rounded-2xl shadow-lg mb-6">
                                    {qrCode ? (
                                        <img 
                                            src={qrCode} 
                                            alt="WhatsApp QR Code" 
                                            className="w-64 h-64"
                                        />
                                    ) : (
                                        <div className="w-64 h-64 flex items-center justify-center">
                                            <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex items-center justify-center gap-2 text-yellow-600 bg-yellow-50 p-3 rounded-lg max-w-md mx-auto">
                                    <AlertCircle className="w-5 h-5" />
                                    <span className="text-sm">QR code will refresh automatically. Keep this page open.</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <QrCode className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">WhatsApp Not Connected</h3>
                                <p className="text-gray-600 mb-6">Connect your WhatsApp to send messages to students and parents.</p>
                                
                                <button
                                    onClick={connectWhatsapp}
                                    disabled={loadingWhatsapp}
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-lg transition font-600"
                                >
                                    {loadingWhatsapp ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Wifi className="w-5 h-5" />
                                    )}
                                    Connect WhatsApp
                                </button>
                                
                                <div className="mt-8 p-4 bg-blue-50 rounded-lg max-w-lg mx-auto text-left">
                                    <h4 className="font-600 text-blue-900 mb-2">How it works:</h4>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>1. Click "Connect WhatsApp" above</li>
                                        <li>2. Scan the QR code with your WhatsApp app</li>
                                        <li>3. Your WhatsApp is linked and ready to use</li>
                                        <li>4. Messages will be sent from your connected number</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Email Tab */}
            {activeTab === 'email' && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-linear-to-r from-blue-500 to-blue-600">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                    <Mail className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Email Configuration</h2>
                                    <p className="text-blue-100 text-sm">Setup SMTP for sending emails (using Nodemailer)</p>
                                </div>
                            </div>
                            {getStatusBadge(emailStatus)}
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* SMTP Host */}
                            <div>
                                <label className="block text-sm font-600 text-gray-700 mb-2">
                                    SMTP Host *
                                </label>
                                <input
                                    type="text"
                                    value={emailConfig.smtpHost}
                                    onChange={(e) => setEmailConfig({...emailConfig, smtpHost: e.target.value})}
                                    placeholder="smtp.gmail.com"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* SMTP Port */}
                            <div>
                                <label className="block text-sm font-600 text-gray-700 mb-2">
                                    SMTP Port
                                </label>
                                <select
                                    value={emailConfig.smtpPort}
                                    onChange={(e) => setEmailConfig({...emailConfig, smtpPort: e.target.value})}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="587">587 (TLS)</option>
                                    <option value="465">465 (SSL)</option>
                                    <option value="25">25 (No Encryption)</option>
                                </select>
                            </div>

                            {/* SMTP Username */}
                            <div>
                                <label className="block text-sm font-600 text-gray-700 mb-2">
                                    SMTP Username *
                                </label>
                                <input
                                    type="email"
                                    value={emailConfig.smtpUser}
                                    onChange={(e) => setEmailConfig({...emailConfig, smtpUser: e.target.value})}
                                    placeholder="your-email@gmail.com"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* SMTP Password */}
                            <div>
                                <label className="block text-sm font-600 text-gray-700 mb-2">
                                    SMTP Password / App Password *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={emailConfig.smtpPassword}
                                        onChange={(e) => setEmailConfig({...emailConfig, smtpPassword: e.target.value})}
                                        placeholder="••••••••••••••••"
                                        className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Sender Name */}
                            <div>
                                <label className="block text-sm font-600 text-gray-700 mb-2">
                                    Sender Name
                                </label>
                                <input
                                    type="text"
                                    value={emailConfig.senderName}
                                    onChange={(e) => setEmailConfig({...emailConfig, senderName: e.target.value})}
                                    placeholder="Your School Name"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Sender Email */}
                            <div>
                                <label className="block text-sm font-600 text-gray-700 mb-2">
                                    Sender Email *
                                </label>
                                <input
                                    type="email"
                                    value={emailConfig.senderEmail}
                                    onChange={(e) => setEmailConfig({...emailConfig, senderEmail: e.target.value})}
                                    placeholder="noreply@yourschool.com"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Info Box for Gmail */}
                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                <div>
                                    <h4 className="font-600 text-yellow-800">For Gmail Users:</h4>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        You need to use an <strong>App Password</strong> instead of your regular Gmail password. 
                                        Go to Google Account → Security → 2-Step Verification → App passwords to generate one.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={saveEmailConfig}
                                disabled={savingEmail}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-600 disabled:opacity-50"
                            >
                                {savingEmail ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="w-5 h-5" />
                                )}
                                Save Settings
                            </button>
                            <button
                                onClick={testEmailConnection}
                                disabled={testingEmail || !emailConfig.smtpHost}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-600 disabled:opacity-50"
                            >
                                {testingEmail ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                                Test Connection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessagingSetup;
