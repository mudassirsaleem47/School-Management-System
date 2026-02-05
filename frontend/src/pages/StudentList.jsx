import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCampus } from '../context/CampusContext';
import { useToast } from '../context/ToastContext';
import StudentModal from '../components/form-popup/StudentModal';
import StudentDetailsModal from '../components/form-popup/StudentDetailsModal';

import SearchBar from '../components/SearchBar';
import { Edit, Trash2, Plus, Eye, LayoutGrid, List as ListIcon, Filter, X, GraduationCap, Users, ChevronRight, ArrowLeft, Check } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL;

const StudentList = () => {
    const { currentUser } = useAuth();
    const { selectedCampus } = useCampus();
    const { showToast } = useToast();
    const navigate = useNavigate();
    
    // --- State Management ---
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
    
    // Navigation State
    const [viewType, setViewType] = useState('classes'); // 'classes' or 'students'
    const [selectedClass, setSelectedClass] = useState(null);

    // Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [filterClass, setFilterClass] = useState("");
    const [filterSection, setFilterSection] = useState("");
    const [classesList, setClassesList] = useState([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);

    // Delete Confirmation State

    const [selectedDeleteId, setSelectedDeleteId] = useState(null);

    // --- 1. Data Fetching ---
    const fetchData = React.useCallback(async () => {
        try {
            setLoading(true);
            const schoolId = currentUser._id;

            setStudents([]);
            setClassesList([]);
            
            const [studentsRes, classesRes] = await Promise.all([
                axios.get(`${API_BASE}/Students/${schoolId}`),
                axios.get(`${API_BASE}/Sclasses/${schoolId}`)
            ]);

            setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
            setClassesList(Array.isArray(classesRes.data) ? classesRes.data : []);
        } catch (err) {
            showToast("Error loading data", "error");
        } finally {
            setLoading(false);
        }
    }, [currentUser, showToast]);

    useEffect(() => {
        if (currentUser) {
            fetchData();
        }
    }, [currentUser, selectedCampus, fetchData]);

    // --- 2. Action Handlers ---

    // Add/Edit Submit Logic
    const handleFormSubmit = async (formData) => {
        try {
            const dataToSend = { ...formData, school: currentUser._id };
            
            if (currentStudent) {
                // UPDATE Existing
                if (!dataToSend.password) {
                    delete dataToSend.password;
                }
                await axios.put(`${API_BASE}/Student/${currentStudent._id}`, dataToSend);
            } else {
                // CREATE New
                await axios.post(`${API_BASE}/StudentRegister`, dataToSend);
            }

            setIsModalOpen(false);
            setCurrentStudent(null);
            fetchData();
            showToast("Student saved successfully!", "success");
        } catch (err) {
            showToast("Failed to save student.", "error");
        }
    };

    // Delete Logic
    const handleDelete = (id) => {
        if (selectedDeleteId === id) {
            confirmDelete();
        } else {
            setSelectedDeleteId(id);
            // Auto-reset after 3 seconds
            setTimeout(() => {
                setSelectedDeleteId(prev => prev === id ? null : prev);
            }, 3000);
        }
    };

    const confirmDelete = async () => {
        if (!selectedDeleteId) return;
        try {
            await axios.delete(`${API_BASE}/Student/${selectedDeleteId}`);
            fetchData();
            showToast("Student deleted successfully!", "success");
        } catch (err) {
            showToast("Error deleting student", "error");
        }
        setSelectedDeleteId(null);
    };

    // Edit/Add/View Logic
    const handleEdit = (student) => {
        setCurrentStudent(student);
        setIsModalOpen(true);
    };

    const handleView = (student) => {
        setCurrentStudent(student);
        setIsDetailsModalOpen(true);
    };

    // Class Selection Handler
    const handleClassSelect = (classData) => {
        setSelectedClass(classData);
        setViewType('students');
        setFilterClass(classData._id);
        setSearchQuery("");
        setFilterSection("");
    };

    // Back to Classes Handler
    const handleBackToClasses = () => {
        setViewType('classes');
        setSelectedClass(null);
        setFilterClass("");
        setFilterSection("");
        setSearchQuery("");
    };

    // Get student count for a specific class
    const getStudentCountForClass = (classId) => {
        return students.filter(student => student.sclassName?._id === classId).length;
    };

    // Filter students based on search query and filters
    const filteredStudents = students.filter((student) => {
        const query = searchQuery.toLowerCase();
        
        // Search Filter
        const matchesSearch = !searchQuery || (
            student.name?.toLowerCase().includes(query) ||
            student.rollNum?.toString().toLowerCase().includes(query) ||
            student.father?.name?.toLowerCase().includes(query) ||
            student.sclassName?.sclassName?.toLowerCase().includes(query)
        );

        // Class Filter (auto-applied when a class is selected)
        const matchesClass = !filterClass || student.sclassName?._id === filterClass;

        // Section Filter
        const matchesSection = !filterSection || student.section === filterSection;

        // Campus Filter - only filter if a specific campus is selected
        const matchesCampus = !selectedCampus || student.campus?._id === selectedCampus._id || student.campus === selectedCampus._id;

        return matchesSearch && matchesClass && matchesSection && matchesCampus;
    });
    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8">
            
            {/* Header Section */}
            <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        {/* Breadcrumb Navigation */}
                        {viewType === 'students' && selectedClass && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <button
                                    onClick={handleBackToClasses}
                                    className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                                >
                                    Classes
                                </button>
                                <ChevronRight size={16} />
                                <span className="text-gray-900 font-semibold">{selectedClass.sclassName}</span>
                            </div>
                        )}
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                            {viewType === 'classes' ? 'Student Management' : `${selectedClass?.sclassName || 'Class'} Students`}
                        </h1>
                        <p className="text-sm md:text-base text-gray-600 mt-2">
                            {viewType === 'classes'
                                ? 'Select a class to view and manage students'
                                : `Manage students in ${selectedClass?.sclassName || 'this class'}`
                            }
                        </p>
                    </div>

                    {/* Back to Classes Button */}
                    {viewType === 'students' && (
                        <button
                            onClick={handleBackToClasses}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm md:text-base"
                        >
                            <ArrowLeft size={18} />
                            <span className="hidden sm:inline">Back to Classes</span>
                            <span className="sm:hidden">Back</span>
                        </button>
                    )}
                </div>


                {/* Controls Bar - Only show in students view */}
                {viewType === 'students' && (
                    <div className="flex flex-col xl:flex-row justify-between items-center gap-4 mb-6">

                        {/* Search & Filters Group */}
                        <div className="w-full flex flex-col md:flex-row gap-3 items-center flex-1">
                            {/* Search Bar */}
                            <div className="w-full md:w-72">
                                <SearchBar
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search students..."
                                    className="w-full"
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex flex-wrap gap-2 w-full md:w-auto">
                                {/* Section Filter */}
                                <div className="relative">
                                    <select
                                        value={filterSection}
                                        onChange={(e) => setFilterSection(e.target.value)}
                                        className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white min-w-[140px]"
                                    >
                                        <option value="">All Sections</option>
                                        {selectedClass?.sections?.map((sec, idx) => (
                                            <option key={idx} value={sec.sectionName || sec}>
                                                {sec.sectionName || sec}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                        <Filter size={14} />
                                    </div>
                                </div>

                                {(filterSection || searchQuery) && (
                                    <button
                                        onClick={() => {
                                            setFilterSection("");
                                            setSearchQuery("");
                                        }}
                                        className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                    >
                                        <X size={14} /> Clear
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* View Toggle */}
                        <div className="flex bg-white rounded-lg shadow-xs p-1 border border-gray-200 shrink-0">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                                title="List View"
                            >
                                <ListIcon size={18} className="md:w-5 md:h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                                title="Grid View"
                            >
                                <LayoutGrid size={18} className="md:w-5 md:h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Content Section */}
                <div className="min-h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                                <p className="text-gray-600">Loading...</p>
                            </div>
                        </div>
                    ) : viewType === 'classes' ? (
                        /* CLASSES GRID VIEW */
                        classesList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-xl shadow-sm border border-gray-200">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <GraduationCap className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-600 text-lg font-500">No classes yet</p>
                                <p className="text-gray-500 text-sm mt-1">Create classes first to view students</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {classesList.map((classData) => {
                                    const studentCount = getStudentCountForClass(classData._id);
                                    return (
                                        <div
                                            key={classData._id}
                                            onClick={() => handleClassSelect(classData)}
                                            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-indigo-500 overflow-hidden group"
                                        >
                                            {/* Card Header with Gradient */}
                                            <div className="h-32 bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center relative overflow-hidden">
                                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                                                <GraduationCap className="w-16 h-16 text-white relative z-10" />
                                            </div>

                                            {/* Card Content */}
                                            <div className="p-6">
                                                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                                                    {classData.sclassName}
                                                </h3>

                                                {/* Student Count */}
                                                <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
                                                    <Users size={18} />
                                                    <span className="text-sm">
                                                        {studentCount} {studentCount === 1 ? 'Student' : 'Students'}
                                                    </span>
                                                </div>

                                                {/* Sections Info */}
                                                {classData.sections && classData.sections.length > 0 && (
                                                    <div className="text-center">
                                                        <p className="text-xs text-gray-500 mb-2">Sections:</p>
                                                        <div className="flex flex-wrap justify-center gap-2">
                                                            {classData.sections.slice(0, 3).map((sec, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-medium"
                                                                >
                                                                    {sec.sectionName || sec}
                                                                </span>
                                                            ))}
                                                            {classData.sections.length > 3 && (
                                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                                                    +{classData.sections.length - 3}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* View Button */}
                                                <button className="w-full mt-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors font-medium text-sm group-hover:bg-indigo-600 group-hover:text-white">
                                                    View Students
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                                    </div>
                                )
                    ) : students.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-xl shadow-sm border border-gray-200">
                            <div 
                                onClick={() => navigate('/admin/admission')}
                                className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 cursor-pointer hover:bg-gray-200 transition-colors"
                            >
                                <Plus className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-600 text-lg font-500">No students yet</p>
                            <p className="text-gray-500 text-sm mt-1">Go to Admission page to add students</p>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Filter className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-600 text-lg font-500">No matches found</p>
                            <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search query</p>
                        </div>
                    ) : (
                        <>
                            {/* LIST VIEW */}
                            {viewMode === 'list' && (
                                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                                                    {/* Add horizontal scroll wrapper for mobile */}
                                    <div className="overflow-x-auto">
                                                        <table className="w-full min-w-[800px]">
                                            <thead>
                                                <tr className="bg-linear-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Admission No</th>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Student Name</th>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Roll No.</th>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Class</th>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Father Name</th>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date Of Birth</th>
                                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {filteredStudents.map((student) => (
                                                    <tr key={student._id} className="hover:bg-indigo-50 transition duration-150 group">
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                            #{student._id.slice(-6).toUpperCase()}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center">
                                                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold mr-3 overflow-hidden border border-indigo-200">
                                                                    {student.studentPhoto ? (
                                                                        <img src={`${API_BASE}/${student.studentPhoto}`} alt={student.name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        student.name.charAt(0)
                                                                    )}
                                                                </div>
                                                                <div className="text-sm font-600 text-gray-900">{student.name}</div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">{student.rollNum}</td>
                                                        <td className="px-6 py-4 text-sm">
                                                            <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-600">
                                                                {student.sclassName?.sclassName || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">{student.father?.name || 'N/A'}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">
                                                            {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <button 
                                                                    onClick={() => handleView(student)} 
                                                                    className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition duration-150"
                                                                    title="View Details"
                                                                >
                                                                    <Eye size={16} />
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleEdit(student)} 
                                                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition duration-150"
                                                                    title="Edit student"
                                                                >
                                                                    <Edit size={16} />
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDelete(student._id)} 
                                                                    className={`p-2 rounded-lg transition duration-150 inline-flex items-center justify-center h-9 w-9 ${selectedDeleteId === student._id
                                                                        ? "bg-red-600 text-white hover:bg-red-700"
                                                                        : "bg-red-50 text-red-600 hover:bg-red-100"
                                                                        }`}
                                                                    title="Delete student"
                                                                >
                                                                    {selectedDeleteId === student._id ? <Check size={16} /> : <Trash2 size={16} />}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* GRID VIEW */}
                            {viewMode === 'grid' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredStudents.map((student) => (
                                        <div key={student._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden group flex flex-col items-center p-6">
                                            <div className="h-32 w-32 rounded-full border-4 border-indigo-50 bg-white shadow-lg overflow-hidden flex items-center justify-center mb-4">
                                                {student.studentPhoto ? (
                                                    <img src={`${API_BASE}/${student.studentPhoto}`} alt={student.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-4xl font-bold text-indigo-600">{student.name.charAt(0)}</div>
                                                )}
                                            </div>
                                            <div className="w-full text-center">
                                                <h3 className="text-lg font-bold text-gray-900 truncate">{student.name}</h3>
                                                <p className="text-sm text-gray-500 mb-3">Roll No: {student.rollNum}</p>
                                                
                                                <div className="flex justify-center gap-2 mb-4">
                                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold">
                                                        Class {student.sclassName?.sclassName || 'N/A'}
                                                    </span>
                                                </div>

                                                <div className="text-sm text-gray-600 mb-4 bg-gray-50 py-2 rounded-lg">
                                                    <span className="text-xs text-gray-400 uppercase block mb-1">Father's Name</span>
                                                    {student.father?.name || 'N/A'}
                                                </div>

                                                <div className="flex justify-center gap-3 pt-2 border-t border-gray-100">
                                                    <button 
                                                        onClick={() => handleView(student)}
                                                        className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium px-3 py-1.5 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    >
                                                        <Eye size={16} /> View
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEdit(student)}
                                                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <Edit size={16} /> Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(student._id)}
                                                        className={`flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${selectedDeleteId === student._id
                                                            ? "bg-red-600 text-white hover:bg-red-700"
                                                            : "text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            }`}
                                                    >
                                                        {selectedDeleteId === student._id ? (
                                                            <span>Sure?</span>
                                                        ) : (
                                                            <>
                                                                    <Trash2 size={16} /> Delete
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Popup Modal Component (Edit/Add) */}
            <StudentModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={currentStudent}
            />

            {/* Student Details Modal (View) */}
            <StudentDetailsModal 
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                student={currentStudent}
            />


        </div>
    );
};

export default StudentList;