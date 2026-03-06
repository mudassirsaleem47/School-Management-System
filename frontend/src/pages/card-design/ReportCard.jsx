import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
    Printer, Search, Filter, FileText, User,
    Loader2, Award, Eye, CheckCircle2, GraduationCap, X, RotateCcw
} from 'lucide-react';
import CardRenderer from './CardRenderer';
import API_URL from '../../config/api';
import { useReactToPrint } from 'react-to-print';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from "@/components/ui/card";

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

            // Fetch school info
            if (user._id) {
                const adminRes = await axios.get(`${API_URL}/Admin/${user._id}`);
                setSchoolInfo(adminRes.data);
            }
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
            // Fetch all students for the school and filter by class
            const studentsRes = await axios.get(`${API_URL}/Students/${schoolId}`);
            const allStudents = Array.isArray(studentsRes.data) ? studentsRes.data : [];

            // Filter for selectedClass
            const fetchedStudents = allStudents.filter(s => {
                const cId = s.sclassName?._id || s.sclassName;
                return String(cId) === String(selectedClass);
            });

            // Fetch schedules for the group first.
            const schedulesRes = await axios.get(`${API_URL}/ExamSchedules/Group/${selectedExamGroup}`);
            const schedules = schedulesRes.data;

            const resultsMap = {};
            await Promise.all(fetchedStudents.map(async (student) => {
                try {
                    const res = await axios.get(`${API_URL}/ExamResults/Student/${student._id}`);
                    // Filter results that belong to the selected Exam Group
                    const relevantResults = res.data.filter(r => {
                        if (!r.examSchedule) return false;
                        const scheduleId = r.examSchedule._id || r.examSchedule;
                        return schedules.some(s => s._id === scheduleId);
                    });

                    resultsMap[student._id] = relevantResults;
                } catch (err) {
                    console.error(`Error fetching results for student ${student.name}:`, err);
                    resultsMap[student._id] = [];
                }
            }));

            setStudents(fetchedStudents);
            setResultsData(resultsMap);

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
    const handleSelectAll = (checked) => {
        if (!checked) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(filteredStudents.map(s => s._id));
        }
        setSelectAll(checked);
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
        if (results.length === 0) return { total: 0, obtained: 0, percentage: 0, grade: 'N/A', status: 'N/A', results: [] };

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
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Report Cards</h1>
                        <p className="text-muted-foreground mt-1">Generate and print academic report cards</p>
                    </div>
                </div>
            </div>

            {/* Controls Section */}
            <Card className="mb-8 border-border shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Report Configuration
                    </CardTitle>
                    <CardDescription>Select exam group and class to generate reports</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col lg:flex-row items-end gap-6">

                        {/* Template Selector */}
                        <div className="w-full lg:w-1/4 space-y-2">
                            <Label htmlFor="template-select" className="text-xs font-semibold uppercase text-muted-foreground">Template</Label>
                            <Select
                                value={selectedTemplate?._id || ''}
                                onValueChange={(val) => setSelectedTemplate(templates.find(t => t._id === val))}
                            >
                                <SelectTrigger id="template-select" className="bg-background">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <FileText className="w-4 h-4" />
                                        <SelectValue placeholder="Select Template">
                                            <span className="text-foreground">{selectedTemplate?.name || "Select Template"}</span>
                                        </SelectValue>
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    {templates.map(t => (
                                        <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Exam Group Selector */}
                        <div className="w-full lg:w-1/4 space-y-2">
                            <Label htmlFor="exam-select" className="text-xs font-semibold uppercase text-muted-foreground">Exam Group</Label>
                            <Select
                                value={selectedExamGroup}
                                onValueChange={setSelectedExamGroup}
                            >
                                <SelectTrigger id="exam-select" className="bg-background">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Award className="w-4 h-4" />
                                        <SelectValue placeholder="Select Exam">
                                            <span className="text-foreground">
                                                {examGroups.find(g => g._id === selectedExamGroup)?.groupName || "Select Exam"}
                                            </span>
                                        </SelectValue>
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    {examGroups.map((g) => (
                                        <SelectItem key={g._id} value={g._id}>{g.groupName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Class Selector */}
                        <div className="w-full lg:w-1/4 space-y-2">
                            <Label htmlFor="class-select" className="text-xs font-semibold uppercase text-muted-foreground">Class</Label>
                            <Select
                                value={selectedClass}
                                onValueChange={setSelectedClass}
                            >
                                <SelectTrigger id="class-select" className="bg-background">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Filter className="w-4 h-4" />
                                        <SelectValue placeholder="Select Class">
                                            <span className="text-foreground">
                                                {classes.find(cls => cls._id === selectedClass)?.sclassName || "Select Class"}
                                            </span>
                                        </SelectValue>
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map((cls) => (
                                        <SelectItem key={cls._id} value={cls._id}>{cls.sclassName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 w-full lg:w-1/4">
                            <Button
                                onClick={handleGenerate}
                                disabled={!selectedExamGroup || !selectedClass || loading}
                                className="flex-1"
                                size="lg"
                            >
                                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                                Generate 
                            </Button>

                            {filteredStudents.length > 0 && (
                                <Button
                                    onClick={handlePrint}
                                    disabled={selectedStudents.length === 0}
                                    variant="outline"
                                    size="lg"
                                    className="flex-1"
                                >
                                    <Printer className="w-4 h-4 mr-2" />
                                    Print
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Content & List */}
            {filteredStudents.length > 0 ? (
                <div className="space-y-6 animate-in slide-in-from-bottom-5 fade-in duration-500">
                    <Card className="border-border shadow-sm">
                        <CardHeader className="py-4 px-6 flex flex-row items-center justify-between space-y-0 bg-muted/40 border-b">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="select-all"
                                        checked={selectAll}
                                        onCheckedChange={handleSelectAll}
                                    />
                                    <Label htmlFor="select-all" className="cursor-pointer font-medium">
                                        Select All
                                    </Label>
                                </div>
                                <Separator orientation="vertical" className="h-4" />
                                <Badge variant="secondary" className="font-normal text-muted-foreground">
                                    {filteredStudents.length} Students Found
                                </Badge>
                            </div>
                            {selectedStudents.length > 0 && (
                                <Badge variant="default" className="bg-primary text-primary-foreground">
                                    {selectedStudents.length} Selected
                                </Badge>
                            )}
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                                {filteredStudents.map(student => {
                                    const stats = calculateStats(student._id);
                                    const isSelected = selectedStudents.includes(student._id);

                                    return (
                                        <Card 
                                            key={student._id}
                                            onClick={() => toggleSelection(student._id)}
                                            className={`
                                                cursor-pointer transition-all duration-200 border group overflow-hidden relative flex flex-col justify-between
                                                ${isSelected
                                                    ? 'border-primary ring-1 ring-primary shadow-md bg-primary/5'
                                                    : 'hover:border-primary/50 hover:shadow-lg'
                                                }
                                            `}
                                        >
                                            <CardContent className="p-4 space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full overflow-hidden border bg-muted shrink-0">
                                                        {student.studentPhoto ? (
                                                            <img
                                                                src={student.studentPhoto.startsWith('http') ? student.studentPhoto : `${API_URL}/${student.studentPhoto}`}
                                                                alt=""
                                                                className="w-full h-full object-cover" 
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.parentElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user h-12 w-12 text-muted-foreground p-2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <User className="h-6 w-6 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-sm truncate">{student.name}</h3>
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            Roll: <span className="font-mono text-foreground">{student.rollNum}</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Mini Stats Grid - Integrated into Card */}
                                                <div className="grid grid-cols-3 text-xs bg-card border rounded-md divide-x">
                                                    <div className="p-2 text-center">
                                                        <div className="text-[10px] uppercase text-muted-foreground font-semibold">Marks</div>
                                                        <div className="font-medium">{stats.obtained}/{stats.total}</div>
                                                    </div>
                                                    <div className="p-2 text-center">
                                                        <div className="text-[10px] uppercase text-muted-foreground font-semibold">%</div>
                                                        <div className="font-medium">{stats.percentage}%</div>
                                                    </div>
                                                    <div className="p-2 text-center">
                                                        <div className="text-[10px] uppercase text-muted-foreground font-semibold">Grade</div>
                                                        <div className={`font-bold ${stats.grade === 'F' ? 'text-destructive' : 'text-green-600'}`}>
                                                            {stats.grade}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>

                                            {/* Footer Actions */}
                                            <div className="bg-muted/20 p-2 flex justify-end border-t group-hover:bg-muted/40 transition-colors">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 w-7 rounded-full p-0"
                                                    onClick={(e) => openPreview(e, student)}
                                                    title="Preview Card"
                                                >
                                                    <Eye className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                </Button>
                                            </div>

                                            {/* Selection Indicator */}
                                            {isSelected && (
                                                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-0.5 border-2 border-background shadow-sm animate-in zoom-in-50">
                                                    <CheckCircle2 className="w-3 h-3" strokeWidth={3} />
                                                </div>
                                            )}
                                        </Card>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                    <Card className="border-dashed shadow-none bg-muted/30">
                        <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="bg-background p-4 rounded-full shadow-sm mb-4">
                                <GraduationCap className="w-12 h-12 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Ready to Generate Reports</h3>
                        <p className="text-muted-foreground max-w-sm">
                            Select an Exam Group and Class above to fetch results and generate comprehensive student report cards instantly.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Print Area - Hidden off-screen but rendered for react-to-print */}
            <div style={{ display: "none" }}>
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
                                                    marksTable: stats.results,
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
                        <div className="p-8 text-center text-destructive font-bold text-xl">
                            Please select students and a template to print.
                        </div>
                    )}
                </div>
            </div>

            {!selectedTemplate && selectedStudents.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-y-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <div className="bg-destructive text-destructive-foreground px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
                        <X className="w-5 h-5" />
                        <span className="font-medium">Please select a Report Card Template to print</span>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
                <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                    <DialogHeader className="p-6 border-b bg-background">
                        <DialogTitle className="flex items-center gap-2">
                            <Eye className="w-5 h-5 text-primary" />
                            Report Card Preview
                        </DialogTitle>
                        <DialogDescription>
                            Previewing report for <span className="font-medium text-foreground">{previewStudent?.name}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-auto p-8 bg-muted/40 flex items-center justify-center min-h-[400px]">
                        {previewStudent && selectedTemplate ? (
                            <div className="scale-[0.8] origin-center sm:scale-100 shadow-xl bg-white border ring-1 ring-border/50">
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
                        ) : (
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                <Loader2 className="w-10 h-10 animate-spin mb-2" />
                                <p>Loading Application Preview...</p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t bg-background flex justify-end gap-2">
                        <DialogClose asChild>
                            <Button variant="outline">Close Preview</Button>
                        </DialogClose>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ReportCard;
