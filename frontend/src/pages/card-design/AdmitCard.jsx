import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import { Printer, Loader2, Search, Filter, FileBadge, CalendarClock } from 'lucide-react';
import API_URL from '../../config/api';

const AdmitCard = () => {
    const [loading, setLoading] = useState(false);
    const [examGroups, setExamGroups] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedExamGroup, setSelectedExamGroup] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    
    const [examSchedules, setExamSchedules] = useState([]);
    const [students, setStudents] = useState([]);
    const [schoolInfo, setSchoolInfo] = useState(null);
    
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const schoolId = user?.schoolName ? user._id : user?.school; 

    const componentRef = useRef();

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            if (!schoolId) return;
            const [groupsRes, classesRes] = await Promise.all([
                axios.get(`${API_URL}/ExamGroups/${schoolId}`),
                axios.get(`${API_URL}/Sclasses/${schoolId}`)
            ]);
            setExamGroups(groupsRes.data);
            setClasses(classesRes.data);
        } catch (error) {
            console.error("Error fetching initial data:", error);
        }
    };

    const fetchAdmitCards = async () => {
        if (!selectedExamGroup || !selectedClass) return;
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/Card/Admit/${schoolId}/${selectedExamGroup}/${selectedClass}`);
            setSchoolInfo(response.data.school);
            setExamSchedules(response.data.examSchedules);
            setStudents(response.data.students);
        } catch (error) {
            console.error("Error fetching admit cards:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Admit_Cards_${selectedClass}`,
    });

    const getExamGroupName = () => {
        return examGroups.find(g => g._id === selectedExamGroup)?.groupName || 'Exam';
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-md sticky top-4 z-10">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-100 p-2.5 rounded-lg">
                                <FileBadge className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Exam Admit Cards</h1>
                                <p className="text-sm text-gray-500">Generate hall tickets with exam schedules</p>
                            </div>
                        </div>

                        {/* Toolbar */}
                        <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-lg border border-gray-200 flex-wrap">
                            <div className="relative">
                                <Filter className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                 <select 
                                    value={selectedExamGroup} 
                                    onChange={(e) => setSelectedExamGroup(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-purple-500 outline-none w-48 shadow-sm"
                                >
                                    <option value="">Select Exam Group</option>
                                    {examGroups.map((group) => (
                                        <option key={group._id} value={group._id}>{group.groupName}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="relative">
                                <Filter className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <select 
                                    value={selectedClass} 
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-purple-500 outline-none w-48 shadow-sm"
                                >
                                    <option value="">Select Class</option>
                                    {classes.map((cls) => (
                                        <option key={cls._id} value={cls._id}>{cls.sclassName}</option>
                                    ))}
                                </select>
                            </div>

                            <button 
                                onClick={fetchAdmitCards}
                                disabled={!selectedExamGroup || !selectedClass || loading}
                                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 text-sm font-medium transition-all shadow-sm active:scale-95"
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
                                    <Printer className="w-4 h-4" /> Print
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {students.length > 0 ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-gray-500 bg-purple-50 px-4 py-2 rounded-lg border border-purple-100">
                             <span className="flex items-center gap-2">
                                <CalendarClock className="w-4 h-4" />
                                Generated {students.length} admit cards for {getExamGroupName()}
                            </span>
                        </div>

                        <div className="bg-gray-200/80 p-8 rounded-xl border border-gray-300 overflow-auto shadow-inner">
                            <div ref={componentRef} className="flex flex-col gap-8 p-8 max-w-[210mm] mx-auto bg-white min-h-[297mm]">
                                
                                {students.map((student) => (
                                    <div key={student._id} className="border-2 border-black rounded-none p-0 overflow-hidden page-break-inside-avoid relative">
                                        {/* Watermark */}
                                        {schoolInfo?.schoolLogo && (
                                            <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none">
                                                <img src={schoolInfo.schoolLogo.startsWith('http') ? schoolInfo.schoolLogo : `${API_URL}/${schoolInfo.schoolLogo}`} className="w-64 h-64 grayscale" />
                                            </div>
                                        )}

                                        {/* Header */}
                                        <div className="border-b-2 border-black p-4 flex gap-6 items-center bg-gray-50 relative z-10">
                                            {schoolInfo?.schoolLogo && (
                                                <img 
                                                    src={schoolInfo.schoolLogo.startsWith('http') ? schoolInfo.schoolLogo : `${API_URL}/${schoolInfo.schoolLogo}`} 
                                                    className="w-20 h-20 object-contain"
                                                    alt="Logo"
                                                />
                                            )}
                                            <div className="flex-1 text-center">
                                                <h2 className="text-3xl font-bold uppercase tracking-wide">{schoolInfo?.schoolName}</h2>
                                                <p className="text-sm font-medium mt-1">{schoolInfo?.address}</p>
                                                <div className="mt-3 flex items-center justify-center gap-3">
                                                    <span className="bg-black text-white px-6 py-1 text-sm font-bold uppercase tracking-widest">Admit Card</span>
                                                    <span className="font-bold text-lg uppercase border border-black px-4 py-0.5 bg-white">{getExamGroupName()}</span>
                                                </div>
                                            </div>
                                            <div className="w-24 h-28 border border-gray-400 bg-white shadow-sm p-1">
                                                {student.studentPhoto ? (
                                                    <img 
                                                        src={student.studentPhoto.startsWith('http') ? student.studentPhoto : `${API_URL}/${student.studentPhoto}`} 
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full text-[10px] flex items-center justify-center text-center text-gray-400 uppercase font-bold">Paste Photo</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Student Details */}
                                        <div className="p-4 grid grid-cols-2 gap-x-8 gap-y-3 text-sm border-b-2 border-black relative z-10">
                                            <div className="flex border-b border-dotted border-gray-400 pb-1">
                                                <span className="font-bold w-28 uppercase text-gray-600">Student Name:</span>
                                                <span className="font-bold text-lg">{student.name}</span>
                                            </div>
                                            <div className="flex border-b border-dotted border-gray-400 pb-1">
                                                <span className="font-bold w-28 uppercase text-gray-600">Class:</span>
                                                <span className="font-bold text-lg">{student.sclassName?.sclassName}</span>
                                            </div>
                                            <div className="flex border-b border-dotted border-gray-400 pb-1">
                                                <span className="font-bold w-28 uppercase text-gray-600">Roll Number:</span>
                                                <span className="font-bold text-lg">{student.rollNum}</span>
                                            </div>
                                            <div className="flex border-b border-dotted border-gray-400 pb-1">
                                                <span className="font-bold w-28 uppercase text-gray-600">Father Name:</span>
                                                <span className="font-bold text-lg">{student.fatherName}</span>
                                            </div>
                                        </div>

                                        {/* Schedule Table */}
                                        <div className="p-4 relative z-10">
                                            <table className="w-full border-collapse border border-black text-sm text-center">
                                                <thead>
                                                    <tr className="bg-gray-100">
                                                        <th className="border border-black p-2 w-1/4">Date</th>
                                                        <th className="border border-black p-2 w-1/4">Time</th>
                                                        <th className="border border-black p-2 w-1/4">Subject</th>
                                                        <th className="border border-black p-2 w-1/4">Sign</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {examSchedules.map((exam, idx) => (
                                                        <tr key={idx}>
                                                            <td className="border border-black p-2 font-medium">{new Date(exam.examDate).toLocaleDateString()}</td>
                                                            <td className="border border-black p-2">{exam.startTime} - {exam.endTime}</td>
                                                            <td className="border border-black p-2 font-bold uppercase">{exam.subject?.subName || 'Subject'}</td>
                                                            <td className="border border-black p-2"></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Footer Instructions */}
                                        <div className="p-4 pt-2 text-xs text-gray-700 relative z-10">
                                            <p className="font-bold mb-1 uppercase text-gray-500">Important Instructions:</p>
                                            <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                                                <li>Candidate must carry this Admit Card to the examination center.</li>
                                                <li>Please verify your details and subjects before the examination.</li>
                                                <li>Mobile phones and electronic gadgets are strictly prohibited.</li>
                                                <li>Reporting time is 15 minutes before the scheduled time.</li>
                                            </ul>
                                            
                                            <div className="flex justify-between mt-12 px-8">
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="w-40 border-b border-black"></div>
                                                    <span className="font-bold uppercase text-[10px]">Class Teacher Signature</span>
                                                </div>
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="w-40 border-b border-black"></div>
                                                    <span className="font-bold uppercase text-[10px]">Principal Signature</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-2xl border border-dashed border-gray-300 shadow-xs">
                        <div className="bg-purple-50 p-6 rounded-full mb-4">
                            <FileBadge className="w-12 h-12 text-purple-400 opacity-80" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Generate Admit Cards</h3>
                        <p className="text-gray-500 max-w-sm mt-2 mb-8">Select an Exam Group and Class to generate printable hall tickets with schedules.</p>
                        <div className="h-1 w-24 bg-purple-100 rounded-full"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdmitCard;
