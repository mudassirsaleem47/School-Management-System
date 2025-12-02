import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useModalAnimation } from '../../hooks/useModalAnimation';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_BASE = "http://localhost:5000";

const VisitorModal = ({ isOpen, onClose, onSubmit, initialData, viewMode = false }) => {
    const { currentUser } = useAuth();
    
    // Form state
    const [formData, setFormData] = useState({
        purpose: '',
        meetingWith: 'Staff',
        staff: '',
        class: '',
        section: '',
        student: '',
        visitorName: '',
        phone: '',
        idCard: '',
        numberOfPerson: 1,
        date: new Date().toISOString().split('T')[0],
        inTime: '',
        outTime: '',
        note: '',
        document: ''
    });

    const [staffList, setStaffList] = useState([]);
    const [classesList, setClassesList] = useState([]);
    const [studentsList, setStudentsList] = useState([]);
    const { isVisible, isClosing, handleClose } = useModalAnimation(isOpen, onClose);
    
    // Fetch staff, classes when modal opens
    useEffect(() => {
        if (isOpen && currentUser) {
            fetchStaff();
            fetchClasses();
        }
    }, [isOpen, currentUser]);

    // Fetch students when class changes
    useEffect(() => {
        if (formData.class && formData.meetingWith === 'Student') {
            fetchStudents(formData.class);
        }
    }, [formData.class, formData.meetingWith]);

    const fetchStaff = async () => {
        try {
            const res = await axios.get(`${API_BASE}/Teachers/${currentUser._id}`);
            setStaffList(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error fetching staff:", err);
        }
    };

    const fetchClasses = async () => {
        try {
            const res = await axios.get(`${API_BASE}/Sclasses/${currentUser._id}`);
            setClassesList(res.data);
        } catch (err) {
            console.error("Error fetching classes:", err);
        }
    };

    const fetchStudents = async (classId) => {
        try {
            const res = await axios.get(`${API_BASE}/Students/${currentUser._id}`);
            const filteredStudents = res.data.filter(student => student.sclassName?._id === classId);
            setStudentsList(filteredStudents);
        } catch (err) {
            console.error("Error fetching students:", err);
        }
    };
    
    // When initialData changes (Edit mode)
    useEffect(() => {
        if (initialData) {
            const formattedData = {
                purpose: initialData.purpose || '',
                meetingWith: initialData.meetingWith || 'Staff',
                staff: initialData.staff?._id || '',
                class: initialData.class?._id || '',
                section: initialData.section || '',
                student: initialData.student?._id || '',
                visitorName: initialData.visitorName || '',
                phone: initialData.phone || '',
                idCard: initialData.idCard || '',
                numberOfPerson: initialData.numberOfPerson || 1,
                date: initialData.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0],
                inTime: initialData.inTime || '',
                outTime: initialData.outTime || '',
                note: initialData.note || '',
                document: initialData.document || ''
            };
            setFormData(formattedData);
        } else {
            // Reset form for add mode
            setFormData({
                purpose: '',
                meetingWith: 'Staff',
                staff: '',
                class: '',
                section: '',
                student: '',
                visitorName: '',
                phone: '',
                idCard: '',
                numberOfPerson: 1,
                date: new Date().toISOString().split('T')[0],
                inTime: '',
                outTime: '',
                note: '',
                document: ''
            });
        }
    }, [initialData]);
    
    if (!isVisible) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // Reset dependent fields when meetingWith changes
        if (name === 'meetingWith') {
            if (value === 'Staff') {
                setFormData(prev => ({ ...prev, class: '', section: '', student: '' }));
            } else {
                setFormData(prev => ({ ...prev, staff: '' }));
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return createPortal(
        <div className={`fixed inset-0 z-[9999] overflow-y-auto bg-black/70 backdrop-blur-sm ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
            <div className="flex min-h-full items-center justify-center p-4">
                <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-6xl relative ${isClosing ? 'animate-scale-down' : 'animate-scale-up'}`}>
                
                {/* Header */}
                <div className="p-7 rounded-t-2xl flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                            {viewMode ? 'View Visitor Details' : (initialData ? 'Edit Visitor' : 'Add Visitor')}
                        </h2>
                        <p className="text-gray-600 text-sm mt-2">
                            {viewMode ? 'Read-only view of visitor information' : (initialData ? 'Update the visitor details below' : 'Fill in the details to add a new visitor')}
                        </p>
                    </div>
                    <button 
                        onClick={handleClose} 
                        className="text-red-600 bg-gray-50 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition duration-150 shrink-0"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content - Conditional Rendering */}
                {viewMode ? (
                    /* VIEW MODE - Card-based Display */
                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Visitor Information Card */}
                            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6 border border-indigo-100">
                                <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Visitor Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-600 text-gray-500 uppercase mb-1">Visitor Name</p>
                                        <p className="text-base font-600 text-gray-900">{formData.visitorName || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-600 text-gray-500 uppercase mb-1">Purpose</p>
                                        <p className="text-base font-600 text-gray-900">{formData.purpose || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-600 text-gray-500 uppercase mb-1">Phone</p>
                                        <p className="text-base font-600 text-gray-900">{formData.phone || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-600 text-gray-500 uppercase mb-1">ID Card</p>
                                        <p className="text-base font-600 text-gray-900">{formData.idCard || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-600 text-gray-500 uppercase mb-1">Number of Persons</p>
                                        <p className="text-base font-600 text-gray-900">{formData.numberOfPerson || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Meeting Details Card */}
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100">
                                <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Meeting Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-600 text-gray-500 uppercase mb-1">Meeting With</p>
                                        <span className="inline-block px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm font-600">
                                            {formData.meetingWith}
                                        </span>
                                    </div>
                                    {formData.meetingWith === 'Staff' && formData.staff && (
                                        <div>
                                            <p className="text-xs font-600 text-gray-500 uppercase mb-1">Staff Member</p>
                                            <p className="text-base font-600 text-gray-900">
                                                {staffList.find(s => s._id === formData.staff)?.name || '-'}
                                            </p>
                                        </div>
                                    )}
                                    {formData.meetingWith === 'Student' && (
                                        <>
                                            <div>
                                                <p className="text-xs font-600 text-gray-500 uppercase mb-1">Class</p>
                                                <p className="text-base font-600 text-gray-900">
                                                    {classesList.find(c => c._id === formData.class)?.sclassName || '-'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-600 text-gray-500 uppercase mb-1">Section</p>
                                                <p className="text-base font-600 text-gray-900">{formData.section || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-600 text-gray-500 uppercase mb-1">Student</p>
                                                <p className="text-base font-600 text-gray-900">
                                                    {studentsList.find(s => s._id === formData.student)?.name || '-'}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Visit Schedule Card */}
                            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-6 border border-green-100">
                                <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Visit Schedule
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-xs font-600 text-gray-500 uppercase mb-1">Date</p>
                                        <p className="text-base font-600 text-gray-900">
                                            {formData.date ? new Date(formData.date).toLocaleDateString() : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-600 text-gray-500 uppercase mb-1">In Time</p>
                                        <p className="text-base font-600 text-gray-900">{formData.inTime || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-600 text-gray-500 uppercase mb-1">Out Time</p>
                                        <p className="text-base font-600 text-gray-900">{formData.outTime || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Notes Card */}
                            {formData.note && (
                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-100">
                                    <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                        </svg>
                                        Notes
                                    </h3>
                                    <p className="text-base text-gray-700 whitespace-pre-wrap">{formData.note}</p>
                                </div>
                            )}
                        </div>

                        {/* Close Button */}
                        <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
                            <button 
                                type="button" 
                                onClick={handleClose} 
                                className="cursor-pointer px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-600 transition duration-150"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                ) : (
                    /* EDIT/ADD MODE - Form */
                    <form onSubmit={handleSubmit} className="p-6 md:p-8">
                        <div className="space-y-5">
                            
                            {/* Row 1: Purpose, Meeting With, Staff/Class */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">Purpose *</label>
                                    <input 
                                        name="purpose" 
                                        placeholder="Enter purpose" 
                                        value={formData.purpose} 
                                        onChange={handleChange} 
                                        required 
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">Meeting With *</label>
                                    <select 
                                        name="meetingWith" 
                                        value={formData.meetingWith} 
                                        onChange={handleChange} 
                                        required 
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    >
                                        <option value="Staff">Staff</option>
                                        <option value="Student">Student</option>
                                    </select>
                                </div>

                                {/* Conditional: Staff dropdown */}
                                {formData.meetingWith === 'Staff' && (
                                    <div>
                                        <label className="block text-sm font-600 text-gray-700 mb-2">Staff *</label>
                                        <select 
                                            name="staff" 
                                            value={formData.staff} 
                                            onChange={handleChange} 
                                            required 
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                        >
                                            <option value="">Select</option>
                                            {staffList.map((staff) => (
                                                <option key={staff._id} value={staff._id}>{staff.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Conditional: Class dropdown */}
                                {formData.meetingWith === 'Student' && (
                                    <div>
                                        <label className="block text-sm font-600 text-gray-700 mb-2">Class *</label>
                                        <select 
                                            name="class" 
                                            value={formData.class} 
                                            onChange={handleChange} 
                                            required 
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                        >
                                            <option value="">Select</option>
                                            {classesList.map((cls) => (
                                                <option key={cls._id} value={cls._id}>{cls.sclassName}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Row 2: Section and Student (only for Student meeting) */}
                            {formData.meetingWith === 'Student' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div>
                                        <label className="block text-sm font-600 text-gray-700 mb-2">Section *</label>
                                        <input 
                                            name="section" 
                                            placeholder="Enter section" 
                                            value={formData.section} 
                                            onChange={handleChange} 
                                            required 
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-600 text-gray-700 mb-2">Student *</label>
                                        <select 
                                            name="student" 
                                            value={formData.student} 
                                            onChange={handleChange} 
                                            required 
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                        >
                                            <option value="">Select</option>
                                            {studentsList.map((student) => (
                                                <option key={student._id} value={student._id}>{student.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-600 text-gray-700 mb-2">Visitor Name *</label>
                                        <input 
                                            name="visitorName" 
                                            placeholder="Enter visitor name" 
                                            value={formData.visitorName} 
                                            onChange={handleChange} 
                                            required 
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Row 3: Visitor Name (for Staff) and Phone */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {formData.meetingWith === 'Staff' && (
                                    <div>
                                        <label className="block text-sm font-600 text-gray-700 mb-2">Visitor Name *</label>
                                        <input 
                                            name="visitorName" 
                                            placeholder="Enter visitor name" 
                                            value={formData.visitorName} 
                                            onChange={handleChange} 
                                            required 
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">Phone</label>
                                    <input 
                                        name="phone" 
                                        type="tel"
                                        placeholder="Enter phone number" 
                                        value={formData.phone} 
                                        onChange={handleChange} 
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">ID Card</label>
                                    <input 
                                        name="idCard" 
                                        placeholder="Enter ID card number" 
                                        value={formData.idCard} 
                                        onChange={handleChange} 
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    />
                                </div>
                            </div>

                            {/* Row 4: Number of Person, Date */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">Number Of Person</label>
                                    <input 
                                        name="numberOfPerson" 
                                        type="number"
                                        min="1"
                                        value={formData.numberOfPerson} 
                                        onChange={handleChange} 
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">Date *</label>
                                    <input 
                                        name="date" 
                                        type="date"
                                        value={formData.date} 
                                        onChange={handleChange} 
                                        required 
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    />
                                </div>
                            </div>

                            {/* Row 5: In Time, Out Time */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">In Time *</label>
                                    <input 
                                        name="inTime" 
                                        type="time"
                                        value={formData.inTime} 
                                        onChange={handleChange} 
                                        required 
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">Out Time</label>
                                    <input 
                                        name="outTime" 
                                        type="time"
                                        value={formData.outTime} 
                                        onChange={handleChange} 
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    />
                                </div>
                            </div>

                            {/* Row 6: Note (Full Width) */}
                            <div>
                                <label className="block text-sm font-600 text-gray-700 mb-2">Note</label>
                                <textarea 
                                    name="note" 
                                    placeholder="Enter any notes" 
                                    value={formData.note} 
                                    onChange={handleChange} 
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none" 
                                    rows="2"
                                ></textarea>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                            <button 
                                type="button" 
                                onClick={handleClose} 
                                className="cursor-pointer px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-600 transition duration-150"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="cursor-pointer px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-600 transition duration-150 shadow-lg hover:shadow-xl"
                            >
                                {initialData ? 'Update Visitor' : 'Save'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
            </div>
        </div>,
        document.body
    );
};

export default VisitorModal;
