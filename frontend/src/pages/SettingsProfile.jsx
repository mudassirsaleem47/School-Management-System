import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../components/theme-provider';
import {
    Upload, Save, Building, Mail, Phone, MapPin, Globe, User,
    PanelLeft, Check, Pipette, Plus, ChevronRight, Settings2,
    MessageSquare, Smartphone, QrCode, Wifi, WifiOff, XCircle, RefreshCw, Send,
    Shield, Bell, Palette, Loader2, Eye, EyeOff, CheckCircle2, Info, Monitor, Lock,
    CalendarDays, RotateCcw, Sun, Moon, Sparkles, Scan, Type, SlidersHorizontal, Languages, Clock
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

const API_BASE = import.meta.env.VITE_API_URL;

// --- Accent Color Presets ---
const ACCENT_COLORS = [
    { name: 'Zinc', hsl: '240 5.9% 10%', hslDark: '0 0% 98%', ring: '240 5% 64.9%', preview: '#18181b' },
    { name: 'Slate', hsl: '215.4 16.3% 46.9%', hslDark: '210 40% 96.1%', ring: '215 20.2% 65.1%', preview: '#64748b' },
    { name: 'Blue', hsl: '221.2 83.2% 53.3%', hslDark: '217.2 91.2% 59.8%', ring: '224 76% 48%', preview: '#3b82f6' },
    { name: 'Violet', hsl: '262.1 83.3% 57.8%', hslDark: '263.4 70% 50.4%', ring: '263.4 70% 50.4%', preview: '#8b5cf6' },
    { name: 'Rose', hsl: '346.8 77.2% 49.8%', hslDark: '346.8 77.2% 49.8%', ring: '346.8 77.2% 49.8%', preview: '#e11d48' },
    { name: 'Orange', hsl: '24.6 95% 53.1%', hslDark: '20.5 90.2% 48.2%', ring: '24.6 95% 53.1%', preview: '#f97316' },
    { name: 'Green', hsl: '142.1 76.2% 36.3%', hslDark: '142.1 70.6% 45.3%', ring: '142.4 71.8% 29.2%', preview: '#16a34a' },
    { name: 'Yellow', hsl: '47.9 95.8% 53.1%', hslDark: '47.9 95.8% 53.1%', ring: '47.9 95.8% 53.1%', preview: '#eab308' },
];

const RADIUS_PRESETS = [
    { name: 'None', value: '0rem' },
    { name: 'Small', value: '0.3rem' },
    { name: 'Medium', value: '0.5rem' },
    { name: 'Large', value: '0.75rem' },
    { name: 'Full', value: '1rem' },
];

const FONT_SIZES = [
    { name: 'Compact', value: '14px', scale: 0.875 },
    { name: 'Default', value: '16px', scale: 1 },
    { name: 'Comfortable', value: '18px', scale: 1.125 },
    { name: 'Large', value: '20px', scale: 1.25 },
];

// --- Navigation Items ---
const NAV_ITEMS = [
    { id: 'general', label: 'General', icon: Building, description: 'School profile & admin info' },
    { id: 'security', label: 'Security', icon: Shield, description: 'Password & sessions' },
    { id: 'messaging', label: 'Messaging', icon: MessageSquare, description: 'WhatsApp & email setup' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alert preferences' },
    { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Theme & customization' },
    { id: 'regional', label: 'Regional', icon: Globe, description: 'Language, currency & format' },
];

// --- Helpers ---
const applyAccentColor = (color) => {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    root.style.setProperty('--primary', isDark ? color.hslDark : color.hsl);
    root.style.setProperty('--ring', color.ring);
    root.style.setProperty('--sidebar-primary', isDark ? color.hslDark : color.hsl);
};

const hexToHsl = (hex) => {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

const applyRadius = (v) => document.documentElement.style.setProperty('--radius', v);
const applyFontScale = (v) => document.documentElement.style.fontSize = v;

// ================================================================
// MAIN COMPONENT
// ================================================================
const SettingsProfile = () => {
    const { currentUser, setCurrentUser } = useAuth();
    const { showToast } = useToast();
    const { theme, setTheme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [activeSection, setActiveSection] = useState('general');

    // --- Messaging State ---
    const [activeMsgTab, setActiveMsgTab] = useState('whatsapp');
    const [whatsappStatus, setWhatsappStatus] = useState('disconnected');
    const [qrCode, setQrCode] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [loadingWhatsapp, setLoadingWhatsapp] = useState(false);
    const [emailConfig, setEmailConfig] = useState({
        smtpHost: '', smtpPort: '587', smtpUser: '', smtpPassword: '',
        senderName: '', senderEmail: ''
    });
    const [emailStatus, setEmailStatus] = useState('disconnected');
    const [showEmailPass, setShowEmailPass] = useState(false);
    const [savingEmail, setSavingEmail] = useState(false);
    const [testingEmail, setTestingEmail] = useState(false);

    // General Profile
    const [formData, setFormData] = useState({
        name: '', email: '', schoolName: '', address: '', phoneNumber: '', website: ''
    });
    const [logo, setLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    // Password
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);

    // Notifications
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('sms_notificationPrefs');
        return saved ? JSON.parse(saved) : {
            emailNotifications: true, smsAlerts: false, feeReminders: true,
            attendanceAlerts: true, examResults: true, birthdayReminders: false,
        };
    });

    // Appearance
    const [customPickerOpen, setCustomPickerOpen] = useState(false);
    const [customColorHex, setCustomColorHex] = useState(() => localStorage.getItem('sms_customColorHex') || '#6366f1');
    const [accentColor, setAccentColor] = useState(() => {
        const saved = localStorage.getItem('sms_accentColor');
        return saved ? JSON.parse(saved) : ACCENT_COLORS[0];
    });
    const [borderRadius, setBorderRadius] = useState(() => localStorage.getItem('sms_borderRadius') || '0.65rem');
    const [fontSize, setFontSize] = useState(() => localStorage.getItem('sms_fontSize') || '16px');
    const [sidebarCompact, setSidebarCompact] = useState(() => localStorage.getItem('sms_sidebarCompact') === 'true');
    const [animationsEnabled, setAnimationsEnabled] = useState(() => {
        const saved = localStorage.getItem('sms_animations');
        return saved !== null ? saved === 'true' : true;
    });

    // Regional Preferences
    const [preferences, setPreferences] = useState(() => {
        const saved = localStorage.getItem('sms_appPreferences');
        return saved ? JSON.parse(saved) : {
            language: 'en', dateFormat: 'DD/MM/YYYY', timezone: 'Asia/Karachi',
            academicYearStart: 'April', currency: 'PKR', defaultView: 'grid',
        };
    });

    // --- Effects ---
    useEffect(() => { if (currentUser) fetchSettings(); }, [currentUser]);
    useEffect(() => { applyAccentColor(accentColor); }, [accentColor, theme]);
    useEffect(() => { applyRadius(borderRadius); }, [borderRadius]);
    useEffect(() => { applyFontScale(fontSize); }, [fontSize]);
    useEffect(() => {
        if (!animationsEnabled) {
            document.documentElement.style.setProperty('--animate-duration', '0s');
            document.documentElement.classList.add('no-animations');
        } else {
            document.documentElement.style.removeProperty('--animate-duration');
            document.documentElement.classList.remove('no-animations');
        }
    }, [animationsEnabled]);

    // Persist
    useEffect(() => { localStorage.setItem('sms_notificationPrefs', JSON.stringify(notifications)); }, [notifications]);
    useEffect(() => { localStorage.setItem('sms_accentColor', JSON.stringify(accentColor)); }, [accentColor]);
    useEffect(() => { localStorage.setItem('sms_borderRadius', borderRadius); }, [borderRadius]);
    useEffect(() => { localStorage.setItem('sms_fontSize', fontSize); }, [fontSize]);
    useEffect(() => { localStorage.setItem('sms_sidebarCompact', String(sidebarCompact)); }, [sidebarCompact]);
    useEffect(() => { localStorage.setItem('sms_animations', String(animationsEnabled)); }, [animationsEnabled]);
    useEffect(() => { localStorage.setItem('sms_appPreferences', JSON.stringify(preferences)); }, [preferences]);

    // --- Handlers ---
    const fetchSettings = async () => {
        try {
            const res = await axios.get(`${API_BASE}/Admin/${currentUser._id}`);
            const data = res.data;
            setFormData({
                name: data.name || '', email: data.email || '', schoolName: data.schoolName || '',
                address: data.address || '', phoneNumber: data.phoneNumber || '', website: data.website || ''
            });
            if (data.schoolLogo) {
                setLogoPreview(data.schoolLogo.startsWith('http') ? data.schoolLogo : `${API_BASE}/${data.schoolLogo}`);
            }

            // Fetch Messaging Settings
            const msgRes = await axios.get(`${API_BASE}/MessagingSettings/${currentUser._id}`);
            if (msgRes.data) {
                if (msgRes.data.whatsapp) {
                    setWhatsappStatus(msgRes.data.whatsapp.connected ? 'connected' : 'disconnected');
                    setWhatsappNumber(msgRes.data.whatsapp.phoneNumber || '');
                }
                if (msgRes.data.email) {
                    setEmailConfig({
                        smtpHost: msgRes.data.email.smtpHost || '',
                        smtpPort: msgRes.data.email.smtpPort || '587',
                        smtpUser: msgRes.data.email.smtpUser || '',
                        smtpPassword: '', // Don't return password
                        senderName: msgRes.data.email.senderName || '',
                        senderEmail: msgRes.data.email.senderEmail || ''
                    });
                    setEmailStatus(msgRes.data.email.verified ? 'connected' : 'disconnected');
                }
            }
        } catch (err) { showToast("Failed to load settings", "error"); }
    };

    // --- WhatsApp Handlers ---
    const connectWhatsapp = async () => {
        try {
            setLoadingWhatsapp(true);
            setWhatsappStatus('connecting');
            const res = await axios.post(`${API_BASE}/WhatsApp/Connect`, { school: currentUser._id });
            if (res.data.qrCode) {
                setQrCode(res.data.qrCode);
                setWhatsappStatus('qr');
                pollWhatsappStatus(res.data.qrCode);
            }
        } catch (err) {
            showToast('Error connecting to WhatsApp!', 'error');
            setWhatsappStatus('disconnected');
        } finally { setLoadingWhatsapp(false); }
    };

    const pollWhatsappStatus = async (currentQr) => {
        let attempts = 0;
        const maxAttempts = 40;
        const interval = setInterval(async () => {
            try {
                const res = await axios.get(`${API_BASE}/WhatsApp/Status/${currentUser._id}`);
                if (res.data.connected) {
                    setWhatsappStatus('connected');
                    setWhatsappNumber(res.data.phoneNumber || '');
                    setQrCode('');
                    showToast('WhatsApp connected!', 'success');
                    clearInterval(interval);
                } else if (res.data.qrCode && res.data.qrCode !== currentQr) {
                    setQrCode(res.data.qrCode);
                }
            } catch (err) { /* ignore */ }
            attempts++;
            if (attempts >= maxAttempts) {
                clearInterval(interval);
                setWhatsappStatus('disconnected');
                setQrCode('');
            }
        }, 3000);
    };

    const disconnectWhatsapp = async () => {
        try {
            setLoadingWhatsapp(true);
            await axios.post(`${API_BASE}/WhatsApp/Disconnect`, { school: currentUser._id });
            setWhatsappStatus('disconnected');
            setWhatsappNumber('');
            setQrCode('');
            showToast('WhatsApp disconnected!', 'success');
        } catch (err) { showToast('Error disconnecting WhatsApp!', 'error'); }
        finally { setLoadingWhatsapp(false); }
    };

    // --- Email Handlers ---
    const saveEmailConfig = async () => {
        if (!emailConfig.smtpHost || !emailConfig.smtpUser || !emailConfig.senderEmail) {
            showToast('Please fill required fields!', 'error'); return;
        }
        try {
            setSavingEmail(true);
            await axios.post(`${API_BASE}/EmailSettings`, { school: currentUser._id, ...emailConfig });
            showToast('Email settings saved!', 'success');
        } catch (err) { showToast('Error saving email settings!', 'error'); }
        finally { setSavingEmail(false); }
    };

    const testEmailConnection = async () => {
        if (!emailConfig.smtpHost || !emailConfig.smtpUser) {
            showToast('Please save settings first!', 'error'); return;
        }
        try {
            setTestingEmail(true); setEmailStatus('testing');
            const res = await axios.post(`${API_BASE}/EmailSettings/Test`, { school: currentUser._id, testEmail: emailConfig.senderEmail });
            if (res.data.success) {
                setEmailStatus('connected');
                showToast('Email configuration verified!', 'success');
            } else {
                setEmailStatus('disconnected');
                showToast(res.data.error || 'Test failed!', 'error');
            }
        } catch (err) {
            setEmailStatus('disconnected');
            showToast('Error testing connection!', 'error');
        } finally { setTestingEmail(false); }
    };

    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) { setLogo(file); const r = new FileReader(); r.onloadend = () => setLogoPreview(r.result); r.readAsDataURL(file); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            if (logo) data.append('schoolLogo', logo);
            const res = await axios.put(`${API_BASE}/Admin/${currentUser._id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
            setCurrentUser(res.data);
            showToast("Settings updated!", "success");
        } catch (err) { showToast("Failed to update settings", "error"); }
        finally { setLoading(false); }
    };

    const handlePasswordChange = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) { showToast("Passwords do not match", "error"); return; }
        if (passwordData.newPassword.length < 6) { showToast("Password must be at least 6 characters", "error"); return; }
        showToast("Password updated!", "success");
        setPasswordDialogOpen(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    const handleNotifChange = (key, value) => {
        setNotifications(prev => ({ ...prev, [key]: value }));
        showToast(`${key.replace(/([A-Z])/g, ' $1').trim()} ${value ? 'enabled' : 'disabled'}`, 'success');
    };

    const handlePrefChange = (key, value) => setPreferences(prev => ({ ...prev, [key]: value }));

    const handleAccentChange = (color) => {
        setAccentColor(color);
        applyAccentColor(color);
        showToast(`Accent color changed to ${color.name}`, 'success');
    };

    const handleRadiusChange = (value) => { setBorderRadius(value); applyRadius(value); };
    const handleFontSizeChange = (value) => { setFontSize(value); applyFontScale(value); };

    const resetAppearance = () => {
        const d = ACCENT_COLORS[0];
        setAccentColor(d); applyAccentColor(d);
        setBorderRadius('0.65rem'); applyRadius('0.65rem');
        setFontSize('16px'); applyFontScale('16px');
        setAnimationsEnabled(true);
        setTheme('system');
        showToast('Appearance reset to defaults', 'success');
    };

    // ================================================================
    // RENDER
    // ================================================================
    return (
        <div className="flex-1 p-8 pt-6 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Settings2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                        <p className="text-sm text-muted-foreground">Manage your school profile, preferences, and customization.</p>
                    </div>
                </div>
            </div>

            {/* Main Layout: Sidebar + Content */}
            <div className="flex gap-8">
                {/* Left Navigation */}
                <nav className="w-64 shrink-0 hidden lg:block self-start sticky top-6">
                    <div className="space-y-1">
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeSection === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${isActive
                                        ? 'bg-primary/10 text-primary shadow-sm'
                                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                                        }`}
                                >
                                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isActive ? 'bg-primary/15' : 'bg-muted/50 group-hover:bg-muted'
                                        }`}>
                                        <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-primary' : ''}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${isActive ? 'text-primary' : ''}`}>{item.label}</p>
                                        <p className="text-[11px] text-muted-foreground truncate">{item.description}</p>
                                    </div>
                                    {isActive && <ChevronRight className="h-4 w-4 text-primary shrink-0" />}
                                </button>
                            );
                        })}
                    </div>
                </nav>

                {/* Mobile Navigation */}
                <div className="lg:hidden w-full mb-6">
                    <ScrollArea className="w-full">
                        <div className="flex gap-2 pb-2">
                            {NAV_ITEMS.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeSection === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveSection(item.id)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${isActive
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>

                {/* Right Content */}
                <div className="flex-1 min-w-0 max-w-3xl">
                    {/* ============ GENERAL ============ */}
                    {activeSection === 'general' && (
                        <div className="space-y-6">
                            <SectionHeader
                                title="General Settings"
                                description="Manage your school identity and administrator profile."
                            />

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* School Branding */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">School Branding</CardTitle>
                                        <CardDescription>Upload your school logo and identity information.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-col sm:flex-row items-start gap-6">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="relative group">
                                                    <input type="file" hidden onChange={handleLogoChange} accept="image/*" id="logo-upload" />
                                                    <label htmlFor="logo-upload" className="cursor-pointer block">
                                                        <Avatar className="h-24 w-24 border-2 border-dashed border-muted-foreground/25 hover:border-primary transition-colors">
                                                            <AvatarImage src={logoPreview} alt="School Logo" />
                                                            <AvatarFallback className="bg-primary/5 text-primary">
                                                                <Building className="h-8 w-8" />
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Upload className="text-white h-5 w-5" />
                                                        </div>
                                                    </label>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground">PNG, JPG up to 5MB</p>
                                            </div>

                                            <div className="flex-1 w-full space-y-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="schoolName">School Name <span className="text-destructive">*</span></Label>
                                                        <Input id="schoolName" value={formData.schoolName} onChange={(e) => handleChange('schoolName', e.target.value)} placeholder="Your school name" required />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="website">Website</Label>
                                                        <Input id="website" value={formData.website} onChange={(e) => handleChange('website', e.target.value)} placeholder="https://example.com" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="phone">Phone Number</Label>
                                                        <Input id="phone" value={formData.phoneNumber} onChange={(e) => handleChange('phoneNumber', e.target.value)} placeholder="+92 300 1234567" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                                                        <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="admin@school.com" required />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="address">Address</Label>
                                                    <Textarea id="address" value={formData.address} onChange={(e) => handleChange('address', e.target.value)} placeholder="Full school address..." rows={2} />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Admin Profile */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Admin Profile</CardTitle>
                                        <CardDescription>Your personal admin account information.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="adminName">Full Name <span className="text-destructive">*</span></Label>
                                                <Input id="adminName" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Admin name" required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Role</Label>
                                                <Input value="Administrator" disabled className="bg-muted" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="flex justify-end gap-3 pt-2">
                                    <Button type="button" variant="outline" onClick={fetchSettings}>Discard</Button>
                                    <Button type="submit" disabled={loading} className="min-w-[130px]">
                                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ============ SECURITY ============ */}
                    {activeSection === 'security' && (
                        <div className="space-y-6">
                            <SectionHeader
                                title="Security"
                                description="Manage your password, sessions, and account security."
                            />

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Password</CardTitle>
                                    <CardDescription>Change your account password to keep it secure.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/30">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Lock className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Account Password</p>
                                                <p className="text-xs text-muted-foreground">Last changed: Not tracked yet</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => setPasswordDialogOpen(true)}>Change Password</Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Active Sessions</CardTitle>
                                    <CardDescription>Devices currently logged into your account.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between p-4 border rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                                <Monitor className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium flex items-center gap-2">
                                                    Current Session
                                                    <Badge variant="secondary" className="text-[10px] h-5">Active</Badge>
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Browser'} · {new Date().toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-destructive/20">
                                <CardHeader>
                                    <CardTitle className="text-base text-destructive">Account Delete</CardTitle>
                                    <CardDescription>Irreversible actions for your account.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-xl bg-destructive/5">
                                        <div>
                                            <p className="text-sm font-medium text-destructive">Delete Account</p>
                                            <p className="text-xs text-muted-foreground">Permanently remove your account and all data.</p>
                                        </div>
                                        <Button variant="destructive" size="sm" disabled>Delete</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* ============ MESSAGING ============ */}
                    {activeSection === 'messaging' && (
                        <div className="space-y-6">
                            <SectionHeader
                                title="Messaging Setup"
                                description="Configure WhatsApp and Email (SMTP) for system communication."
                            />

                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-lg w-fit">
                                        <button
                                            onClick={() => setActiveMsgTab('whatsapp')}
                                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeMsgTab === 'whatsapp' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}
                                        >
                                            WhatsApp
                                        </button>
                                        <button
                                            onClick={() => setActiveMsgTab('email')}
                                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeMsgTab === 'email' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}
                                        >
                                            Email (SMTP)
                                        </button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {activeMsgTab === 'whatsapp' ? (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${whatsappStatus === 'connected' ? 'bg-green-500/10' : 'bg-primary/10'}`}>
                                                        <Smartphone className={`h-5 w-5 ${whatsappStatus === 'connected' ? 'text-green-600' : 'text-primary'}`} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">WhatsApp Status</p>
                                                        <StatusIndicator status={whatsappStatus} />
                                                    </div>
                                                </div>
                                                {whatsappStatus === 'connected' ? (
                                                    <Button variant="destructive" size="sm" onClick={disconnectWhatsapp} disabled={loadingWhatsapp}>
                                                        {loadingWhatsapp ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> : <WifiOff className="h-3.5 w-3.5 mr-2" />}
                                                        Disconnect
                                                    </Button>
                                                ) : whatsappStatus !== 'qr' && (
                                                    <Button size="sm" onClick={connectWhatsapp} disabled={loadingWhatsapp}>
                                                        {loadingWhatsapp ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Wifi className="h-3.5 w-3.5 mr-2" />}
                                                        Connect
                                                    </Button>
                                                )}
                                            </div>

                                            {whatsappStatus === 'qr' && (
                                                <div className="flex flex-col items-center justify-center p-6 border rounded-xl bg-white dark:bg-zinc-950">
                                                    <p className="text-sm font-medium mb-4">Scan QR code with WhatsApp</p>
                                                    <div className="p-4 bg-white rounded-lg border">
                                                        {qrCode ? (
                                                            <img src={qrCode} alt="WhatsApp QR" className="w-48 h-48" />
                                                        ) : (
                                                            <div className="w-48 h-48 flex items-center justify-center bg-muted animate-pulse">
                                                                <QrCode className="h-10 w-10 text-muted-foreground opacity-20" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground mt-4 text-center max-w-[250px]">
                                                        Go to WhatsApp Settings {'>'} Linked Devices {'>'} Link a Device
                                                    </p>
                                                </div>
                                            )}

                                            {whatsappStatus === 'connected' && (
                                                <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50/50 dark:bg-green-500/5 border border-green-100 dark:border-green-500/20">
                                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-green-700 dark:text-green-400">Successfully Connected</p>
                                                        <p className="text-xs text-green-600 dark:text-green-500/80">Account: {whatsappNumber}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">SMTP Host</Label>
                                                    <Input placeholder="smtp.gmail.com" value={emailConfig.smtpHost} onChange={(e) => setEmailConfig({ ...emailConfig, smtpHost: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">SMTP Port</Label>
                                                    <Select value={emailConfig.smtpPort} onValueChange={(v) => setEmailConfig({ ...emailConfig, smtpPort: v })}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="587">587 (TLS)</SelectItem>
                                                            <SelectItem value="465">465 (SSL)</SelectItem>
                                                            <SelectItem value="25">25 (None)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">SMTP Username</Label>
                                                    <Input placeholder="user@example.com" value={emailConfig.smtpUser} onChange={(e) => setEmailConfig({ ...emailConfig, smtpUser: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">SMTP Password</Label>
                                                    <div className="relative">
                                                        <Input
                                                            type={showEmailPass ? 'text' : 'password'}
                                                            placeholder="••••••••"
                                                            value={emailConfig.smtpPassword}
                                                            onChange={(e) => setEmailConfig({ ...emailConfig, smtpPassword: e.target.value })}
                                                        />
                                                        <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowEmailPass(!showEmailPass)}>
                                                            {showEmailPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Sender Name</Label>
                                                    <Input placeholder="School Name" value={emailConfig.senderName} onChange={(e) => setEmailConfig({ ...emailConfig, senderName: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Sender Email</Label>
                                                    <Input placeholder="noreply@school.com" value={emailConfig.senderEmail} onChange={(e) => setEmailConfig({ ...emailConfig, senderEmail: e.target.value })} />
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-3 pt-4">
                                                <Button variant="outline" size="sm" onClick={testEmailConnection} disabled={testingEmail}>
                                                    {testingEmail ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-2" />}
                                                    Test Connection
                                                </Button>
                                                <Button size="sm" onClick={saveEmailConfig} disabled={savingEmail}>
                                                    {savingEmail ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-2" />}
                                                    Save Setup
                                                </Button>
                                            </div>

                                            <div className="mt-4 p-4 rounded-xl border bg-blue-50/30 dark:bg-blue-500/5 text-blue-700 dark:text-blue-400">
                                                <div className="flex gap-3">
                                                    <Info className="h-5 w-5 shrink-0" />
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-bold uppercase tracking-wide">Gmail Users</p>
                                                        <p className="text-[11px] leading-relaxed opacity-90">
                                                            Use an <strong>App Password</strong> if you have 2-Step Verification enabled.
                                                            Regular login passwords won't work for SMTP connections.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                    {/* ============ NOTIFICATIONS ============ */}
                    {
                        activeSection === 'notifications' && (
                            <div className="space-y-6">
                                <SectionHeader
                                    title="Notifications"
                                    description="Choose what alerts and updates you want to receive."
                                />

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Communication</CardTitle>
                                        <CardDescription>Choose how you want to be notified.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-1">
                                        <NotifRow icon={Mail} title="Email Notifications" desc="Receive system updates and reports via email." checked={notifications.emailNotifications} onChange={(v) => handleNotifChange('emailNotifications', v)} />
                                        <Separator className="my-4" />
                                        <NotifRow icon={Phone} title="SMS Alerts" desc="Get critical alerts via text message." checked={notifications.smsAlerts} onChange={(v) => handleNotifChange('smsAlerts', v)} />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Academic Alerts</CardTitle>
                                        <CardDescription>Notifications for academic activities.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-1">
                                        <NotifRow icon={CalendarDays} title="Fee Reminders" desc="Reminders for upcoming and overdue fee payments." checked={notifications.feeReminders} onChange={(v) => handleNotifChange('feeReminders', v)} />
                                        <Separator className="my-4" />
                                        <NotifRow icon={CheckCircle2} title="Attendance Alerts" desc="Student absence or late arrival notifications." checked={notifications.attendanceAlerts} onChange={(v) => handleNotifChange('attendanceAlerts', v)} />
                                        <Separator className="my-4" />
                                        <NotifRow icon={Info} title="Exam Results" desc="Get notified when exam results are published." checked={notifications.examResults} onChange={(v) => handleNotifChange('examResults', v)} />
                                        <Separator className="my-4" />
                                        <NotifRow icon={CalendarDays} title="Birthday Reminders" desc="Daily digest of student and staff birthdays." checked={notifications.birthdayReminders} onChange={(v) => handleNotifChange('birthdayReminders', v)} />
                                    </CardContent>
                                </Card>
                            </div>
                        )
                    }

                    {/* ============ APPEARANCE ============ */}
                    {
                        activeSection === 'appearance' && (
                            <div className="space-y-6">
                                <SectionHeader
                                    title="Appearance"
                                    description="Customize the look and feel of the application."
                                    action={
                                        <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5" onClick={resetAppearance}>
                                            <RotateCcw className="h-3.5 w-3.5" /> Reset All
                                        </Button>
                                    }
                                />

                                {/* Theme Mode */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Theme Mode</CardTitle>
                                        <CardDescription>Select light, dark, or system theme.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-3 gap-3">
                                            <ThemeCard icon={Sun} label="Light" active={theme === 'light'} onClick={() => setTheme('light')} />
                                            <ThemeCard icon={Moon} label="Dark" active={theme === 'dark'} onClick={() => setTheme('dark')} />
                                            <ThemeCard icon={Monitor} label="System" active={theme === 'system'} onClick={() => setTheme('system')} />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Accent Color */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 text-primary" /> Accent Color
                                        </CardTitle>
                                        <CardDescription>Primary accent color for the application.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-4 sm:grid-cols-9 gap-3">
                                            {ACCENT_COLORS.map((color) => (
                                                <button
                                                    key={color.name}
                                                    type="button"
                                                    onClick={() => handleAccentChange(color)}
                                                    className={`group relative flex flex-col items-center gap-2 p-2.5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${accentColor.name === color.name
                                                        ? 'border-foreground shadow-lg scale-105'
                                                        : 'border-transparent hover:border-muted-foreground/30 hover:bg-muted/50'
                                                        }`}
                                                >
                                                    <div className="relative">
                                                        <div className="h-8 w-8 rounded-full shadow-md transition-transform group-hover:scale-110" style={{ backgroundColor: color.preview }} />
                                                        {accentColor.name === color.name && (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <Check className="h-4 w-4 text-white drop-shadow-md" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className={`text-[11px] font-medium ${accentColor.name === color.name ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                        {color.name}
                                                    </span>
                                                </button>
                                            ))}

                                            {/* Custom Color */}
                                            <Popover open={customPickerOpen} onOpenChange={setCustomPickerOpen}>
                                                <PopoverTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className={`group relative flex flex-col items-center gap-2 p-2.5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${accentColor.name === 'Custom'
                                                            ? 'border-foreground shadow-lg scale-105'
                                                            : 'border-transparent hover:border-muted-foreground/30 hover:bg-muted/50'
                                                            }`}
                                                    >
                                                        <div className="relative">
                                                            <div
                                                                className="h-8 w-8 rounded-full shadow-md transition-transform group-hover:scale-110 flex items-center justify-center"
                                                                style={{
                                                                    background: accentColor.name === 'Custom'
                                                                        ? customColorHex
                                                                        : 'conic-gradient(from 0deg, #f87171, #fb923c, #facc15, #4ade80, #60a5fa, #a78bfa, #f472b6, #f87171)'
                                                                }}
                                                            >
                                                                {accentColor.name === 'Custom'
                                                                    ? <Check className="h-4 w-4 text-white drop-shadow-md" />
                                                                    : <Plus className="h-4 w-4 text-white drop-shadow-md" />}
                                                            </div>
                                                        </div>
                                                        <span className={`text-[11px] font-medium ${accentColor.name === 'Custom' ? 'text-foreground' : 'text-muted-foreground'}`}>Custom</span>
                                                    </button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-64 p-4" align="center">
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                                                <Pipette className="h-3.5 w-3.5" /> Pick a Color
                                                            </Label>
                                                            <div className="flex items-center gap-3">
                                                                <input
                                                                    type="color"
                                                                    value={customColorHex}
                                                                    onChange={(e) => setCustomColorHex(e.target.value)}
                                                                    className="w-12 h-12 rounded-lg cursor-pointer border-2 border-muted hover:border-primary transition-colors p-0.5"
                                                                />
                                                                <div className="flex-1 space-y-1.5">
                                                                    <Input
                                                                        value={customColorHex}
                                                                        onChange={(e) => { const val = e.target.value; if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) setCustomColorHex(val); }}
                                                                        placeholder="#6366f1"
                                                                        className="font-mono text-sm h-9"
                                                                        maxLength={7}
                                                                    />
                                                                    <p className="text-[10px] text-muted-foreground">HSL: {hexToHsl(customColorHex)}</p>
                                                                </div>
                                                            </div>
                                            </div>
                                                        <div className="space-y-1.5">
                                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Quick Pick</p>
                                                            <div className="flex gap-1.5 flex-wrap">
                                                                {['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#06b6d4', '#84cc16', '#ef4444', '#8b5cf6', '#0ea5e9', '#d946ef'].map((hex) => (
                                                                    <button
                                                                        key={hex}
                                                                        type="button"
                                                                        onClick={() => setCustomColorHex(hex)}
                                                                        className={`h-6 w-6 rounded-full border-2 transition-all hover:scale-125 ${customColorHex === hex ? 'border-foreground scale-110' : 'border-transparent'}`}
                                                                        style={{ backgroundColor: hex }}
                                            />
                                                                ))}
                                        </div>
                                    </div>
                                                        <Button
                                                            size="sm"
                                                            className="w-full"
                                                            onClick={() => {
                                                                const hslStr = hexToHsl(customColorHex);
                                                                const customColor = { name: 'Custom', hsl: hslStr, hslDark: hslStr, ring: hslStr, preview: customColorHex };
                                                                handleAccentChange(customColor);
                                                                localStorage.setItem('sms_customColorHex', customColorHex);
                                                                setCustomPickerOpen(false);
                                                            }}
                                                        >
                                                            <Check className="mr-2 h-4 w-4" /> Apply Color
                                                        </Button>
                                </div>
                                                </PopoverContent>
                                            </Popover>
                            </div>

                                        {/* Live Preview */}
                                        <div className="mt-5 p-4 border rounded-xl bg-muted/20">
                                            <p className="text-[11px] text-muted-foreground mb-3 uppercase tracking-wider font-semibold">Preview</p>
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <Button size="sm">Primary</Button>
                                                <Button size="sm" variant="outline">Outline</Button>
                                                <Button size="sm" variant="secondary">Secondary</Button>
                                                <Badge>Badge</Badge>
                                                <Badge variant="outline">Outline</Badge>
                                                <div className="h-3 w-3 rounded-full bg-primary" />
                                </div>
                            </div>
                                    </CardContent>
                                </Card>

                                {/* Border Radius */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Scan className="h-4 w-4 text-primary" /> Border Radius
                                        </CardTitle>
                                        <CardDescription>Adjust the roundness of UI elements.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-5 gap-3">
                                            {RADIUS_PRESETS.map((preset) => (
                                                <button
                                                    key={preset.name}
                                                    type="button"
                                                    onClick={() => handleRadiusChange(preset.value)}
                                                    className={`flex flex-col items-center gap-2 p-3 border-2 transition-all duration-200 cursor-pointer ${borderRadius === preset.value
                                                        ? 'border-primary bg-primary/5 shadow-md'
                                                        : 'border-muted hover:border-muted-foreground/30 hover:bg-muted/50'
                                                        }`}
                                                    style={{ borderRadius: preset.value }}
                                                >
                                                    <div
                                                        className={`h-7 w-7 border-2 transition-colors ${borderRadius === preset.value ? 'border-primary bg-primary/20' : 'border-muted-foreground/30 bg-muted/50'}`}
                                                        style={{ borderRadius: preset.value }}
                                                    />
                                                    <span className={`text-[11px] font-medium ${borderRadius === preset.value ? 'text-primary' : 'text-muted-foreground'}`}>
                                                        {preset.name}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Font Size */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Type className="h-4 w-4 text-primary" /> Font Size & Density
                                        </CardTitle>
                                        <CardDescription>Adjust text size and UI density.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-4 gap-3">
                                            {FONT_SIZES.map((size) => (
                                                <button
                                                    key={size.name}
                                                    type="button"
                                                    onClick={() => handleFontSizeChange(size.value)}
                                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${fontSize === size.value
                                                        ? 'border-primary bg-primary/5 shadow-md'
                                                        : 'border-muted hover:border-muted-foreground/30 hover:bg-muted/50'
                                                        }`}
                                                >
                                                    <span style={{ fontSize: size.value }} className={`font-bold ${fontSize === size.value ? 'text-primary' : 'text-muted-foreground'}`}>Aa</span>
                                                    <span className={`text-[11px] font-medium ${fontSize === size.value ? 'text-primary' : 'text-muted-foreground'}`}>{size.name}</span>
                                                    <span className="text-[10px] text-muted-foreground">{size.value}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Interface Options */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <SlidersHorizontal className="h-4 w-4 text-primary" /> Interface Options
                                        </CardTitle>
                                        <CardDescription>Fine-tune your interface behavior.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-1">
                                        <NotifRow
                                            icon={Sparkles}
                                            title="Animations"
                                            desc="Enable smooth transitions and micro-animations."
                                            checked={animationsEnabled}
                                            onChange={(v) => { setAnimationsEnabled(v); showToast(`Animations ${v ? 'enabled' : 'disabled'}`, 'success'); }}
                                        />
                                        <Separator className="my-4" />
                                        <NotifRow
                                            icon={PanelLeft}
                                            title="Compact Sidebar"
                                            desc="Use a narrower sidebar with icons only."
                                            checked={sidebarCompact}
                                            onChange={(v) => { setSidebarCompact(v); showToast(`Sidebar: ${v ? 'compact' : 'expanded'}`, 'success'); }}
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        )
                    }

                    {/* ============ REGIONAL ============ */}
                    {
                        activeSection === 'regional' && (
                            <div className="space-y-6">
                                <SectionHeader
                                    title="Regional Preferences"
                                    description="Configure language, date format, timezone, and currency."
                                />

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Locale & Format</CardTitle>
                                        <CardDescription>Set your preferred language and formatting options.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2"><Languages className="h-4 w-4 text-muted-foreground" /> Language</Label>
                                                <Select value={preferences.language} onValueChange={(v) => handlePrefChange('language', v)}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="en">English</SelectItem>
                                                        <SelectItem value="ur">Urdu</SelectItem>
                                                        <SelectItem value="ar">Arabic</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-muted-foreground" /> Date Format</Label>
                                                <Select value={preferences.dateFormat} onValueChange={(v) => handlePrefChange('dateFormat', v)}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /> Timezone</Label>
                                                <Select value={preferences.timezone} onValueChange={(v) => handlePrefChange('timezone', v)}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Asia/Karachi">Asia/Karachi (PKT)</SelectItem>
                                                        <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                                                        <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                                                        <SelectItem value="UTC">UTC</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Currency</Label>
                                                <Select value={preferences.currency} onValueChange={(v) => handlePrefChange('currency', v)}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="PKR">PKR (₨)</SelectItem>
                                                        <SelectItem value="USD">USD ($)</SelectItem>
                                                        <SelectItem value="AED">AED (د.إ)</SelectItem>
                                                        <SelectItem value="SAR">SAR (﷼)</SelectItem>
                                                        <SelectItem value="INR">INR (₹)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Academic & Display</CardTitle>
                                        <CardDescription>Academic year and display preferences.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <Label>Academic Year Starts</Label>
                                                <Select value={preferences.academicYearStart} onValueChange={(v) => handlePrefChange('academicYearStart', v)}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="January">January</SelectItem>
                                                        <SelectItem value="April">April</SelectItem>
                                                        <SelectItem value="July">July</SelectItem>
                                                        <SelectItem value="September">September</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Default List View</Label>
                                                <Select value={preferences.defaultView} onValueChange={(v) => handlePrefChange('defaultView', v)}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="grid">Grid View</SelectItem>
                                                        <SelectItem value="table">Table View</SelectItem>
                                                        <SelectItem value="list">List View</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )
                    }
                </div >
            </div >

            {/* Password Dialog */}
            < Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen} >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>Enter your current password and choose a new one.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Current Password</Label>
                            <div className="relative">
                                <Input
                                    type={showCurrentPass ? 'text' : 'password'}
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                    placeholder="Enter current password"
                                />
                                <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowCurrentPass(!showCurrentPass)}>
                                    {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>New Password</Label>
                            <div className="relative">
                                <Input
                                    type={showNewPass ? 'text' : 'password'}
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                    placeholder="Enter new password"
                                />
                                <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowNewPass(!showNewPass)}>
                                    {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                            {passwordData.newPassword && <PasswordStrength password={passwordData.newPassword} />}
                        </div>
                        <div className="space-y-2">
                            <Label>Confirm New Password</Label>
                            <Input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                placeholder="Confirm new password"
                            />
                            {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                                <p className="text-xs text-destructive">Passwords do not match</p>
                            )}
                </div>
            </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handlePasswordChange} disabled={!passwordData.currentPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}>
                            Update Password
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        </div>
    );
};

// ================================================================
// REUSABLE COMPONENTS
// ================================================================

const SectionHeader = ({ title, description, action }) => (
    <div className="flex items-center justify-between mb-2">
        <div>
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>
        {action}
    </div>
);

const NotifRow = ({ icon: Icon, title, desc, checked, onChange }) => (
    <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
        </div>
        <Switch checked={checked} onCheckedChange={onChange} />
    </div>
);

const ThemeCard = ({ icon: Icon, label, active, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex flex-col items-center gap-2.5 p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${active
            ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
            : 'border-muted hover:border-muted-foreground/30 hover:bg-muted/50'
            }`}
    >
        <Icon className={`h-6 w-6 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
        <span className={`text-sm font-medium ${active ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
        {active && <Badge variant="default" className="text-[10px] h-5">Active</Badge>}
    </button>
);

const StatusIndicator = ({ status }) => {
    switch (status) {
        case 'connected': return <p className="text-xs font-semibold text-green-600">Connected</p>;
        case 'disconnected': return <p className="text-xs font-semibold text-destructive">Disconnected</p>;
        case 'connecting': return <p className="text-xs font-semibold text-primary animate-pulse">Connecting...</p>;
        case 'testing': return <p className="text-xs font-semibold text-primary animate-pulse">Testing...</p>;
        case 'qr': return <p className="text-xs font-semibold text-blue-600">Scan QR Code</p>;
        default: return <p className="text-xs font-semibold text-muted-foreground">Unknown</p>;
    }
};

const PasswordStrength = ({ password }) => {
    const getStrength = (pwd) => {
        let s = 0;
        if (pwd.length >= 6) s++;
        if (pwd.length >= 10) s++;
        if (/[A-Z]/.test(pwd)) s++;
        if (/[0-9]/.test(pwd)) s++;
        if (/[^A-Za-z0-9]/.test(pwd)) s++;
        return s;
    };
    const strength = getStrength(password);
    const levels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500'];
    const level = Math.min(strength, 4);

    return (
        <div className="space-y-1 mt-2">
            <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= level ? colors[level] : 'bg-muted'}`} />
                ))}
            </div>
            <p className={`text-[11px] font-medium ${level <= 1 ? 'text-red-500' : level <= 2 ? 'text-yellow-500' : 'text-green-500'}`}>
                {levels[level]}
            </p>
        </div>
    );
};

export default SettingsProfile;