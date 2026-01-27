import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SearchBar from '../components/SearchBar';
import { Send, Users, MessageCircle, CheckCircle2, Clock, Filter, ChevronDown, GraduationCap, Briefcase, Mail, MessageSquare } from 'lucide-react';

const API_BASE = "http://localhost:5000";

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
    const [contentSource, setContentSource] = useState('custom'); // 'custom' or 'template' (renamed from messageType)
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

    // Handle Select All
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedRecipients([]);
        } else {
            setSelectedRecipients(filteredRecipients.map(r => r._id));
        }
        setSelectAll(!selectAll);
    };

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

    // Update select all state when filtered recipients change
    useEffect(() => {
        if (filteredRecipients.length > 0 && selectedRecipients.length === filteredRecipients.length) {
            setSelectAll(true);
        } else {
            setSelectAll(false);
        }
    }, [selectedRecipients, filteredRecipients]);

    // Clear selection when switching tabs
    useEffect(() => {
        setSelectedRecipients([]);
        setSelectAll(false);
        setSearchQuery('');
        setClassFilter('');
        setDesignationFilter('');
    }, [recipientGroup]);

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6 md:p-8">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">Send Messages</h1>
                    <p className="text-gray-600 mt-2">Send SMS/WhatsApp messages to students</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        <span className="font-600">{selectedRecipients.length} Selected</span>
                    </div>
                    <button 
                        onClick={handleSendMessages}
                        disabled={sending || selectedRecipients.length === 0}
                        className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg hover:shadow-xl transition duration-200 font-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sending ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5 mr-2" />
                                Send Message
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Side - Student Selection */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                        
                        {/* Tabs */}
                        <div className="flex border-b border-gray-200">
                            <button
                                onClick={() => setRecipientGroup('student')}
                                className={`flex-1 py-4 text-center font-600 transition ${
                                    recipientGroup === 'student'
                                        ? 'text-indigo-600 border-b-2 border-indigo-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <GraduationCap className="w-5 h-5" />
                                    Students
                                </div>
                            </button>
                            <button
                                onClick={() => setRecipientGroup('staff')}
                                className={`flex-1 py-4 text-center font-600 transition ${
                                    recipientGroup === 'staff'
                                        ? 'text-indigo-600 border-b-2 border-indigo-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Briefcase className="w-5 h-5" />
                                    Staff
                                </div>
                            </button>
                        </div>
                        
                        {/* Filters */}
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <SearchBar 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={`Search ${recipientGroup}...`}
                                    />
                                </div>
                                <div className="relative">
                                    {recipientGroup === 'student' ? (
                                        <select
                                            value={classFilter}
                                            onChange={(e) => setClassFilter(e.target.value)}
                                            className="appearance-none px-4 py-2.5 pr-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full md:w-auto"
                                        >
                                            <option value="">All Classes</option>
                                            {classes.map(cls => (
                                                <option key={cls._id} value={cls._id}>{cls.className}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <select
                                            value={designationFilter}
                                            onChange={(e) => setDesignationFilter(e.target.value)}
                                            className="appearance-none px-4 py-2.5 pr-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full md:w-auto"
                                        >
                                            <option value="">All Designations</option>
                                            {designations.map(des => (
                                                <option key={des._id} value={des._id}>{des.name}</option>
                                            ))}
                                        </select>
                                    )}
                                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Select All Header */}
                        <div className="px-6 py-3 bg-indigo-50 border-b border-indigo-100 flex items-center">
                            <input
                                type="checkbox"
                                checked={selectAll}
                                onChange={handleSelectAll}
                                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                            />
                            <span className="ml-3 font-500 text-gray-700">
                                Select All ({filteredRecipients.length} {recipientGroup}s)
                            </span>
                        </div>

                        {/* Recipient List */}
                        <div className="max-h-[500px] overflow-y-auto">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                                </div>
                            ) : filteredRecipients.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <Users className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-600 text-lg font-500">No {recipientGroup}s found</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {filteredRecipients.map(recipient => (
                                        <div 
                                            key={recipient._id}
                                            className={`flex items-center px-6 py-4 hover:bg-gray-50 cursor-pointer transition ${
                                                selectedRecipients.includes(recipient._id) ? 'bg-indigo-50' : ''
                                            }`}
                                            onClick={() => handleRecipientSelect(recipient._id)}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedRecipients.includes(recipient._id)}
                                                onChange={() => handleRecipientSelect(recipient._id)}
                                                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <div className="ml-4 flex-1">
                                                <p className="font-600 text-gray-900">{recipient.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {recipientGroup === 'student' 
                                                        ? `${recipient.class?.className} | Father: ${recipient.fatherName}`
                                                        : `${recipient.designation?.name || recipient.role} | ${recipient.phone}`
                                                    }
                                                </p>
                                            </div>
                                            <div className="text-right hidden sm:block">
                                                <p className="text-sm font-500 text-gray-700">{recipient.phone}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side - Message Composition */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-indigo-600" />
                            Compose Message
                        </h3>

                        {/* Delivery Channel Selector */}
                        <div className="mb-6">
                            <label className="block text-sm font-600 text-gray-700 mb-2">
                                Send Via
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setDeliveryChannel('whatsapp')}
                                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-600 transition border ${
                                        deliveryChannel === 'whatsapp'
                                            ? 'bg-green-50 border-green-200 text-green-700 ring-2 ring-green-500 ring-offset-1'
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    WhatsApp
                                </button>
                                <button
                                    onClick={() => setDeliveryChannel('email')}
                                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-600 transition border ${
                                        deliveryChannel === 'email'
                                            ? 'bg-blue-50 border-blue-200 text-blue-700 ring-2 ring-blue-500 ring-offset-1'
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <Mail className="w-4 h-4" />
                                    Email
                                </button>
                            </div>
                        </div>

                        {/* Content Source Toggle */}
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setContentSource('custom')}
                                className={`flex-1 py-1.5 px-3 text-sm rounded-lg font-500 transition ${
                                    contentSource === 'custom'
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Custom Message
                            </button>
                            <button
                                onClick={() => setContentSource('template')}
                                className={`flex-1 py-1.5 px-3 text-sm rounded-lg font-500 transition ${
                                    contentSource === 'template'
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Use Template
                            </button>
                        </div>

                        {/* Template Selection */}
                        {contentSource === 'template' && (
                            <div className="mb-4">
                                <label className="block text-sm font-600 text-gray-700 mb-2">
                                    Select Template
                                </label>
                                <select
                                    value={selectedTemplate}
                                    onChange={(e) => handleTemplateSelect(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">-- Select Template --</option>
                                    {templates.map(template => (
                                        <option key={template._id} value={template._id}>
                                            {template.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Message Text Area */}
                        <div className="mb-4">
                            <label className="block text-sm font-600 text-gray-700 mb-2">
                                Message
                            </label>
                            <textarea
                                value={customMessage}
                                onChange={(e) => setCustomMessage(e.target.value)}
                                placeholder="Write your message here..."
                                rows={6}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                disabled={contentSource === 'template' && selectedTemplate}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {customMessage.length} characters
                            </p>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Recipients</span>
                                <span className="font-600 text-gray-900">{selectedRecipients.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Message Length</span>
                                <span className="font-600 text-gray-900">{customMessage.length} chars</span>
                            </div>
                        </div>

                        {/* Send Button */}
                        <button
                            onClick={handleSendMessages}
                            disabled={sending || selectedRecipients.length === 0 || !customMessage}
                            className="w-full flex items-center justify-center px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-lg transition duration-200 font-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {sending ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    {deliveryChannel === 'email' ? <Mail className="w-5 h-5 mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                                    Send via {deliveryChannel === 'email' ? 'Email' : 'WhatsApp'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SendMessages;
