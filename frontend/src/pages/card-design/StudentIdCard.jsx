import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
    Printer, Search, Filter, CreditCard, User,
    Loader2, School, Check, UserCircle, X, CheckSquare
} from 'lucide-react';
import CardRenderer from './CardRenderer';
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
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

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

    const handleClassChange = async (value) => {
        const classId = value;
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
        contentRef: componentRef,
        documentTitle: `Student_ID_Cards_${classes.find(c => c._id === selectedClass)?.sclassName || 'Export'}`,
    });

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Student ID Cards</h1>
                        <p className="text-muted-foreground mt-1">Generate and print identity cards for your students</p>
                    </div>
                </div>
            </div>

            {/* Controls Card */}
            <Card className="mb-8 border-border shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                        <Filter className="w-4 h-4 text-primary" />
                        Configuration
                    </CardTitle>
                    <CardDescription>Select template and class to generate cards</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col lg:flex-row items-end gap-6">

                        {/* Template Selector */}
                        <div className="w-full lg:w-1/4 space-y-2">
                            <Label htmlFor="template-select" className="text-xs font-semibold uppercase text-muted-foreground">Template</Label>
                            {templates.length > 0 ? (
                                <Select
                                    value={selectedTemplate?._id || ''}
                                    onValueChange={(val) => setSelectedTemplate(templates.find(t => t._id === val))}
                                >
                                    <SelectTrigger id="template-select" className="bg-background">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-muted-foreground" />
                                            <SelectValue placeholder="Select Template" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {templates.map(t => (
                                            <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                    <div className="h-10 flex items-center px-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                                    No Templates Found
                                    </div>
                            )}
                        </div>

                        {/* Class Selector */}
                        <div className="w-full lg:w-1/4 space-y-2">
                            <Label htmlFor="class-select" className="text-xs font-semibold uppercase text-muted-foreground">Class</Label>
                            <Select
                                value={selectedClass}
                                onValueChange={handleClassChange}
                            >
                                <SelectTrigger id="class-select" className="bg-background">
                                    <div className="flex items-center gap-2">
                                        <School className="w-4 h-4 text-muted-foreground" />
                                        <SelectValue placeholder="Select Class" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map((cls) => (
                                        <SelectItem key={cls._id} value={cls._id}>{cls.sclassName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Search */}
                        <div className="w-full lg:w-1/4 space-y-2">
                            <Label htmlFor="search-input" className="text-xs font-semibold uppercase text-muted-foreground">Search</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="search-input"
                                    type="text"
                                    placeholder="Name or Roll No..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 bg-background"
                                />
                            </div>
                        </div>

                        {/* Print Button */}
                        <div className="w-full lg:w-1/4">
                            <Button
                                onClick={handlePrint}
                                disabled={selectedStudents.length === 0}
                                className="w-full"
                                size="lg"
                            >
                                <Printer />
                                Print {selectedStudents.length > 0 && `(${selectedStudents.length})`}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Content Area */}
            {selectedClass ? (
                <div className="space-y-6 animate-in fade-in-50 duration-500">
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
                            {loading ? (
                                <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
                                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                                    <p>Loading class data...</p>
                                </div>
                            ) : filteredStudents.length === 0 ? (
                                    <div className="h-64 flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                                        <UserCircle className="w-12 h-12 mb-2 opacity-50" />
                                        <p>No students matching your search.</p>
                                </div>
                                ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                                            {filteredStudents.map(student => (
                                        <Card
                                            key={student._id}
                                            onClick={() => toggleSelection(student._id)}
                                            className={`
                                                cursor-pointer transition-all duration-200 border group overflow-hidden relative
                                                ${selectedStudents.includes(student._id)
                                                ? 'border-primary ring-1 ring-primary shadow-md bg-primary/5'
                                                : 'hover:border-primary/50 hover:shadow-sm'
                                                }
                                            `}
                                        >
                                            <CardContent className="p-4 flex items-center gap-4">
                                                <div className="relative">
                                                    <div className="w-12 h-12 rounded-full overflow-hidden border bg-muted">
                                                        {student.studentPhoto ? (
                                                            <img
                                                                src={student.studentPhoto.startsWith('http') ? student.studentPhoto : `${API_URL}/${student.studentPhoto}`}
                                                                alt=""
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.parentElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user h-6 w-6 text-muted-foreground"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <User className="h-6 w-6 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    {selectedStudents.includes(student._id) && (
                                                        <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5 border-2 border-background">
                                                            <Check className="w-3 h-3" strokeWidth={3} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-sm truncate">{student.name}</h3>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        Roll: <span className="font-mono text-foreground">{student.rollNum}</span>
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
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
                        <h3 className="text-xl font-semibold mb-2">Ready to Generate Cards</h3>
                        <p className="text-muted-foreground max-w-sm">
                            Please select a class from the configuration panel above to start generating student ID cards.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Print Area - Hidden off-screen */}
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
                        <span className="font-medium">Please select a template to print cards</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentIdCard;