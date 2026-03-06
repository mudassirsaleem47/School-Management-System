import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
    Printer, Search, Filter, CreditCard, User,
    Loader2, School, Check, UserCircle, X
} from 'lucide-react';
import AdmitCardLayout from '../../components/card-templates/AdmitCardLayout';
import API_URL from '../../config/api';
import { useReactToPrint } from 'react-to-print';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const PrintAdmitCard = () => {
    const [loading, setLoading] = useState(false);

    // Data State
    const [examGroups, setExamGroups] = useState([]);
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [examSchedule, setExamSchedule] = useState([]);
    const [schoolInfo, setSchoolInfo] = useState(null);

    // Selection State
    const [selectedExamGroup, setSelectedExamGroup] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Template State
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    // Single Print State
    const [singlePrintStudent, setSinglePrintStudent] = useState(null);

    const user = JSON.parse(localStorage.getItem('currentUser'));
    const schoolId = user?.schoolName ? user._id : user?.school;
    const componentRef = useRef();

    useEffect(() => {
        fetchExamGroups();
        fetchClasses();
        fetchTemplates();
    }, []);

    const fetchExamGroups = async () => {
        try {
            if (!schoolId) return;
            const response = await axios.get(`${API_URL}/ExamGroups/${schoolId}`);
            setExamGroups(response.data);
        } catch (error) {
            console.error("Error fetching exam groups:", error);
        }
    };

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
            const admitCardTemplates = res.data.filter(t => t.cardType === 'admit_card');
            setTemplates(admitCardTemplates);
            if (admitCardTemplates.length > 0) {
                setSelectedTemplate(admitCardTemplates[0]);
            }
        } catch (error) {
            console.error("Error fetching templates:", error);
        }
    };

    const handleFetchData = async () => {
        if (!selectedExamGroup || !selectedClass) return;

        setSelectAll(false);
        setSelectedStudents([]);
        setStudents([]);
        setExamSchedule([]);
        
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/AdmitCardData/${schoolId}/${selectedExamGroup}/${selectedClass}`);
            setSchoolInfo(response.data.school);
            setStudents(response.data.students);
            setExamSchedule(response.data.examSchedule);
        } catch (error) {
            console.error("Error fetching admit card data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if(selectedExamGroup && selectedClass) {
            handleFetchData();
        }
    }, [selectedExamGroup, selectedClass]);

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.rollNum && student.rollNum.toString().includes(searchQuery))
    );

    const handleSelectAll = (checked) => {
        if (!checked) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(filteredStudents.map(s => s._id));
        }
        setSelectAll(checked);
    };

    const toggleSelection = (id) => {
        if (selectedStudents.includes(id)) {
            setSelectedStudents(selectedStudents.filter(sid => sid !== id));
            setSelectAll(false);
        } else {
            setSelectedStudents([...selectedStudents, id]);
        }
    };

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Admit_Cards_${classes.find(c => c._id === selectedClass)?.sclassName || 'Export'}`,
    });

    const handleSinglePrint = (student) => {
        setSinglePrintStudent(student);
        // We use setTimeout to wait for state to update and re-render the single print area 
        setTimeout(() => {
            singlePrintRef.current();
        }, 100);
    };

    const handleSingleComponentPrint = useReactToPrint({
        contentRef: () => document.getElementById('single-print-container'),
        documentTitle: `Admit_Card_Individual`,
        onAfterPrint: () => setSinglePrintStudent(null)
    });

    // Create a local ref for single print trigger
    const singlePrintRef = useRef(handleSingleComponentPrint);
    useEffect(() => {
        singlePrintRef.current = handleSingleComponentPrint;
    }, [handleSingleComponentPrint]);

    const getExamGroupName = () => examGroups.find(g => g._id === selectedExamGroup)?.groupName || '';

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Print Admit Cards</h1>
                    <p className="text-muted-foreground mt-1">Generate and print admit cards for exams</p>
                </div>
            </div>

            <Card className="mb-8 border-border shadow-sm">
                <CardHeader className="pb-4 border-b bg-muted/20">
                    <CardTitle className="text-lg font-medium">
                        Admit Card Generation
                    </CardTitle>
                    <CardDescription>Select template and criteria to generate admit cards.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col lg:flex-row items-end gap-4">
                        <div className="w-full lg:w-1/5 space-y-2">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">Template</Label>
                            <Select
                                value={selectedTemplate?._id || ''}
                                onValueChange={(val) => setSelectedTemplate(templates.find(t => t._id === val))}
                            >
                                <SelectTrigger className="bg-background">
                                    <SelectValue placeholder="Select Template" />
                                </SelectTrigger>
                                <SelectContent>
                                    {templates.map(t => (
                                        <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                                    ))}
                                    {templates.length === 0 && <SelectItem value="none" disabled>No Templates Found</SelectItem>}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-full lg:w-1/5 space-y-2">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">Exam Group</Label>
                            <Select value={selectedExamGroup} onValueChange={setSelectedExamGroup}>
                                <SelectTrigger className="bg-background">
                                    <SelectValue placeholder="Select Exam" />
                                </SelectTrigger>
                                <SelectContent>
                                    {examGroups.map((g) => (
                                        <SelectItem key={g._id} value={g._id}>{g.groupName} ({g.academicYear})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-full lg:w-1/5 space-y-2">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">Class</Label>
                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                                <SelectTrigger className="bg-background">
                                    <SelectValue placeholder="Select Class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map((c) => (
                                        <SelectItem key={c._id} value={c._id}>{c.sclassName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-full lg:w-1/5 space-y-2">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">Search</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Name or Roll No..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 bg-background"
                                />
                            </div>
                        </div>

                        <div className="w-full lg:w-1/5">
                            <Button onClick={handlePrint} disabled={selectedStudents.length === 0 || !selectedTemplate} className="w-full" size="lg">
                                <Printer /> Print {selectedStudents.length > 0 && `(${selectedStudents.length})`}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {selectedClass && selectedExamGroup ? (
                <div className="space-y-6 animate-in fade-in-50 duration-500">
                    <Card className="border-border shadow-sm">
                        <CardHeader className="py-4 px-6 flex flex-row items-center justify-between space-y-0 bg-muted/40 border-b">
                            <div className="flex items-center gap-4">
                                <Badge variant="secondary" className="font-normal text-muted-foreground">
                                    {filteredStudents.length} Students
                                </Badge>
                                {examSchedule.length === 0 && (
                                    <Badge variant="destructive" className="ml-2">
                                        No Exam Schedule Found
                                    </Badge>
                                )}
                            </div>
                            <div className="flex gap-2">
                                {selectedStudents.length > 0 && (
                                    <Badge variant="default" className="bg-primary text-primary-foreground flex flex-col justify-center">
                                        {selectedStudents.length} Selected
                                    </Badge>
                                )}
                                <Button onClick={handlePrint} disabled={selectedStudents.length === 0 || !selectedTemplate} size="sm">
                                    <Printer className="w-4 h-4 mr-2" /> Print Bulk
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent className="p-6">
                            {loading ? (
                                <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
                                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                                    <p>Loading admit card data...</p>
                                </div>
                            ) : filteredStudents.length === 0 ? (
                                <div className="h-64 flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                                    <UserCircle className="w-12 h-12 mb-2 opacity-50" />
                                    <p>No students found.</p>
                                </div>
                            ) : (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader className="bg-muted/50">
                                            <TableRow>
                                                <TableHead className="w-[50px]">
                                                    <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} />
                                                </TableHead>
                                                <TableHead>Photo</TableHead>
                                                <TableHead>Student Name</TableHead>
                                                <TableHead>Roll Number</TableHead>
                                                <TableHead>Gender</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredStudents.map(student => (
                                                <TableRow key={student._id}>
                                                    <TableCell>
                                                        <Checkbox 
                                                            checked={selectedStudents.includes(student._id)}
                                                            onCheckedChange={() => toggleSelection(student._id)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="w-10 h-10 rounded-full overflow-hidden border bg-muted">
                                                            {student.studentPhoto ? (
                                                                <img src={student.studentPhoto.startsWith('http') ? student.studentPhoto : `${API_URL}/${student.studentPhoto}`} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center"><User className="h-5 w-5 text-muted-foreground" /></div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-semibold">{student.name}</TableCell>
                                                    <TableCell><span className="font-mono text-muted-foreground">{student.rollNum}</span></TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{student.gender || 'N/A'}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="outline" size="sm" onClick={() => handleSinglePrint(student)} disabled={!selectedTemplate}>
                                                            <Printer className="w-4 h-4 mr-2" /> Print
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
                </div>
            ) : (
                <Card className="border-dashed shadow-none bg-muted/30">
                    <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="bg-background p-4 rounded-full shadow-sm mb-4">
                            <School className="w-12 h-12 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Ready to Load Students</h3>
                        <p className="text-muted-foreground max-w-sm">
                            Select an Exam Group and Class to start generating Admit Cards.
                        </p>
                    </CardContent>
                </Card>
            )}

            <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
                <div ref={componentRef}>
                    {selectedStudents.length > 0 && selectedTemplate ? (
                        <div className="print-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', padding: '20px' }}>
                            <style>
                                {`
                                    @media print {
                                        @page { margin: 0.5cm; size: auto; }
                                        body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                                        .print-container { gap: 10px; }
                                        .exam-table-print { font-size: 10px; width: 100%; border-collapse: collapse; }
                                        .exam-table-print th, .exam-table-print td { border: 1px solid #000; padding: 2px 4px; text-align: left; }
                                        .exam-table-print th { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; }
                                    }
                                `}
                            </style>
                            {filteredStudents
                                .filter(s => selectedStudents.includes(s._id))
                                .map(student => {
                                    // Configuration is saved as a JSON string in elements
                                    let parsedConfig = {};
                                    try {
                                        if (selectedTemplate?.elements) {
                                            parsedConfig = typeof selectedTemplate.elements === 'string' 
                                                ? JSON.parse(selectedTemplate.elements) 
                                                : selectedTemplate.elements;
                                        }
                                    } catch (e) {
                                        console.error("Failed to parse config for printing", e);
                                    }

                                    return (
                                        <div key={student._id} style={{ breakInside: 'avoid', pageBreakInside: 'avoid', marginBottom: '10px' }}>
                                            <AdmitCardLayout
                                                config={parsedConfig}
                                                student={{
                                                    ...student,
                                                    sclassName: classes.find(c => c._id === selectedClass), // pass whole object
                                                }}
                                                examSchedule={examSchedule}
                                            />
                                        </div>
                                    )
                                })
                            }
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Hidden container for single printing */}
            <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
                <div id="single-print-container">
                    {singlePrintStudent && selectedTemplate ? (
                        <div className="print-container" style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
                            <style>
                                {`
                                    @media print {
                                        @page { margin: 0.5cm; size: auto; }
                                        body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                                        .exam-table-print { font-size: 10px; width: 100%; border-collapse: collapse; }
                                        .exam-table-print th, .exam-table-print td { border: 1px solid #000; padding: 2px 4px; text-align: left; }
                                        .exam-table-print th { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; }
                                    }
                                `}
                            </style>
                            <div style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                                <AdmitCardLayout
                                    config={(() => {
                                        try {
                                            if (!selectedTemplate?.elements) return {};
                                            return typeof selectedTemplate.elements === 'string' 
                                                ? JSON.parse(selectedTemplate.elements) 
                                                : selectedTemplate.elements;
                                        } catch (e) {
                                            return {};
                                        }
                                    })()}
                                    student={{
                                        ...singlePrintStudent,
                                        sclassName: classes.find(c => c._id === selectedClass),
                                    }}
                                    examSchedule={examSchedule}
                                />
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>

            {!selectedTemplate && selectedStudents.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-y-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <div className="bg-destructive text-destructive-foreground px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
                        <X className="w-5 h-5" />
                        <span className="font-medium">Please select a template to print admit cards</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PrintAdmitCard;
