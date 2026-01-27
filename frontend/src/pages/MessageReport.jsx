import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SearchBar from '../components/SearchBar';
import { 
    MessageCircle, Send, CheckCircle2, XCircle, Clock, 
    TrendingUp, Users, Filter, ChevronDown, Eye, Calendar
} from 'lucide-react';

const API_BASE = "http://localhost:5000";

const MessageReport = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    
    // State Management
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('all'); // 'today', 'week', 'month', 'all'
    
    // Stats
    const [stats, setStats] = useState({
        total: 0,
        sent: 0,
        delivered: 0,
        failed: 0
    });

    // Detail Modal
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Fetch Messages
    const fetchMessages = async () => {
        try {
            setLoading(true);
            const schoolId = currentUser._id;
            const response = await axios.get(`${API_BASE}/MessageReports/${schoolId}`);
            const data = Array.isArray(response.data) ? response.data : [];
            setMessages(data);
            
            // Calculate stats
            setStats({
                total: data.length,
                sent: data.filter(m => m.status === 'sent').length,
                delivered: data.filter(m => m.status === 'delivered').length,
                failed: data.filter(m => m.status === 'failed').length
            });
        } catch (err) {
            console.error('Error fetching messages:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser) fetchMessages();
    }, [currentUser]);

    // Filter Messages
    const filteredMessages = messages.filter(message => {
        // Search Filter
        const matchesSearch = !searchQuery || 
            message.recipient?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            message.recipient?.phone?.includes(searchQuery) ||
            message.content?.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Status Filter
        const matchesStatus = !statusFilter || message.status === statusFilter;
        
        // Date Filter
        let matchesDate = true;
        if (dateFilter !== 'all') {
            const messageDate = new Date(message.createdAt);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (dateFilter === 'today') {
                matchesDate = messageDate >= today;
            } else if (dateFilter === 'week') {
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                matchesDate = messageDate >= weekAgo;
            } else if (dateFilter === 'month') {
                const monthAgo = new Date(today);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                matchesDate = messageDate >= monthAgo;
            }
        }
        
        return matchesSearch && matchesStatus && matchesDate;
    });

    // Status Badge
    const getStatusBadge = (status) => {
        const badges = {
            sent: { icon: Send, color: 'bg-blue-100 text-blue-700', label: 'Sent' },
            delivered: { icon: CheckCircle2, color: 'bg-green-100 text-green-700', label: 'Delivered' },
            failed: { icon: XCircle, color: 'bg-red-100 text-red-700', label: 'Failed' },
            pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-700', label: 'Pending' }
        };
        const badge = badges[status] || badges.pending;
        const Icon = badge.icon;
        
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-600 ${badge.color}`}>
                <Icon className="w-3.5 h-3.5" />
                {badge.label}
            </span>
        );
    };

    // View Message Detail
    const viewDetails = (message) => {
        setSelectedMessage(message);
        setIsDetailOpen(true);
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6 md:p-8">
            
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900">Message Reports</h1>
                <p className="text-gray-600 mt-2">View reports of sent messages</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-500">Total Messages</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <MessageCircle className="w-6 h-6 text-indigo-600" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-500">Sent</p>
                            <p className="text-3xl font-bold text-blue-600 mt-1">{stats.sent}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Send className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-500">Delivered</p>
                            <p className="text-3xl font-bold text-green-600 mt-1">{stats.delivered}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-500">Failed</p>
                            <p className="text-3xl font-bold text-red-600 mt-1">{stats.failed}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <XCircle className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <SearchBar 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by recipient name, phone or message..."
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none px-4 py-2.5 pr-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Status</option>
                                <option value="sent">Sent</option>
                                <option value="delivered">Delivered</option>
                                <option value="failed">Failed</option>
                                <option value="pending">Pending</option>
                            </select>
                            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                        <div className="relative">
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="appearance-none px-4 py-2.5 pr-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">Last 7 Days</option>
                                <option value="month">Last 30 Days</option>
                            </select>
                            <Calendar className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                            <p className="text-gray-600">Loading messages...</p>
                        </div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <MessageCircle className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600 text-lg font-500">No messages sent yet</p>
                        <p className="text-gray-500 text-sm mt-1">Send messages from the Send Messages page</p>
                    </div>
                ) : filteredMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Filter className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600 text-lg font-500">No messages found</p>
                        <p className="text-gray-500 text-sm mt-1">Try changing your filters</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-linear-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Recipient</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Message</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date & Time</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredMessages.map((message) => (
                                    <tr key={message._id} className="hover:bg-indigo-50 transition duration-150">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-600 text-gray-900">{message.recipient?.name || 'Unknown'}</p>
                                                <p className="text-sm text-gray-500">{message.recipient?.phone || '-'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 max-w-xs truncate">
                                                {message.content || '-'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(message.status)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div>{new Date(message.createdAt).toLocaleDateString()}</div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(message.createdAt).toLocaleTimeString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => viewDetails(message)}
                                                className="inline-flex items-center justify-center w-9 h-9 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition duration-150"
                                                title="View details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {isDetailOpen && selectedMessage && (
                <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-linear-to-r from-indigo-600 to-purple-600 rounded-t-2xl">
                            <h3 className="text-xl font-bold text-white">Message Details</h3>
                            <button
                                onClick={() => setIsDetailOpen(false)}
                                className="text-white/80 hover:text-white transition"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-500 text-gray-500">Status</span>
                                {getStatusBadge(selectedMessage.status)}
                            </div>
                            
                            <div>
                                <span className="text-sm font-500 text-gray-500">Recipient</span>
                                <p className="font-600 text-gray-900 mt-1">{selectedMessage.recipient?.name}</p>
                                <p className="text-sm text-gray-600">{selectedMessage.recipient?.phone}</p>
                            </div>
                            
                            <div>
                                <span className="text-sm font-500 text-gray-500">Message</span>
                                <p className="text-gray-700 mt-1 bg-gray-50 p-4 rounded-lg">
                                    {selectedMessage.content}
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm font-500 text-gray-500">Sent At</span>
                                    <p className="text-gray-900 mt-1">
                                        {new Date(selectedMessage.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                {selectedMessage.deliveredAt && (
                                    <div>
                                        <span className="text-sm font-500 text-gray-500">Delivered At</span>
                                        <p className="text-gray-900 mt-1">
                                            {new Date(selectedMessage.deliveredAt).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            {selectedMessage.error && (
                                <div>
                                    <span className="text-sm font-500 text-red-500">Error</span>
                                    <p className="text-red-600 mt-1 bg-red-50 p-3 rounded-lg text-sm">
                                        {selectedMessage.error}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl">
                            <button
                                onClick={() => setIsDetailOpen(false)}
                                className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-600"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessageReport;
