import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { IconPrinter, IconSearch, IconFilter, IconDownload, IconCreditCard, IconUser, IconChevronDown, IconLoader2, IconSchool, IconSchoolBell } from '@tabler/icons-react';
import CardRenderer from './CardRenderer';
import API_URL from '../../config/api';
import { useReactToPrint } from 'react-to-print';

const StudentIdCard = () => {
    const [loading, setLoading] = useState(false);

    // Data State
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [schoolInfo, setSchoolInfo] = useState(null);

    // Selection State
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Template State
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const user = JSON.parse(localStorage.getItem('currentUser'));
    const schoolId = user?.schoolName ? user._id : user?.school;
    const componentRef = useRef();

    useEffect(() => {
        fetchClasses();
        fetchTemplates();
    }, []);

    const fetchClasses = async () => {
        try {
            if (!schoolId) return;
            const response = await axios.get(`${API_URL}/Sclasses/${schoolId}`);
            setClasses(response.data);
        } catch (error) {
            console.error("Error fetching classes:", error);
        }
    };

    const fetchTemplates = async () => {
        try {
            const res = await axios.get(`${API_URL}/CardTemplate/${schoolId}`);
            // Filter for student cards
            const studentTemplates = res.data.filter(t => t.cardType === 'student');
            setTemplates(studentTemplates);
            if (studentTemplates.length > 0) {
                setSelectedTemplate(studentTemplates[0]);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleClassChange = async (e) => {
        const classId = e.target.value;
        setSelectedClass(classId);
        setSelectAll(false);
        setSelectedStudents([]);
        setStudents([]);

        if (classId) {
            setLoading(true);
            try {
                // Using the specific Card endpoint that returns school info + students
                const response = await axios.get(`${API_URL}/Card/Student/${schoolId}/${classId}`);
                setSchoolInfo(response.data.school);
                setStudents(response.data.students);
            } catch (error) {
                console.error("Error fetching students:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    // Filter students based on search
    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.rollNum && student.rollNum.toString().includes(searchQuery))
    );

    // Select All
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(filteredStudents.map(s => s._id));
        }
        setSelectAll(!selectAll);
    };

    // Toggle Selection
    const toggleSelection = (id) => {
        if (selectedStudents.includes(id)) {
            setSelectedStudents(selectedStudents.filter(sid => sid !== id));
            setSelectAll(false);
        } else {
            setSelectedStudents([...selectedStudents, id]);
        }
    };

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-md sticky top-4 z-10 mx-4 sm:mx-6 lg:mx-8 mt-4">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-100 p-2.5 rounded-lg">
                                <IconSchoolBell className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Student ID Cards</h1>
                                <p className="text-sm text-gray-500">Generate identity cards</p>
                            </div>
                        </div>

                        {/* Toolbar */}
                        <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-lg border border-gray-200 flex-wrap">

                            {/* Template Selector */}
                            {templates.length > 0 ? (
                                <div className="relative">
                                    <IconCreditCard className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <select
                                        value={selectedTemplate?._id || ''}
                                        onChange={(e) => setSelectedTemplate(templates.find(t => t._id === e.target.value))}
                                        className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-48 shadow-sm"
                                    >
                                        {templates.map(t => (
                                            <option key={t._id} value={t._id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div className="text-xs text-red-500 font-medium px-2">
                                    No Templates Found
                                    </div>
                            )}

                            <div className="h-6 w-px bg-gray-300 mx-1 hidden md:block"></div>

                            {/* Class Selector */}
                            <div className="relative">
                                <IconFilter className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <select
                                    value={selectedClass}
                                    onChange={handleClassChange}
                                    className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-40 shadow-sm"
                                >
                                    <option value="">Select Class</option>
                                    {classes.map((cls) => (
                                        <option key={cls._id} value={cls._id}>{cls.sclassName}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <IconSearch className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-40 shadow-sm"
                                />
                            </div>

                            {/* Print Button */}
                            {selectedStudents.length > 0 && (
                                <>
                                    <div className="h-6 w-px bg-gray-300 mx-1 hidden md:block"></div>
                                    <button
                                        onClick={handlePrint}
                                        className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 flex items-center gap-2 text-sm font-medium transition-all shadow-sm active:scale-95"
                                    >
                                        <IconPrinter className="w-4 h-4" />
                                        <span>Print ({selectedStudents.length})</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {selectedClass ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-gray-500 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={selectAll}
                                    onChange={handleSelectAll}
                                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="font-medium text-indigo-700">Select All Students</span>
                            </label>
                            <span className="flex items-center gap-2">
                                <IconUser className="w-4 h-4" />
                                Found {filteredStudents.length} students
                            </span>
                        </div>

                        <div className="bg-gray-200/80 p-8 rounded-xl border border-gray-300 overflow-y-auto max-h-[70vh] shadow-inner">
                            {loading ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 py-20">
                                    <IconLoader2 className="w-8 h-8 animate-spin mb-3 text-indigo-500" />
                                    <p className="text-sm">Loading students...</p>
                                </div>
                            ) : filteredStudents.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 py-20">
                                        <IconUser className="w-12 h-12 mb-3 opacity-20" />
                                    <p className="text-sm">No students found</p>
                                </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {filteredStudents.map(student => (
                                            <div
                                                key={student._id}
                                                onClick={() => toggleSelection(student._id)}
                                                className={`
                                                relative p-3 rounded-lg border transition-all cursor-pointer group select-none flex items-center gap-3 shadow-sm
                                                ${selectedStudents.includes(student._id)
                                                    ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500'
                                                    : 'border-white hover:border-indigo-300 hover:shadow-md bg-white'
                                                    }
                                            `}
                                            >
                                                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                                                {student.studentPhoto ? (
                                                    <img 
                                                        src={student.studentPhoto.startsWith('http') ? student.studentPhoto : `${API_URL}/${student.studentPhoto}`} 
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                <IconUser size={16} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-sm font-semibold text-gray-900 truncate">{student.name}</h3>
                                                <p className="text-xs text-gray-500 truncate">Roll: {student.rollNum}</p>
                                            </div>

                                            <div className={`
                                                w-5 h-5 rounded-full border flex items-center justify-center transition-colors
                                                ${selectedStudents.includes(student._id)
                                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                                    : 'border-gray-300 group-hover:border-indigo-400'
                                                }
                                            `}>
                                                {selectedStudents.includes(student._id) && (
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                        </div>
                            )}
                        </div>
                    </div>
                ) : (
                        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-2xl border border-dashed border-gray-300 shadow-xs">
                            <div className="bg-indigo-50 p-6 rounded-full mb-4">
                                <IconSchool className="w-12 h-12 text-indigo-400 opacity-80" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Generate Student ID Cards</h3>
                            <p className="text-gray-500 max-w-sm mt-2 mb-8">Select a class from the options above to view students and generate ID cards.</p>
                            <div className="h-1 w-24 bg-indigo-100 rounded-full"></div>
                        </div>
                )}

                {/* Print Area - Hidden off-screen but rendered for react-to-print */}
                <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
                    <div ref={componentRef}>
                        {selectedStudents.length > 0 && selectedTemplate ? (
                            <div className="print-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', padding: '20px' }}>
                                <style>
                                    {`
                                        @media print {
                                            @page { margin: 10mm; size: auto; }
                                            body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                                            .print-container { gap: 10px; }
                                        }
                                    `}
                                </style>
                                {filteredStudents
                                    .filter(s => selectedStudents.includes(s._id))
                                    .map(student => (
                                        <div key={student._id} style={{ breakInside: 'avoid', pageBreakInside: 'avoid', marginBottom: '10px' }}>
                                            <CardRenderer
                                                template={selectedTemplate}
                                                data={{
                                                    ...student,
                                                    class: classes.find(c => c._id === selectedClass)?.sclassName,
                                                    schoolName: schoolInfo?.schoolName,
                                                    address: schoolInfo?.address,
                                                    schoolLogo: schoolInfo?.schoolLogo
                                                }}
                                                schoolData={schoolInfo}
                                            />
                                        </div>
                                    ))
                                }
                            </div>
                        ) : (
                            <div className="p-8 text-center text-red-500 font-bold text-xl">
                                Please select students and a template to print.
                                </div>
                        )}
                    </div>
                </div>

                {!selectedTemplate && selectedStudents.length > 0 && (
                    <div className="hidden print:block text-center pt-20">
                        <p className="text-xl font-bold text-red-600">Please select a Custom Template to print cards.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentIdCard;