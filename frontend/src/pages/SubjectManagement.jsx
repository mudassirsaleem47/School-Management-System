import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useModalAnimation } from '../hooks/useModalAnimation';
import { Trash2, Plus, X, Search, BookOpen, Clock, Hash } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL;

const SubjectManagement = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    
    // State
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClassId, setSelectedClassId] = useState("all");
    
    // Add Subject Form State
    const [showPopup, setShowPopup] = useState(false);
    const [formData, setFormData] = useState({
        subName: "",
        subCode: "",
        sessions: "",
        sclass: ""
    });

    const { isVisible, isClosing, handleClose } = useModalAnimation(showPopup, () => setShowPopup(false));

    // Fetch Classes
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                if (currentUser?._id) {
                    const result = await axios.get(`${API_BASE}/Sclasses/${currentUser._id}`);
                    setClasses(result.data);
                }
            } catch (err) {
                console.error("Error fetching classes:", err);
            }
        };
        fetchClasses();
    }, [currentUser]);

    // Fetch Subjects
    const fetchSubjects = async () => {
        if (!currentUser?._id) return;
        setLoading(true);
        try {
            let url = `${API_BASE}/AllSubjects/${currentUser._id}`;
            if (selectedClassId !== "all") {
                url = `${API_BASE}/ClassSubjects/${selectedClassId}`;
            }
            const result = await axios.get(url);
            if (Array.isArray(result.data)) {
                setSubjects(result.data);
            } else {
                setSubjects([]);
            }
        } catch (err) {
            console.error("Error fetching subjects:", err);
            setSubjects([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, [currentUser, selectedClassId]);

    // Handle Add Subject
    const handleAddSubject = async (e) => {
        e.preventDefault();
        try {
            // Backend expects subjects array
            const payload = {
                subjects: [{
                    subName: formData.subName,
                    subCode: formData.subCode,
                    sessions: formData.sessions
                }],
                sclass: formData.sclass,
                adminID: currentUser._id
            };

            await axios.post(`${API_BASE}/SubjectCreate`, payload);
            showToast("Subject added successfully!", "success");
            setFormData({ subName: "", subCode: "", sessions: "", sclass: "" });
            handleClose();
            fetchSubjects();
        } catch (err) {
            showToast(err.response?.data?.message || "Error adding subject", "error");
        }
    };

    // Handle Delete
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this subject?")) {
            try {
                await axios.delete(`${API_BASE}/Subject/${id}`);
                showToast("Subject deleted successfully", "success");
                fetchSubjects();
            } catch (err) {
                showToast("Error deleting subject", "error");
            }
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Subject Management</h1>
                    <p className="text-gray-600 mt-2">Manage subjects and curriculum</p>
                </div>
                <button onClick={() => setShowPopup(true)} className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg hover:shadow-xl transition duration-200 font-600">
                    <Plus className="w-5 h-5 mr-2" /> Add Subject
                </button>
            </div>

            {/* Filter */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-4">
                <span className="text-gray-700 font-semibold">Filter by Class:</span>
                <select 
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                    <option value="all">All Classes</option>
                    {classes.map(cls => (
                        <option key={cls._id} value={cls._id}>{cls.sclassName}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : subjects.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900">No Subjects Found</h3>
                    <p className="text-gray-500 mt-1">Start by adding subjects to your classes.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {subjects.map((sub) => (
                        <div key={sub._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 overflow-hidden group">
                            <div className="p-5">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">{sub.subName}</h3>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                            {sub.sclass?.sclassName || "No Class"}
                                        </span>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(sub._id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                                
                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Hash className="w-4 h-4 mr-2 text-gray-400" />
                                        <span>Code: <span className="font-mono text-gray-800">{sub.subCode}</span></span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                        <span>Sessions: {sub.sessions}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Subject Modal */}
            {isVisible && (
                <div className={`fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
                    <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-md relative ${isClosing ? 'animate-scale-down' : 'animate-scale-up'}`}>
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">Add New Subject</h2>
                            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddSubject} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                    placeholder="e.g., Mathematics"
                                    value={formData.subName}
                                    onChange={(e) => setFormData({...formData, subName: e.target.value})}
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code *</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                        placeholder="e.g., MATH101"
                                        value={formData.subCode}
                                        onChange={(e) => setFormData({...formData, subCode: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sessions/Week *</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                        placeholder="e.g., 5"
                                        value={formData.sessions}
                                        onChange={(e) => setFormData({...formData, sessions: e.target.value})}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
                                <select
                                    required
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                    value={formData.sclass}
                                    onChange={(e) => setFormData({...formData, sclass: e.target.value})}
                                >
                                    <option value="">Select a Class</option>
                                    {classes.map(cls => (
                                        <option key={cls._id} value={cls._id}>{cls.sclassName}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                                >
                                    Add Subject
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubjectManagement;
