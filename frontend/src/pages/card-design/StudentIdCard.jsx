import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import { Printer, Loader2, Search, Filter, GraduationCap, School } from 'lucide-react';
import API_URL from '../../config/api';

const StudentIdCard = () => {
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [schoolInfo, setSchoolInfo] = useState(null);
    const [selectedClass, setSelectedClass] = useState('');
    
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const schoolId = user?.schoolName ? user._id : user?.school;

    const componentRef = useRef();

    useEffect(() => {
        fetchClasses();
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

    const fetchStudents = async () => {
        if (!selectedClass) return;
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/Card/Student/${schoolId}/${selectedClass}`);
            setSchoolInfo(response.data.school);
            setStudents(response.data.students);
        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Student_ID_Cards_${selectedClass}`,
    });

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">
            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-md sticky top-4 z-10">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2.5 rounded-lg">
                                <GraduationCap className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Student ID Cards</h1>
                                <p className="text-sm text-gray-500">Generate and print student identity cards</p>
                            </div>
                        </div>

                        {/* Controls Toolbar */}
                        <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
                            <div className="relative">
                                <Filter className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <select 
                                    value={selectedClass} 
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-48 shadow-sm"
                                >
                                    <option value="">Select Class</option>
                                    {classes.map((cls) => (
                                        <option key={cls._id} value={cls._id}>{cls.sclassName}</option>
                                    ))}
                                </select>
                            </div>

                            <button 
                                onClick={fetchStudents}
                                disabled={!selectedClass || loading}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium transition-all shadow-sm active:scale-95"
                            >
                                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Search className="w-4 h-4" />}
                                Generate
                            </button>

                            {students.length > 0 && (
                                <div className="h-6 w-px bg-gray-300 mx-1"></div>
                            )}

                            {students.length > 0 && (
                                <button 
                                    onClick={handlePrint}
                                    className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 flex items-center gap-2 text-sm font-medium transition-all shadow-sm active:scale-95"
                                >
                                    <Printer className="w-4 h-4" />
                                    Print
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {students.length > 0 ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-gray-500 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                            <span className="flex items-center gap-2">
                                <School className="w-4 h-4" />
                                Showing {students.length} cards for Class {classes.find(c => c._id === selectedClass)?.sclassName}
                            </span>
                            <span className="italic">Pro Tip: Use A4 paper for printing</span>
                        </div>

                        {/* Print Preview Container */}
                        <div className="bg-gray-200/80 p-8 rounded-xl border border-gray-300 overflow-auto shadow-inner">
                            <div ref={componentRef} className="bg-white mx-auto p-8 shadow-2xl max-w-[210mm] min-h-[297mm]">
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4">
                                {students.map((student) => (
                                    <div key={student._id} className="border-[1.5px] border-gray-300 rounded-xl overflow-hidden w-full max-w-[350px] aspect-[1.586/1] flex flex-col relative bg-white page-break-inside-avoid shadow-sm print:shadow-none print:border-black group hover:shadow-md transition-shadow">
                                        
                                        {/* Header / School Info */}
                                        <div className="bg-linear-to-r from-blue-800 to-blue-900 text-white p-2.5 flex items-center gap-3 h-[28%] relative overflow-hidden">
                                            {/* Decorative Circle */}
                                            <div className="absolute -right-4 -top-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                                            
                                            {schoolInfo?.schoolLogo && (
                                                <div className="w-11 h-11 bg-white p-0.5 rounded-full shrink-0 shadow-lg z-10">
                                                    <img 
                                                        src={schoolInfo.schoolLogo.startsWith('http') ? schoolInfo.schoolLogo : `${API_URL}/${schoolInfo.schoolLogo}`} 
                                                        alt="Logo" 
                                                        className="w-full h-full rounded-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1 text-center leading-tight z-10 flex flex-col justify-center">
                                                <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/95">{schoolInfo?.schoolName}</h3>
                                                <p className="text-[9px] text-blue-100/90 truncate max-w-[180px] mx-auto mt-0.5">{schoolInfo?.address}</p>
                                            </div>
                                        </div>

                                        {/* Parametric Design Element (Ribbon) */}
                                        <div className="h-1 bg-yellow-400 w-full"></div>

                                        {/* Body */}
                                        <div className="flex-1 p-3 flex gap-3.5 items-center bg-white relative">
                                            {/* Watermark */}
                                            {schoolInfo?.schoolLogo && (
                                                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                                                    <img src={schoolInfo.schoolLogo.startsWith('http') ? schoolInfo.schoolLogo : `${API_URL}/${schoolInfo.schoolLogo}`} className="w-32 h-32 grayscale" />
                                                </div>
                                            )}

                                            {/* Student Photo */}
                                            <div className="w-20 h-24 border border-gray-200 bg-gray-50 shrink-0 rounded-sm shadow-sm p-0.5 relative z-10">
                                                {student.studentPhoto ? (
                                                     <img 
                                                        src={student.studentPhoto.startsWith('http') ? student.studentPhoto : `${API_URL}/${student.studentPhoto}`} 
                                                        className="w-full h-full object-cover rounded-sm"
                                                        alt={student.name} 
                                                     />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                                        <GraduationCap className="w-6 h-6 mb-1" />
                                                        <span className="text-[8px]">No Photo</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Details Table */}
                                            <div className="text-[10px] space-y-1.5 flex-1 z-10 pr-1">
                                                <div className="flex justify-between border-b border-dashed border-gray-200 pb-0.5">
                                                    <span className="font-semibold text-gray-500">Name</span>
                                                    <span className="font-bold text-gray-900 truncate max-w-[110px] uppercase text-right">{student.name}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-dashed border-gray-200 pb-0.5">
                                                    <span className="font-semibold text-gray-500">Class</span>
                                                    <span className="font-bold text-gray-900">{student.sclassName?.sclassName || '-'}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 border-b border-dashed border-gray-200 pb-0.5">
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-semibold text-gray-500">Roll No</span>
                                                        <span className="font-bold text-gray-900">{student.rollNum}</span>
                                                    </div>
                                                    <div className="flex flex-col text-right">
                                                        <span className="text-[8px] font-semibold text-gray-500">Adm No</span>
                                                        <span className="font-bold text-gray-900">{student.admissionId || '-'}</span>
                                                    </div>
                                                </div>
                                                 <div className="flex justify-between pt-0.5">
                                                    <span className="font-semibold text-gray-500">Father</span>
                                                    <span className="font-bold text-gray-900 truncate max-w-[100px] text-right">{student.fatherName || '-'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="bg-gray-50 border-t border-gray-200 p-1.5 px-3 flex justify-between items-center h-[12%]">
                                            <span className="text-[9px] font-medium text-gray-500 flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                Valid: 2025-26
                                            </span>
                                            <span className="text-[9px] uppercase font-bold text-blue-900 tracking-wider">Student Identity Card</span>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-2xl border border-dashed border-gray-300 shadow-xs">
                        <div className="bg-blue-50 p-6 rounded-full mb-4">
                            <School className="w-12 h-12 text-blue-400 opacity-80" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Generate Student ID Cards</h3>
                        <p className="text-gray-500 max-w-sm mt-2 mb-8">Select a class from the toolbar above to generate printable identity cards for all students.</p>
                        <div className="h-1 w-24 bg-blue-100 rounded-full"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentIdCard;
