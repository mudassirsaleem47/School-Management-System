import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useModalAnimation } from '../hooks/useModalAnimation';

import { Trash2, Plus, X, Check } from 'lucide-react';

const API_BASE = "http://localhost:5000";

const ShowClasses = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    
    // --- State Management ---
    const [sclasses, setSclasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Add Class Modal State
    const [sclassName, setSclassName] = useState(""); 
    const [classIncharge, setClassIncharge] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const { isVisible, isClosing, handleClose } = useModalAnimation(showPopup, () => setShowPopup(false));

    // Delete Confirmation State
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);

    // --- 1. Fetch Classes ---
    const fetchClasses = async () => {
        if (!currentUser || !currentUser._id) return;

        setLoading(true);
        try {
            const result = await axios.get(`${API_BASE}/Sclasses/${currentUser._id}`);
            
            if (Array.isArray(result.data)) {
                setSclasses(result.data);
            } else {
                setSclasses([]);
            }
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 404) {
                setSclasses([]);
            } else {
                setError("Error fetching classes");
            }
        } finally {
            setLoading(false);
        }
    };

    // --- Fetch Teachers ---
    const fetchTeachers = async () => {
        if (!currentUser || !currentUser._id) return;

        try {
            const result = await axios.get(`${API_BASE}/Teachers/${currentUser._id}`);
            if (Array.isArray(result.data)) {
                setTeachers(result.data);
            }
        } catch (err) {
            console.error("Error fetching teachers:", err);
        }
    };

    useEffect(() => {
        fetchClasses();
        fetchTeachers();
    }, [currentUser]);

    // --- 2. Add Class ---
    const addClass = async (e) => {
        e.preventDefault();
        
        try {
            const data = {
                sclassName: sclassName,
                school: currentUser._id,
                classIncharge: classIncharge || undefined
            };
            
            await axios.post(`${API_BASE}/SclassCreate`, data);
            
            setSclassName("");
            setClassIncharge("");
            setShowPopup(false);
            fetchClasses();
            showToast("Class added successfully!", "success");
        } catch (err) {
            showToast("Error adding class: " + (err.response?.data?.message || "Server Error"), "error");
        }
    };

    // --- 3. Delete Class ---
    const handleDeleteClass = (id) => {
        const key = `class-${id}`;
        if (selectedDeleteId === key) {
            confirmDelete('class', id);
        } else {
            setSelectedDeleteId(key);
            setTimeout(() => setSelectedDeleteId(prev => prev === key ? null : prev), 3000);
        }
    };

    // --- 4. Delete Section ---
    const handleDeleteSection = (classId, sectionId) => {
        const key = `section-${classId}-${sectionId}`;
        if (selectedDeleteId === key) {
            confirmDelete('section', classId, sectionId);
        } else {
            setSelectedDeleteId(key);
            setTimeout(() => setSelectedDeleteId(prev => prev === key ? null : prev), 3000);
        }
    };

    // Confirm Delete
    const confirmDelete = async (type, id, subId) => {
        try {
            if (type === 'class') {
                await axios.delete(`${API_BASE}/Sclass/${id}`);
                showToast("Class deleted successfully!", "success");
            } else if (type === 'section') {
                await axios.delete(`${API_BASE}/Sclass/${id}/Section/${subId}`);
                showToast("Section deleted successfully!", "success");
            }
            fetchClasses();
        } catch (err) {
            showToast(`Error deleting ${type}`, "error");
        }
        setSelectedDeleteId(null);
    };

    // --- 5. Add Section ---
    const handleAddSection = async (classId, sectionName) => {
        if (!sectionName) return;
        try {
            await axios.put(`${API_BASE}/Sclass/${classId}/Section`, { sectionName });
            fetchClasses();
            showToast("Section added successfully!", "success");
        } catch (err) {
            showToast("Failed to add section", "error");
        }
    };

    return (
       <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6 md:p-8">
            <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Manage Classes</h1>
                        <p className="text-gray-600 mt-2">Create and manage your school classes</p>
                    </div>
                    <button onClick={() => setShowPopup(true)} className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg hover:shadow-xl transition duration-200 font-600">
                        <Plus className="w-5 h-5 mr-2" /> Add Class
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                            <p className="text-gray-600">Loading classes...</p>
                        </div>
                    </div>
                ) : sclasses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-xl border border-gray-200">
                        <div onClick={() => setShowPopup(true)} className="w-16 h-16 cursor-pointer bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Plus className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600 text-lg font-600">No classes yet</p>
                        <p className="text-gray-500 text-sm mt-1">Click "Add Class" to create your first class</p>
                    </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {sclasses.map((item) => (
                        <div key={item._id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition duration-200 flex flex-col justify-between">
                            
                            {/* Class Name & Delete */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{item.sclassName}</h3>
                                    <p className="text-xs text-gray-500 mt-1">ID: {item._id.slice(-4)}</p>
                                    {item.classIncharge && (
                                        <p className="text-xs text-emerald-600 mt-1 font-500">📚 Incharge: {item.classIncharge.name}</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDeleteClass(item._id)}
                                    className={`p-2 rounded-lg transition duration-150 inline-flex items-center justify-center h-9 w-9 ${selectedDeleteId === `class-${item._id}`
                                        ? "bg-red-600 text-white hover:bg-red-700"
                                        : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                                        }`}
                                >
                                    {selectedDeleteId === `class-${item._id}` ? <Check className="w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Sections List */}
                            <div className="mb-4">
                                <p className="text-sm font-semibold text-gray-700 mb-2">Sections:</p>
                                <div className="flex flex-wrap gap-2">
                                    {item.sections && item.sections.length > 0 ? (
                                        item.sections.map((sec) => (
                                            <span key={sec._id} className="px-2.5 py-1.5 text-sm bg-indigo-50 text-indigo-700 rounded-md font-500 flex items-center gap-1">
                                                {sec.sectionName}
                                                <button
                                                    onClick={() => handleDeleteSection(item._id, sec._id)}
                                                    className={`ml-2 transition-colors duration-150 flex items-center ${selectedDeleteId === `section-${item._id}-${sec._id}`
                                                        ? "text-red-600 font-bold bg-white rounded px-1"
                                                        : "text-red-500 hover:text-red-700"
                                                        }`}
                                                >
                                                    {selectedDeleteId === `section-${item._id}-${sec._id}` ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                                </button>
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">No sections</span>
                                    )}
                                </div>
                            </div>

                            {/* Add Section Input */}
                            <div className="mt-auto pt-4 border-t border-gray-200">
                                <form 
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleAddSection(item._id, e.target.section.value);
                                        e.target.section.value = "";
                                    }} 
                                    className="flex gap-2"
                                >
                                    <input 
                                        name="section" 
                                        type="text" 
                                        placeholder="+ Add Section (e.g. A)" 
                                        className="flex-1 p-2 text-sm border border-gray-200 rounded"
                                        required
                                    />
                                    <button type="submit" className="px-3 py-1 bg-[#685dd8] text-white text-sm rounded hover:bg-[#5e50cc]">
                                        Add
                                    </button>
                                </form>
                            </div>

                        </div>
                    ))}
                </div>
                )}
            </div>

            {/* Add Class Modal */}
            {isVisible && (
                <div className={`fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
                    <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-md relative ${isClosing ? 'animate-scale-down' : 'animate-scale-up'}`}>
                        
                        {/* Header */}
                        <div className="p-7 rounded-t-2xl flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Add New Class</h2>
                                <p className="text-gray-600 text-sm mt-1">Create a new class for your school</p>
                            </div>
                            <button 
                                onClick={handleClose} 
                                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg transition duration-150"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={addClass} className="p-6 md:p-8">
                            <div className="mb-6">
                                <label className="block text-sm font-600 text-gray-700 mb-2">Class Name *</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Class 10, Grade 9, Pre-K" 
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    value={sclassName}
                                    onChange={(e) => setSclassName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-600 text-gray-700 mb-2">Class Incharge (Optional)</label>
                                <select
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    value={classIncharge}
                                    onChange={(e) => setClassIncharge(e.target.value)}
                                >
                                    <option value="">-- Select Teacher --</option>
                                    {teachers.map((teacher) => (
                                        <option key={teacher._id} value={teacher._id}>
                                            {teacher.name} ({teacher.subject})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Buttons */}
                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                                <button type="button" onClick={handleClose} className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-600 transition duration-150">Cancel</button>
                                <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-600 transition duration-150 shadow-lg hover:shadow-xl">Add Class</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


        </div>
    );
};

export default ShowClasses;