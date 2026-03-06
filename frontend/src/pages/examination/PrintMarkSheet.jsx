import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { Printer, Loader2, X } from 'lucide-react';
import MarkSheetLayout from '../../components/card-templates/MarkSheetLayout';
import API_URL from '../../config/api';
import { useReactToPrint } from 'react-to-print';

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const PrintMarkSheet = () => {
    const [loading, setLoading] = useState(false);
    const [printLoading, setPrintLoading] = useState(false);

    // Data
    const [examGroups, setExamGroups] = useState([]);
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [templates, setTemplates] = useState([]);

    // Selections
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    // Multi-term selection: [{_id, groupName, academicYear}]
    const [selectedTerms, setSelectedTerms] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    // Print data
    const [printData, setPrintData] = useState([]); // [{student, terms:[{termName, resultDate, results:[]}]}]

    const user = JSON.parse(localStorage.getItem('currentUser'));
    const schoolId = user?.schoolName ? user._id : user?.school;

    const bulkPrintRef = useRef();

    // ===== Fetch initial data =====
    useEffect(() => {
        fetchExamGroups();
        fetchClasses();
        fetchTemplates();
    }, []);

    useEffect(() => {
        if (selectedClass) fetchStudents();
        else { setStudents([]); setSelectedStudents([]); }
    }, [selectedClass]);

    const fetchExamGroups = async () => {
        try {
            const res = await axios.get(`${API_URL}/ExamGroups/${schoolId}`);
            setExamGroups(res.data);
        } catch (e) { console.error(e); }
    };
    const fetchClasses = async () => {
        try {
            const res = await axios.get(`${API_URL}/Sclasses/${schoolId}`);
            setClasses(res.data);
        } catch (e) { console.error(e); }
    };
    const fetchTemplates = async () => {
        try {
            const res = await axios.get(`${API_URL}/CardTemplate/${schoolId}`);
            setTemplates(res.data.filter(t => t.cardType === 'mark_sheet'));
        } catch (e) { console.error(e); }
    };

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/Students/${schoolId}`);
            const all = Array.isArray(res.data) ? res.data : [];
            const filtered = all.filter(s => {
                const cId = s.sclassName?._id || s.sclassName;
                return String(cId) === selectedClass;
            });
            setStudents(filtered);
            setSelectedStudents([]);
            setSelectAll(false);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    // ===== Term toggle =====
    const toggleTerm = (group) => {
        setSelectedTerms(prev => {
            const exists = prev.some(t => t._id === group._id);
            return exists ? prev.filter(t => t._id !== group._id) : [...prev, group];
        });
    };

    // ===== Select all students =====
    const handleSelectAll = (checked) => {
        setSelectAll(checked);
        setSelectedStudents(checked ? students.map(s => s._id) : []);
    };
    const handleSelectStudent = (id, checked) => {
        setSelectedStudents(prev => checked ? [...prev, id] : prev.filter(x => x !== id));
    };

    // ===== Fetch results for a student per term =====
    const fetchResultsForTerm = async (studentId, groupId) => {
        try {
            const res = await axios.get(`${API_URL}/ExamResults/Student/${studentId}`);
            const all = Array.isArray(res.data) ? res.data : [];
            return all.filter(r => {
                const gId = r.examSchedule?.examGroup?._id || r.examSchedule?.examGroup;
                return String(gId) === String(groupId);
            });
        } catch (e) {
            console.error(e);
            return [];
        }
    };

    // ===== Print =====
    const handlePrint = useReactToPrint({ contentRef: bulkPrintRef });

    const preparePrintData = async () => {
        if (selectedStudents.length === 0) return;
        if (selectedTerms.length === 0) return;
        setPrintLoading(true);
        try {
            const printItems = await Promise.all(
                students
                    .filter(s => selectedStudents.includes(s._id))
                    .map(async (student) => {
                        const termsData = await Promise.all(
                            selectedTerms.map(async (group) => {
                                const rawResults = await fetchResultsForTerm(student._id, group._id);
                                const results = rawResults.map(r => ({
                                    subject: r.examSchedule?.subject || '-',
                                    totalMarks: r.totalMarks,
                                    passingMarks: r.examSchedule?.passingMarks,
                                    marksObtained: r.marksObtained,
                                    percentage: r.percentage,
                                    status: r.status,
                                }));
                                // Get result date from first result's schedule examDate
                                const resultDate = rawResults[0]?.examSchedule?.examDate || null;
                                return {
                                    termName: group.groupName,
                                    resultDate,
                                    results,
                                };
                            })
                        );
                        return { student, terms: termsData };
                    })
            );
            setPrintData(printItems);
            setTimeout(() => handlePrint(), 400);
        } catch (e) {
            console.error(e);
        } finally {
            setPrintLoading(false);
        }
    };

    const getConfigFromTemplate = () => {
        if (!selectedTemplate) return {};
        try {
            return typeof selectedTemplate.elements === 'string'
                ? JSON.parse(selectedTemplate.elements)
                : selectedTemplate.elements || {};
        } catch { return {}; }
    };

    const config = getConfigFromTemplate();

    return (
        <div className="flex-1 space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Print Mark Sheet</h1>
                <p className="text-muted-foreground">Select template, terms, and class — then print mark sheets.</p>
            </div>

            {/* ===== CRITERIA SECTION ===== */}
            <Card>
                <CardHeader>
                    <CardTitle>Select Criteria</CardTitle>
                    <CardDescription>Choose template, class, and one or more exam terms</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Row 1: Template + Class */}
                    <div className="flex flex-wrap gap-4">
                        <div className="grid items-center gap-1.5 w-64">
                            <Label>Template</Label>
                            <Select value={selectedTemplate?._id || ''} onValueChange={(val) => setSelectedTemplate(templates.find(t => t._id === val) || null)}>
                                <SelectTrigger><SelectValue placeholder="Select Template" /></SelectTrigger>
                                <SelectContent>
                                    {templates.length === 0 && <SelectItem value="__none" disabled>No mark sheet templates saved</SelectItem>}
                                    {templates.map(t => <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid items-center gap-1.5 w-64">
                            <Label>Class</Label>
                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                                <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                                <SelectContent>
                                    {classes.map(c => <SelectItem key={c._id} value={c._id}>{c.sclassName}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Row 2: Multi-term checkboxes */}
                    <div>
                        <Label className="mb-2 block">Select Terms to Include in Mark Sheet</Label>
                        <div className="flex flex-wrap gap-3">
                            {examGroups.map(g => {
                                const isSelected = selectedTerms.some(t => t._id === g._id);
                                return (
                                    <div
                                        key={g._id}
                                        onClick={() => toggleTerm(g)}
                                        className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer transition-colors select-none
                                            ${isSelected ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'}`}
                                    >
                                        <Checkbox checked={isSelected} onCheckedChange={() => toggleTerm(g)} onClick={e => e.stopPropagation()} />
                                        <span className="text-sm font-medium">{g.groupName}</span>
                                        <Badge variant="outline" className="text-xs">{g.academicYear}</Badge>
                                    </div>
                                );
                            })}
                        </div>
                        {selectedTerms.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-2">
                                Selected: {selectedTerms.map(t => t.groupName).join(' → ')}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* ===== STUDENTS TABLE ===== */}
            {students.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Students</CardTitle>
                                <CardDescription>{students.length} students • {selectedStudents.length} selected • {selectedTerms.length} term(s)</CardDescription>
                            </div>
                            <Button
                                disabled={selectedStudents.length === 0 || selectedTerms.length === 0 || !selectedTemplate || printLoading}
                                onClick={preparePrintData}
                            >
                                {printLoading
                                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Preparing...</>
                                    : <><Printer className="w-4 h-4 mr-2" /> Print ({selectedStudents.length})</>
                                }
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12">
                                                <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} />
                                            </TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Roll No.</TableHead>
                                            <TableHead>Admission No.</TableHead>
                                            <TableHead className="text-right">Quick Print</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {students.map(student => (
                                            <TableRow key={student._id}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedStudents.includes(student._id)}
                                                        onCheckedChange={(chk) => handleSelectStudent(student._id, chk)}
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium">{student.name}</TableCell>
                                                <TableCell>{student.rollNum}</TableCell>
                                                <TableCell>{student.admissionId || student.admissionNo || '-'}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button size="sm" variant="outline"
                                                        disabled={selectedTerms.length === 0 || !selectedTemplate || printLoading}
                                                        onClick={async () => {
                                                            await handleSelectStudent(student._id, true);
                                                            // Single student print
                                                            setPrintLoading(true);
                                                            try {
                                                                const termsData = await Promise.all(
                                                                    selectedTerms.map(async (group) => {
                                                                        const rawResults = await fetchResultsForTerm(student._id, group._id);
                                                                        return {
                                                                            termName: group.groupName,
                                                                            resultDate: rawResults[0]?.examSchedule?.examDate || null,
                                                                            results: rawResults.map(r => ({
                                                                                subject: r.examSchedule?.subject || '-',
                                                                                totalMarks: r.totalMarks,
                                                                                passingMarks: r.examSchedule?.passingMarks,
                                                                                marksObtained: r.marksObtained,
                                                                                percentage: r.percentage,
                                                                                status: r.status,
                                                                            })),
                                                                        };
                                                                    })
                                                                );
                                                                setPrintData([{ student, terms: termsData }]);
                                                                setTimeout(() => handlePrint(), 400);
                                                            } finally { setPrintLoading(false); }
                                                        }}
                                                    >
                                                        <Printer className="w-3 h-3 mr-1" /> Print
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* ===== HIDDEN PRINT AREA ===== */}
            <div style={{ display: 'none' }}>
                <div ref={bulkPrintRef}>
                    {printData.map((item, i) => (
                        <div key={i} style={{ pageBreakAfter: i < printData.length - 1 ? 'always' : 'auto' }}>
                            <MarkSheetLayout
                                config={config}
                                student={item.student}
                                terms={item.terms}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PrintMarkSheet;
