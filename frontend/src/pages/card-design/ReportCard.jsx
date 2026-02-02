import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Printer, Search, Filter, Download, FileText, User, ChevronDown, Loader2, Award, Eye } from 'lucide-react';
import CardRenderer from './CardRenderer';
import API_URL from '../../config/api';
import { useReactToPrint } from 'react-to-print';

const ReportCard = () => {
    const [loading, setLoading] = useState(false);

    // Data State
    const [classes, setClasses] = useState([]);
    const [examGroups, setExamGroups] = useState([]);
    const [students, setStudents] = useState([]);
    const [schoolInfo, setSchoolInfo] = useState(null);
    const [resultsData, setResultsData] = useState({}); // Map of studentId -> results

    // Selection State
    const [selectedExamGroup, setSelectedExamGroup] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Template State
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    // Manual Input State
    const [examDetails, setExamDetails] = useState({
        session: "2025-26",
        term: "Final Term"
    });

    const user = JSON.parse(localStorage.getItem('currentUser'));
    const schoolId = user?.schoolName ? user._id : user?.school;
    const componentRef = useRef();

    // Preview State
    const [previewStudent, setPreviewStudent] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    useEffect(() => {
        fetchInitialData();
        fetchTemplates();
    }, []);

    const openPreview = (e, student) => {
        e.stopPropagation(); // Prevent selection when clicking preview
        setPreviewStudent(student);
        setShowPreviewModal(true);
    };

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

    const fetchTemplates = async () => {
        try {
            const res = await axios.get(`${API_URL}/CardTemplate/${schoolId}`);
            // Filter for report cards
            const reportTemplates = res.data.filter(t => t.cardType === 'report' || t.cardType === 'result');
            setTemplates(reportTemplates);
            if (reportTemplates.length > 0) {
                setSelectedTemplate(reportTemplates[0]);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleGenerate = async () => {
        if (!selectedExamGroup || !selectedClass) return;
        setSelectAll(false);
        setSelectedStudents([]);
        setLoading(true);

        try {
            // Fetch students of the class
            const studentsRes = await axios.get(`${API_URL}/Sclass/Students/${selectedClass}`);
            const fetchedStudents = studentsRes.data;
            setStudents(fetchedStudents);

            // Fetch results for all students in this exam group
            // Ideally backend should provide a bulk endpoint, but for now we might have to fetch individually or use a specialized endpoint if available.
            // Assuming we have an endpoint to get results by exam group and class or similar.
            // If not, we will fetch results for each student. To optimize, let's assume we fetch all results for the exam group and filter.
            
            // NOTE: Using a hypothetical endpoint or logic based on existing controller.
            // Existing controller has: router.get('/ExamResults/Exam/:scheduleId', getResultsByExam); 
            // We need results by Exam Group for a Class. 
            // Let's iterate students and fetch results (not efficient but safe for now) OR creates a new endpoint.
            // For now, let's try to fetch all schedules for the group, then results for those schedules.
            
            // Alternative: let's modify the backend later if needed. For now, we will simulate or fetch per student if list is small.
            // actually, let's fetch schedules for the group first.
            const schedulesRes = await axios.get(`${API_URL}/ExamSchedules/Group/${selectedExamGroup}`);
            const schedules = schedulesRes.data;

            // Now fetch results for these schedules. 
            // This is getting complex. Let's look for a simpler "Get Student Results" approach.
            // router.get('/ExamResults/Student/:studentId', getResultsByStudent);
            
            const resultsMap = {};
            await Promise.all(fetchedStudents.map(async (student) => {
                const res = await axios.get(`${API_URL}/ExamResults/Student/${student._id}`);
                // Filter results that belong to the selected Exam Group
                // We need to know which schedules belong to the selected group.
                const relevantResults = res.data.filter(r => 
                    schedules.some(s => s._id === r.examSchedule._id)
                );
                
                resultsMap[student._id] = relevantResults;
            }));

            setResultsData(resultsMap);
            
            // Also get school info
            if (user._id) {
                 const adminRes = await axios.get(`${API_URL}/Admin/${user._id}`);
                 setSchoolInfo(adminRes.data);
            }

        } catch (error) {
            console.error("Error fetching report card data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter students
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

    const getExamGroupName = () => {
        return examGroups.find(g => g._id === selectedExamGroup)?.groupName || '';
    };

    // Helper to calculate totals
    const calculateStats = (studentId) => {
        const results = resultsData[studentId] || [];
        if (results.length === 0) return { total: 0, obtained: 0, percentage: 0, grade: 'N/A', status: 'N/A' };

        const total = results.reduce((acc, curr) => acc + (curr.examSchedule?.totalMarks || 0), 0);
        const obtained = results.reduce((acc, curr) => acc + curr.marksObtained, 0);
        const percentage = total > 0 ? ((obtained / total) * 100).toFixed(2) : 0;
        
        let grade = 'F';
        if (percentage >= 90) grade = 'A+';
        else if (percentage >= 80) grade = 'A';
        else if (percentage >= 70) grade = 'B';
        else if (percentage >= 60) grade = 'C';
        else if (percentage >= 50) grade = 'D';

        const status = percentage >= 33 ? 'PASS' : 'FAIL';

        return { total, obtained, percentage, grade, status, results };
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-md sticky top-4 z-10 mx-4 sm:mx-6 lg:mx-8 mt-4">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-100 p-2.5 rounded-lg">
                                <Award className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Result / Report Cards</h1>
                                <p className="text-sm text-gray-500">Generate academic reports</p>
                            </div>
                        </div>

                        {/* Toolbar */}
                        <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-lg border border-gray-200 flex-wrap">

                            {/* Template Selector */}
                            {templates.length > 0 ? (
                                <div className="relative">
                                    <FileText className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <select
                                        value={selectedTemplate?._id || ''}
                                        onChange={(e) => setSelectedTemplate(templates.find(t => t._id === e.target.value))}
                                        className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-orange-500 outline-none w-48 shadow-sm"
                                    >
                                        <option value="">{templates.length === 0 ? "No Report Templates" : "Select Template"}</option>
                                        {templates.map(t => (
                                            <option key={t._id} value={t._id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div className="text-xs text-red-500 font-medium px-2">
                                    No Templates
                                    </div>
                            )}

                            <div className="h-6 w-px bg-gray-300 mx-1 hidden md:block"></div>

                            {/* Exam Group */}
                            <div className="relative">
                                <Filter className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <select
                                    value={selectedExamGroup}
                                    onChange={(e) => setSelectedExamGroup(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-orange-500 outline-none w-40 shadow-sm"
                                >
                                    <option value="">Select Exam</option>
                                    {examGroups.map((g) => (
                                        <option key={g._id} value={g._id}>{g.groupName}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Class Filter */}
                            <div className="relative">
                                <Filter className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <select
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-orange-500 outline-none w-32 shadow-sm"
                                >
                                    <option value="">Class</option>
                                    {classes.map((cls) => (
                                        <option key={cls._id} value={cls._id}>{cls.sclassName}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={!selectedExamGroup || !selectedClass || loading}
                                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2 text-sm font-medium transition-all shadow-sm active:scale-95"
                            >
                                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Search className="w-4 h-4" />}
                                Generate
                            </button>

                            {filteredStudents.length > 0 && (
                                <>
                                    <div className="h-6 w-px bg-gray-300 mx-1 hidden md:block"></div>
                                    <button
                                        onClick={handlePrint}
                                        disabled={selectedStudents.length === 0}
                                        className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2 text-sm font-medium transition-all shadow-sm active:scale-95"
                                    >
                                        <Printer className="w-4 h-4" />
                                        <span>Print ({selectedStudents.length})</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content & List */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {filteredStudents.length > 0 ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-gray-500 bg-orange-50 px-4 py-2 rounded-lg border border-orange-100">
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={selectAll}
                                    onChange={handleSelectAll}
                                    className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                />
                                <span className="font-medium text-orange-700">Select All Students</span>
                            </label>
                            <span className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Found {filteredStudents.length} students
                            </span>
                        </div>
                        
                        <div className="bg-gray-200/80 p-8 rounded-xl border border-gray-300 overflow-y-auto max-h-[70vh] shadow-inner">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredStudents.map(student => {
                                    const stats = calculateStats(student._id);
                                    return (
                                        <div
                                            key={student._id}
                                            onClick={() => toggleSelection(student._id)}
                                            className={`
                                                relative p-3 rounded-lg border transition-all cursor-pointer group select-none flex flex-col gap-3 shadow-sm
                                                ${selectedStudents.includes(student._id) 
                                                ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500'
                                                : 'border-white hover:border-orange-300 hover:shadow-md bg-white'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                                                    {student.studentPhoto ? (
                                                        <img 
                                                            src={student.studentPhoto.startsWith('http') ? student.studentPhoto : `${API_URL}/${student.studentPhoto}`} 
                                                            alt="" 
                                                            className="w-full h-full object-cover" 
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <User size={16} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-sm font-semibold text-gray-900 truncate">{student.name}</h3>
                                                    <p className="text-xs text-gray-500 truncate">Roll: {student.rollNum}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => openPreview(e, student)}
                                                        className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-orange-600 hover:border-orange-300 transition shadow-sm z-10"
                                                        title="Preview Card"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                <div className={`
                                                    w-5 h-5 rounded-full border flex items-center justify-center transition-colors
                                                    ${selectedStudents.includes(student._id)
                                                        ? 'bg-orange-600 border-orange-600 text-white'
                                                        : 'border-gray-300 group-hover:border-orange-400'
                                                    }
                                                `}>
                                                    {selectedStudents.includes(student._id) && (
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                            </div>
                                            
                                            {/* Mini Result Stats */}
                                            <div className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded border border-gray-100">
                                                <div className="text-center">
                                                    <p className="text-gray-500">Marks</p>
                                                    <p className="font-bold text-gray-900">{stats.obtained}/{stats.total}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-gray-500">%</p>
                                                    <p className="font-bold text-gray-900">{stats.percentage}%</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-gray-500">Grade</p>
                                                    <p className={`font-bold ${stats.grade === 'F' ? 'text-red-600' : 'text-green-600'}`}>{stats.grade}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-2xl border border-dashed border-gray-300 shadow-xs">
                            <div className="bg-orange-50 p-6 rounded-full mb-4">
                                <Award className="w-12 h-12 text-orange-400 opacity-80" />
                        </div>
                            <h3 className="text-xl font-bold text-gray-900">Generate Report Cards</h3>
                            <p className="text-gray-500 max-w-sm mt-2 mb-8">Select Exam and Class from the options above to fetch results and generate reports.</p>
                            <div className="h-1 w-24 bg-orange-100 rounded-full"></div>
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
                                    .map(student => {
                                        const stats = calculateStats(student._id);
                                        return (
                                            <div key={student._id} style={{ breakInside: 'avoid', pageBreakInside: 'avoid', marginBottom: '10px' }}>
                                                <CardRenderer
                                                    template={selectedTemplate}
                                                    data={{
                                                        ...student,
                                                        class: classes.find(c => c._id === selectedClass)?.sclassName,
                                                        schoolName: schoolInfo?.schoolName,
                                                        address: schoolInfo?.address,
                                                        schoolLogo: schoolInfo?.schoolLogo,
                                                        // Result Specifics
                                                        examName: getExamGroupName(),
                                                        session: examDetails.session,
                                                        marksTable: stats.results, // Pass array of results for table rendering
                                                        percentage: stats.percentage + '%',
                                                        grade: stats.grade,
                                                        status: stats.status,
                                                        totalMarks: stats.total,
                                                        obtainedMarks: stats.obtained
                                                    }}
                                                    schoolData={schoolInfo}
                                                />
                                            </div>
                                        );
                                    })
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
                         <p className="text-xl font-bold text-red-600">Please select a Report Card Template to print.</p>
                    </div>
                )}

                {/* Preview Modal */}
                {showPreviewModal && previewStudent && selectedTemplate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowPreviewModal(false)}>
                        <div className="bg-white rounded-xl shadow-2xl max-w-4xl max-h-[90vh] overflow-hidden flex flex-col w-full" onClick={e => e.stopPropagation()}>
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-bold text-gray-900">Card Preview: {previewStudent.name}</h3>
                                <button onClick={() => setShowPreviewModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <div className="flex-1 overflow-auto p-8 bg-gray-100 flex items-center justify-center">
                                <div className="scale-[0.8] origin-center sm:scale-100 shadow-xl">
                                    <CardRenderer
                                        template={selectedTemplate}
                                        data={{
                                            ...previewStudent,
                                            class: classes.find(c => c._id === selectedClass)?.sclassName,
                                            schoolName: schoolInfo?.schoolName,
                                            address: schoolInfo?.address,
                                            schoolLogo: schoolInfo?.schoolLogo,
                                            examName: getExamGroupName(),
                                            session: examDetails.session,
                                            marksTable: calculateStats(previewStudent._id).results,
                                            percentage: calculateStats(previewStudent._id).percentage + '%',
                                            grade: calculateStats(previewStudent._id).grade,
                                            status: calculateStats(previewStudent._id).status,
                                            totalMarks: calculateStats(previewStudent._id).total,
                                            obtainedMarks: calculateStats(previewStudent._id).obtained
                                        }}
                                        schoolData={schoolInfo}
                                    />
                                </div>
                            </div>
                            <div className="p-4 border-t border-gray-100 flex justify-end">
                                <button onClick={() => setShowPreviewModal(false)} className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium">Close Preview</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportCard;
