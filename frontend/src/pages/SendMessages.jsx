import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Send, Users, MessageCircle, CheckCircle2, Clock, Filter, ChevronDown, GraduationCap, Briefcase, Mail, MessageSquare, Search, CheckSquare, Square, Info } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL;

const SendMessages = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    
    // State Management
    const [students, setStudents] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    
    // Form State
    const [recipientGroup, setRecipientGroup] = useState('student'); // 'student' or 'staff'
    const [selectedRecipients, setSelectedRecipients] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [contentSource, setContentSource] = useState('custom'); // 'custom' or 'template'
    const [deliveryChannel, setDeliveryChannel] = useState('whatsapp'); // 'whatsapp' or 'email'
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [customMessage, setCustomMessage] = useState('');
    
    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [classFilter, setClassFilter] = useState('');
    const [designationFilter, setDesignationFilter] = useState('');
    const [classes, setClasses] = useState([]);
    const [designations, setDesignations] = useState([]);

    // Fetch Data
    const fetchData = async () => {
        try {
            setLoading(true);
            const schoolId = currentUser._id;
            
            // Fetch students
            const studentsRes = await axios.get(`${API_BASE}/students/${schoolId}`);
            setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
            
            // Fetch staff
            const staffRes = await axios.get(`${API_BASE}/Staff/${schoolId}`);
            setStaffList(staffRes.data.staff || []);
            
            // Fetch templates
            const templatesRes = await axios.get(`${API_BASE}/MessageTemplates/${schoolId}`);
            setTemplates(Array.isArray(templatesRes.data) ? templatesRes.data : []);
            
            // Fetch classes
            const classesRes = await axios.get(`${API_BASE}/showClasses/${schoolId}`);
            setClasses(Array.isArray(classesRes.data) ? classesRes.data : []);
            
            // Fetch designations
            const designationsRes = await axios.get(`${API_BASE}/Designations/${schoolId}`);
            setDesignations(Array.isArray(designationsRes.data) ? designationsRes.data : []);
            
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser) fetchData();
    }, [currentUser]);

    // Filter Recipients
    const filteredRecipients = recipientGroup === 'student'
        ? students.filter(student => {
            const matchesSearch = !searchQuery ||
                student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.fatherName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.phone?.includes(searchQuery);

            const matchesClass = !classFilter || student.class?._id === classFilter;

            return matchesSearch && matchesClass;
        })
        : staffList.filter(staff => {
            const matchesSearch = !searchQuery ||
                staff.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                staff.phone?.includes(searchQuery);

            const matchesDesignation = !designationFilter || staff.designation?._id === designationFilter;

            return matchesSearch && matchesDesignation;
        });

    // Handle Select All
    const handleSelectAll = (checked) => {
        setSelectAll(checked);
        if (checked) {
            setSelectedRecipients(filteredRecipients.map(r => r._id));
        } else {
            setSelectedRecipients([]);
        }
    };

    // Update select all state when filtered recipients change
    useEffect(() => {
        if (filteredRecipients.length > 0 && selectedRecipients.length === filteredRecipients.length) {
            setSelectAll(true);
        } else {
            setSelectAll(false);
        }
    }, [selectedRecipients, filteredRecipients]);

    // Handle Individual Selection
    const handleRecipientSelect = (id) => {
        if (selectedRecipients.includes(id)) {
            setSelectedRecipients(selectedRecipients.filter(rid => rid !== id));
        } else {
            setSelectedRecipients([...selectedRecipients, id]);
        }
    };

    // Handle Template Selection
    const handleTemplateSelect = (templateId) => {
        setSelectedTemplate(templateId);
        const template = templates.find(t => t._id === templateId);
        if (template) {
            setCustomMessage(template.content);
        }
    };

    // Send Messages
    const handleSendMessages = async () => {
        if (selectedRecipients.length === 0) {
            showToast('Please select at least one recipient first!', 'error');
            return;
        }
        
        const message = contentSource === 'template' 
            ? templates.find(t => t._id === selectedTemplate)?.content 
            : customMessage;
            
        if (!message || message.trim() === '') {
            showToast('Message is required!', 'error');
            return;
        }

        try {
            setSending(true);
            
            await axios.post(`${API_BASE}/SendMessages`, {
                school: currentUser._id,
                recipientIds: selectedRecipients,
                recipientGroup: recipientGroup,
                message: message,
                messageType: deliveryChannel, // Send 'whatsapp' or 'email'
                templateId: selectedTemplate || null
            });
            
            showToast(`Message sent to ${selectedRecipients.length} recipients via ${deliveryChannel}!`, 'success');
            setSelectedRecipients([]);
            setSelectAll(false);
            setCustomMessage('');
            setSelectedTemplate('');
            
        } catch (err) {
            showToast('Error sending message!', 'error');
        } finally {
            setSending(false);
        }
    };

    // Clear selection when switching tabs
    useEffect(() => {
        setSelectedRecipients([]);
        setSelectAll(false);
        setSearchQuery('');
        setClassFilter('');
        setDesignationFilter('');
    }, [recipientGroup]);

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 space-y-8">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Broadcast Messages</h1>
                    <p className="text-slate-500 mt-1">Send campaigns via WhatsApp or Email to students and staff.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md text-sm font-medium border border-slate-200">
                        {selectedRecipients.length} Selected
                    </span>
                    <button 
                        onClick={handleSendMessages}
                        disabled={sending || selectedRecipients.length === 0}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-10 px-4 py-2 shadow-sm"
                    >
                        {sending ? (
                            <>
                                <Info className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Campaign
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Side - List (8/12) */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                    {/* Filter Bar */}
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                            {/* Tabs */}
                            <div className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500 w-full sm:w-auto">
                                <button
                                    onClick={() => setRecipientGroup('student')}
                                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${recipientGroup === 'student' ? 'bg-white text-slate-950 shadow-sm' : ''
                                        }`}
                                >
                                    <GraduationCap className="w-4 h-4 mr-2" />
                                    Students
                                </button>
                                <button
                                    onClick={() => setRecipientGroup('staff')}
                                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${recipientGroup === 'staff' ? 'bg-white text-slate-950 shadow-sm' : ''
                                        }`}
                                >
                                    <Briefcase className="w-4 h-4 mr-2" />
                                    Staff
                                </button>
                            </div>

                            {/* Search & Select */}
                            <div className="flex items-center gap-2 flex-1 sm:justify-end">
                                <div className="relative flex-1 sm:flex-initial sm:w-[280px]">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="Search name or phone..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 pl-9"
                                    />
                                </div>
                                {recipientGroup === 'student' ? (
                                    <select
                                        value={classFilter}
                                        onChange={(e) => setClassFilter(e.target.value)}
                                        className="flex h-9 items-center justify-between whitespace-nowrap rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 w-32"
                                    >
                                        <option value="">All Classes</option>
                                        {classes.map(cls => (
                                            <option key={cls._id} value={cls._id}>{cls.sclassName}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <select
                                        value={designationFilter}
                                        onChange={(e) => setDesignationFilter(e.target.value)}
                                            className="flex h-9 items-center justify-between whitespace-nowrap rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 w-32"
                                        >
                                            <option value="">All Roles</option>
                                            {designations.map(des => (
                                                <option key={des._id} value={des._id}>{des.title}</option>
                                            ))}
                                    </select>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Data List */}
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                        {/* Table Header */}
                        <div className="flex items-center px-6 py-3 border-b border-slate-200 bg-slate-50/50">
                            <button
                                onClick={() => handleSelectAll(!selectAll)}
                                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                            >
                                {selectAll ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4" />}
                                <span>Select All ({filteredRecipients.length})</span>
                            </button>
                        </div>

                        {/* Valid Content */}
                        <div className="flex-1 overflow-auto max-h-[500px]">
                            {loading ? (
                                <div className="h-full flex flex-col items-center justify-center p-8 text-slate-500">
                                    <Info className="w-8 h-8 animate-spin mb-2" />
                                    Loading...
                                </div>
                            ) : filteredRecipients.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center p-8 text-slate-500">
                                        <Users className="w-12 h-12 mb-3 opacity-20" />
                                        <p>No recipients found matching your filter.</p>
                                </div>
                            ) : (
                                        <div className="divide-y divide-slate-100">
                                            {filteredRecipients.map((recipient) => {
                                                const isSelected = selectedRecipients.includes(recipient._id);
                                                return (
                                                    <div
                                                        key={recipient._id}
                                                        onClick={() => handleRecipientSelect(recipient._id)}
                                                        className={`flex items-center px-6 py-3 hover:bg-slate-50/80 cursor-pointer transition-colors ${isSelected ? 'bg-slate-50' : ''
                                                            }`}
                                                    >
                                                        <div className={`mr-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`}>
                                                            {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-sm font-medium text-slate-900 truncate">{recipient.name}</p>
                                                                <p className="text-xs text-slate-500 font-mono">{recipient.phone}</p>
                                                            </div>
                                                            <p className="text-xs text-slate-500 truncate mt-0.5">
                                                                {recipientGroup === 'student' 
                                                                    ? `Class: ${recipient.sclassName?.sclassName || '-'} • Father: ${recipient.fatherName || '-'}`
                                                                    : `${recipient.designation?.title || recipient.role || 'Staff'}`
                                                                }
                                                            </p>
                                                        </div>
                                            </div>
                                                );
                                            })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side - Composer (4/12) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 sticky top-6">
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                                <MessageSquare className="w-4 h-4 text-slate-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-slate-900">Compose</h2>
                        </div>

                        {/* Channel Selector */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setDeliveryChannel('whatsapp')}
                                    className={`relative flex items-center justify-center gap-2 rounded-lg border px-4 py-3 shadow-sm outline-none transition-all focus-visible:ring-2 focus-visible:ring-offset-2 ${
                                        deliveryChannel === 'whatsapp'
                                        ? 'border-green-600 bg-green-50 text-green-700 ring-green-600 ring-offset-green-50'
                                        : 'border-slate-200 bg-transparent text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    <span className="text-sm font-medium">WhatsApp</span>
                                </button>
                                <button
                                    onClick={() => setDeliveryChannel('email')}
                                    className={`relative flex items-center justify-center gap-2 rounded-lg border px-4 py-3 shadow-sm outline-none transition-all focus-visible:ring-2 focus-visible:ring-offset-2 ${
                                        deliveryChannel === 'email'
                                        ? 'border-blue-600 bg-blue-50 text-blue-700 ring-blue-600 ring-offset-blue-50'
                                        : 'border-slate-200 bg-transparent text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    <Mail className="w-4 h-4" />
                                    <span className="text-sm font-medium">Email</span>
                                </button>
                            </div>

                            {/* Template vs Custom Switch */}
                            <div className="flex rounded-lg border border-slate-200 p-1 bg-slate-50/50">
                                <button
                                    onClick={() => setContentSource('custom')}
                                    className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${contentSource === 'custom'
                                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                                        : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                >
                                    Custom Message
                                </button>
                                <button
                                    onClick={() => setContentSource('template')}
                                    className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${contentSource === 'template'
                                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                                        : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                >
                                    Use Template
                                </button>
                            </div>

                            {/* Template Select */}
                            {contentSource === 'template' && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-500">Select Template</label>
                                    <select
                                        value={selectedTemplate}
                                        onChange={(e) => handleTemplateSelect(e.target.value)}
                                        className="flex h-9 w-full items-center justify-between rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">-- Choose a template --</option>
                                        {templates.map(t => (
                                            <option key={t._id} value={t._id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Text Area */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-500">Message Content</label>
                                <textarea
                                    value={customMessage}
                                    onChange={(e) => setCustomMessage(e.target.value)}
                                    placeholder="Type your message here..."
                                    className="flex min-h-[160px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                                    disabled={contentSource === 'template' && selectedTemplate}
                                />
                                <div className="flex justify-end">
                                    <span className="text-[10px] text-slate-400">{customMessage.length} chars</span>
                                </div>
                            </div>
                        </div>

                        {/* Summary Block */}
                        <div className="mt-6 rounded-lg bg-slate-50 border border-slate-100 p-4">
                            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Campaign Summary</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Recipients</span>
                                    <span className="font-medium text-slate-900">{selectedRecipients.length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Channel</span>
                                    <span className="font-medium capitalize text-slate-900">{deliveryChannel}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Est. Time</span>
                                    <span className="font-medium text-slate-900">~{Math.ceil(selectedRecipients.length * 0.5) || 1}s</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SendMessages;
