import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SearchBar from '../components/SearchBar';
import { 
    Cake, Send, Gift, Calendar, Users, CheckCircle2, 
    MessageCircle, ChevronDown, PartyPopper, Star
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL;

const BirthdayWish = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    
    // State Management
    const [students, setStudents] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    
    // Filter State
    const [dateFilter, setDateFilter] = useState('today'); // 'today', 'week', 'month'
    const [searchQuery, setSearchQuery] = useState('');
    
    // Message State
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [customMessage, setCustomMessage] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    // Stats
    const [stats, setStats] = useState({
        today: 0,
        thisWeek: 0,
        thisMonth: 0
    });

    // Fetch Data
    const fetchData = async () => {
        try {
            setLoading(true);
            const schoolId = currentUser._id;
            
            // Fetch students
            const studentsRes = await axios.get(`${API_BASE}/students/${schoolId}`);
            const allStudents = Array.isArray(studentsRes.data) ? studentsRes.data : [];
            
            // Filter students with birthdays
            const today = new Date();
            const todayMonth = today.getMonth();
            const todayDate = today.getDate();
            
            const birthdayStudents = allStudents.filter(student => {
                if (!student.dateOfBirth) return false;
                const dob = new Date(student.dateOfBirth);
                return dob.getMonth() === todayMonth && dob.getDate() === todayDate;
            });
            
            // Week birthdays
            const weekEnd = new Date(today);
            weekEnd.setDate(weekEnd.getDate() + 7);
            
            const weekBirthdays = allStudents.filter(student => {
                if (!student.dateOfBirth) return false;
                const dob = new Date(student.dateOfBirth);
                const thisYearBday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
                return thisYearBday >= today && thisYearBday <= weekEnd;
            });
            
            // Month birthdays
            const monthBirthdays = allStudents.filter(student => {
                if (!student.dateOfBirth) return false;
                const dob = new Date(student.dateOfBirth);
                return dob.getMonth() === todayMonth;
            });
            
            setStudents(allStudents);
            setStats({
                today: birthdayStudents.length,
                thisWeek: weekBirthdays.length,
                thisMonth: monthBirthdays.length
            });
            
            // Fetch templates
            const templatesRes = await axios.get(`${API_BASE}/MessageTemplates/${schoolId}`);
            setTemplates(Array.isArray(templatesRes.data) ? templatesRes.data : []);
            
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser) fetchData();
    }, [currentUser]);

    // Get filtered birthday students
    const getFilteredStudents = () => {
        const today = new Date();
        const todayMonth = today.getMonth();
        const todayDate = today.getDate();
        
        return students.filter(student => {
            if (!student.dateOfBirth) return false;
            const dob = new Date(student.dateOfBirth);
            
            // Date filter
            let matchesDate = false;
            if (dateFilter === 'today') {
                matchesDate = dob.getMonth() === todayMonth && dob.getDate() === todayDate;
            } else if (dateFilter === 'week') {
                const weekEnd = new Date(today);
                weekEnd.setDate(weekEnd.getDate() + 7);
                const thisYearBday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
                matchesDate = thisYearBday >= today && thisYearBday <= weekEnd;
            } else if (dateFilter === 'month') {
                matchesDate = dob.getMonth() === todayMonth;
            }
            
            // Search filter
            const matchesSearch = !searchQuery || 
                student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.fatherName?.toLowerCase().includes(searchQuery.toLowerCase());
            
            return matchesDate && matchesSearch;
        });
    };

    const filteredStudents = getFilteredStudents();

    // Handle Select All
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(filteredStudents.map(s => s._id));
        }
        setSelectAll(!selectAll);
    };

    // Handle Individual Selection
    const handleStudentSelect = (studentId) => {
        if (selectedStudents.includes(studentId)) {
            setSelectedStudents(selectedStudents.filter(id => id !== studentId));
        } else {
            setSelectedStudents([...selectedStudents, studentId]);
        }
    };

    // Calculate age
    const calculateAge = (dateOfBirth) => {
        const today = new Date();
        const dob = new Date(dateOfBirth);
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        return age + 1; // Next birthday age
    };

    // Send Birthday Wishes
    const handleSendWishes = async () => {
        if (selectedStudents.length === 0) {
            showToast('Please select at least one student!', 'error');
            return;
        }
        
        const message = selectedTemplate 
            ? templates.find(t => t._id === selectedTemplate)?.content 
            : customMessage;
            
        if (!message || message.trim() === '') {
            showToast('Message is required!', 'error');
            return;
        }

        try {
            setSending(true);
            
            await axios.post(`${API_BASE}/SendBirthdayWishes`, {
                school: currentUser._id,
                studentIds: selectedStudents,
                message: message,
                templateId: selectedTemplate || null
            });
            
            showToast(`Birthday wishes sent to ${selectedStudents.length} students!`, 'success');
            setSelectedStudents([]);
            setSelectAll(false);
            setCustomMessage('');
            setSelectedTemplate('');
            
        } catch (err) {
            showToast('Error sending birthday wishes!', 'error');
        } finally {
            setSending(false);
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

    // Format date for display
    const formatBirthday = (dateOfBirth) => {
        const dob = new Date(dateOfBirth);
        return dob.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6 md:p-8">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                        <Cake className="w-10 h-10 text-pink-500" />
                        Birthday Wishes
                    </h1>
                    <p className="text-gray-600 mt-2">Send birthday greetings to your students</p>
                </div>
                <button 
                    onClick={handleSendWishes}
                    disabled={sending || selectedStudents.length === 0}
                    className="flex items-center px-6 py-3 bg-linear-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition duration-200 font-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {sending ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                            Sending...
                        </>
                    ) : (
                        <>
                            <Gift className="w-5 h-5 mr-2" />
                            Send Wishes ({selectedStudents.length})
                        </>
                    )}
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div 
                    onClick={() => setDateFilter('today')}
                    className={`bg-white rounded-xl shadow-lg p-6 border-2 cursor-pointer transition ${
                        dateFilter === 'today' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-300'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-500">Today's Birthdays</p>
                            <p className="text-3xl font-bold text-pink-600 mt-1">{stats.today}</p>
                        </div>
                        <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                            <PartyPopper className="w-6 h-6 text-pink-600" />
                        </div>
                    </div>
                </div>
                
                <div 
                    onClick={() => setDateFilter('week')}
                    className={`bg-white rounded-xl shadow-lg p-6 border-2 cursor-pointer transition ${
                        dateFilter === 'week' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-500">This Week</p>
                            <p className="text-3xl font-bold text-purple-600 mt-1">{stats.thisWeek}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
                
                <div 
                    onClick={() => setDateFilter('month')}
                    className={`bg-white rounded-xl shadow-lg p-6 border-2 cursor-pointer transition ${
                        dateFilter === 'month' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-500">This Month</p>
                            <p className="text-3xl font-bold text-indigo-600 mt-1">{stats.thisMonth}</p>
                        </div>
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <Star className="w-6 h-6 text-indigo-600" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Side - Birthday Students */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                        
                        {/* Search */}
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <SearchBar 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by student name..."
                            />
                        </div>

                        {/* Select All Header */}
                        <div className="px-6 py-3 bg-pink-50 border-b border-pink-100 flex items-center">
                            <input
                                type="checkbox"
                                checked={selectAll}
                                onChange={handleSelectAll}
                                className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                            />
                            <span className="ml-3 font-500 text-gray-700">
                                Select All ({filteredStudents.length} birthdays)
                            </span>
                        </div>

                        {/* Student List */}
                        <div className="max-h-[500px] overflow-y-auto">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
                                </div>
                            ) : filteredStudents.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <Cake className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-600 text-lg font-500">No birthdays found</p>
                                    <p className="text-gray-500 text-sm mt-1">
                                        {dateFilter === 'today' && 'No students have birthday today'}
                                        {dateFilter === 'week' && 'No birthdays this week'}
                                        {dateFilter === 'month' && 'No birthdays this month'}
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {filteredStudents.map(student => (
                                        <div 
                                            key={student._id}
                                            className={`flex items-center px-6 py-4 hover:bg-pink-50 cursor-pointer transition ${
                                                selectedStudents.includes(student._id) ? 'bg-pink-50' : ''
                                            }`}
                                            onClick={() => handleStudentSelect(student._id)}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedStudents.includes(student._id)}
                                                onChange={() => handleStudentSelect(student._id)}
                                                className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <div className="ml-4 flex-1">
                                                <p className="font-600 text-gray-900 flex items-center gap-2">
                                                    {student.name}
                                                    {new Date(student.dateOfBirth).getMonth() === new Date().getMonth() && 
                                                     new Date(student.dateOfBirth).getDate() === new Date().getDate() && (
                                                        <span className="bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full">
                                                            Today! 🎂
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {student.class?.className} | Father: {student.fatherName}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-600 text-pink-600">
                                                    {formatBirthday(student.dateOfBirth)}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Turning {calculateAge(student.dateOfBirth)}
                                                </p>
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
                            <MessageCircle className="w-5 h-5 text-pink-600" />
                            Compose Birthday Message
                        </h3>

                        {/* Template Selection */}
                        <div className="mb-4">
                            <label className="block text-sm font-600 text-gray-700 mb-2">
                                Select Template (Optional)
                            </label>
                            <select
                                value={selectedTemplate}
                                onChange={(e) => handleTemplateSelect(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            >
                                <option value="">-- Custom Message --</option>
                                {templates.filter(t => t.category === 'other' || t.category === 'general').map(template => (
                                    <option key={template._id} value={template._id}>
                                        {template.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Message Text Area */}
                        <div className="mb-4">
                            <label className="block text-sm font-600 text-gray-700 mb-2">
                                Birthday Message
                            </label>
                            <textarea
                                value={customMessage}
                                onChange={(e) => setCustomMessage(e.target.value)}
                                placeholder="Write your birthday message here... Use {{name}} for student name, {{age}} for age"
                                rows={6}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {customMessage.length} characters
                            </p>
                        </div>

                        {/* Dynamic Tags Info */}
                        <div className="mb-4 p-3 bg-pink-50 rounded-lg">
                            <p className="text-sm font-600 text-pink-700 mb-2">Available Tags:</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="bg-white px-2 py-1 rounded text-xs font-mono text-pink-600">{'{{name}}'}</span>
                                <span className="bg-white px-2 py-1 rounded text-xs font-mono text-pink-600">{'{{age}}'}</span>
                                <span className="bg-white px-2 py-1 rounded text-xs font-mono text-pink-600">{'{{class}}'}</span>
                                <span className="bg-white px-2 py-1 rounded text-xs font-mono text-pink-600">{'{{father}}'}</span>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Selected Students</span>
                                <span className="font-600 text-gray-900">{selectedStudents.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Message Length</span>
                                <span className="font-600 text-gray-900">{customMessage.length} chars</span>
                            </div>
                        </div>

                        {/* Send Button */}
                        <button
                            onClick={handleSendWishes}
                            disabled={sending || selectedStudents.length === 0 || !customMessage}
                            className="w-full flex items-center justify-center px-6 py-3 bg-linear-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 shadow-lg transition duration-200 font-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {sending ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Gift className="w-5 h-5 mr-2" />
                                    Send Birthday Wishes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BirthdayWish;
