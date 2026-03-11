import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { formatDateTime } from '@/utils/formatDateTime';
import {
    ArrowLeft, Pencil, Phone, Mail, MapPin, Calendar, User,
    Users, BookOpen, Heart, Bus, GraduationCap, Droplets,
    Ruler, Weight, Building2, UserCircle2,
    CreditCard, ClipboardList, FileText, CheckCircle2,
    XCircle, Clock, TrendingUp, AlertCircle, Upload
} from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import API_URL from '@/config/api';
const API_BASE = API_URL;

// Helper: Info Row
const InfoRow = ({ label, value }) => (
    <div className="flex items-start gap-3 py-2">
        <div className="flex items-center gap-2 w-36 shrink-0">
            <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        <span className="text-sm font-medium flex-1">{value || 'N/A'}</span>
    </div>
);

// Section Header
// eslint-disable-next-line no-unused-vars
const SectionHeader = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
        </div>
        <h3 className="font-semibold text-base">{title}</h3>
    </div>
);

const StudentDetailPage = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { setExtraBreadcrumb } = useOutletContext() || {};

    const [student, setStudent] = useState(null);
    const [siblings, setSiblings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fees, setFees] = useState([]);
    const [examResults, setExamResults] = useState([]);
    const [feesLoading, setFeesLoading] = useState(false);
    const [examLoading, setExamLoading] = useState(false);

    useEffect(() => {
        if (studentId) fetchStudent();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [studentId]);

    const fetchStudent = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/Student/${studentId}`);
            const data = res.data;
            setStudent(data);

            // Set breadcrumb: Class > Student Name
            if (setExtraBreadcrumb) {
                const className = data.sclassName?.sclassName || '';
                setExtraBreadcrumb(
                    className ? `${className} › ${data.name}` : data.name
                );
            }

            // Fetch fees
            try {
                setFeesLoading(true);
                const feeRes = await axios.get(`${API_BASE}/StudentFees/${studentId}`);
                setFees(Array.isArray(feeRes.data) ? feeRes.data : feeRes.data?.fees || []);
            } catch { setFees([]); } finally { setFeesLoading(false); }

            // Fetch exam results
            try {
                setExamLoading(true);
                const examRes = await axios.get(`${API_BASE}/ExamResults/Student/${studentId}`);
                setExamResults(Array.isArray(examRes.data) ? examRes.data : []);
            } catch { setExamResults([]); } finally { setExamLoading(false); }

            // Fetch siblings - same father phone => siblings
            if (data?.father?.phone && currentUser?._id) {
                try {
                    const allRes = await axios.get(`${API_BASE}/Students/${currentUser._id}`);
                    const all = Array.isArray(allRes.data) ? allRes.data : [];
                    const sibs = all.filter(
                        s => s._id !== data._id && s.father?.phone === data.father?.phone
                    );
                    setSiblings(sibs);
                } catch {
                    // silently ignore sibling fetch error
                }
            }
        } catch (err) {
            console.error('Error fetching student:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => navigate(-1);

    if (loading) {
        return (
            <div className="flex-1 p-8 pt-6 space-y-6">
                <Skeleton className="h-8 w-32" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-80 rounded-xl" />
                    <Skeleton className="h-80 rounded-xl lg:col-span-2" />
                </div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center space-y-3">
                    <UserCircle2 className="h-16 w-16 text-muted-foreground mx-auto" />
                    <h3 className="text-xl font-semibold">Student Not Found</h3>
                    <Button onClick={handleBack} variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
                    </Button>
                </div>
            </div>
        );
    }

    const isActive = student.status === 'Active' || !student.status;

    return (
        <div className="flex-1 space-y-6 p-6 pt-4">
            {/* Top Bar */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={handleBack} className="gap-2 -ml-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Students
                </Button>
                <div className="flex items-center gap-2">
                    {currentUser?.userType !== 'teacher' && (
                        <Button 
                            onClick={() => {
                                const basePath = window.location.pathname.startsWith('/accountant') ? '/accountant' : '/admin';
                                navigate(`${basePath}/fee-collection/${student._id}`);
                            }} 
                            className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all"
                        >
                            <CreditCard className="h-4 w-4" />
                            Collect Fee
                        </Button>
                    )}
                    <Button onClick={() => navigate(`/admin/admission?edit=${student._id}`)} className="gap-2">
                        <Pencil className="h-4 w-4" />
                        Edit Student
                    </Button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ─── Left Column: Profile Card ─── */}
                <div className="space-y-4">
                    <Card className="overflow-hidden">
                        {/* Gradient Banner */}
                        <div className="h-24 bg-gradient-to-br from-primary/30 via-primary/15 to-background relative">
                            <div className="absolute top-3 right-3">
                                <Badge className={isActive
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border-0'
                                    : 'bg-gray-100 text-gray-600 border-0'
                                }>
                                    {student.status || 'Active'}
                                </Badge>
                            </div>
                        </div>

                        <CardContent className="pt-0">
                            {/* Avatar */}
                            <div className="flex flex-col items-center -mt-12 mb-4">
                                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                                    <AvatarImage src={`${API_BASE}/${student.studentPhoto}`} className="object-cover" />
                                    <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                                        {student.name?.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <h2 className="text-xl font-bold mt-3">{student.name}</h2>
                                <div className="flex gap-2 mt-2 flex-wrap justify-center">
                                    <Badge variant="outline" className="font-mono">{student.admissionNum || 'N/A'}</Badge>
                                    <Badge variant="outline">Roll: {student.rollNum}</Badge>
                                    <Badge variant="secondary">
                                        {student.sclassName?.sclassName || 'No Class'}
                                    </Badge>
                                    {student.section && (
                                        <Badge variant="outline">{student.section}</Badge>
                                    )}
                                </div>
                            </div>

                            <Separator className="my-3" />

                            {/* Quick Info */}
                            <div className="space-y-2 text-sm">
                                {student.mobileNumber && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="h-4 w-4" />
                                        <span>{student.mobileNumber}</span>
                                    </div>
                                )}
                                {student.email && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="h-4 w-4" />
                                        <span className="break-all">{student.email}</span>
                                    </div>
                                )}
                                {student.bloodGroup && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Droplets className="h-4 w-4" />
                                        <span>Blood Group: <strong className="text-foreground">{student.bloodGroup}</strong></span>
                                    </div>
                                )}
                                {student.house && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Building2 className="h-4 w-4" />
                                        <span>House: <strong className="text-foreground">{student.house}</strong></span>
                                    </div>
                                )}
                                {student.admissionDate && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        <span>Admitted: {formatDateTime(student.admissionDate)}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Physical Details Card */}
                    {(student.height || student.weight || student.bloodGroup) && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Physical Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 pt-0">
                                {student.height && (
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground"><Ruler className="h-4 w-4" /> Height</div>
                                        <span className="font-medium">{student.height} cm</span>
                                    </div>
                                )}
                                {student.weight && (
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground"><Weight className="h-4 w-4" /> Weight</div>
                                        <span className="font-medium">{student.weight} kg</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* ─── Right Column: All-in-One Tabs ─── */}
                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <CardContent className="pt-6">
                            <Tabs defaultValue="profile">
                                <TabsList className="flex flex-wrap gap-1 h-auto mb-5">
                                    <TabsTrigger value="profile" className="gap-1.5 text-xs">
                                        <User className="h-3.5 w-3.5" />Profile
                                    </TabsTrigger>
                                    <TabsTrigger value="fees" className="gap-1.5 text-xs">
                                        <CreditCard className="h-3.5 w-3.5" />Fees
                                    </TabsTrigger>
                                    <TabsTrigger value="exam" className="gap-1.5 text-xs">
                                        <ClipboardList className="h-3.5 w-3.5" />Exam Results
                                    </TabsTrigger>
                                    <TabsTrigger value="attendance" className="gap-1.5 text-xs">
                                        <CheckCircle2 className="h-3.5 w-3.5" />Attendance
                                    </TabsTrigger>
                                    <TabsTrigger value="documents" className="gap-1.5 text-xs">
                                        <FileText className="h-3.5 w-3.5" />Documents
                                    </TabsTrigger>
                                </TabsList>

                                {/* ── Profile Tab (Consolidated) ── */}
                                <TabsContent value="profile" className="space-y-6">
                                    <div>
                                        <SectionHeader icon={User} title="Personal Details" />
                                        <div className="divide-y">
                                            <InfoRow label="Admission No" value={student.admissionNum} />
                                            <InfoRow label="Full Name" value={student.name} />
                                            <InfoRow label="Gender" value={student.gender} />
                                            <InfoRow label="Date of Birth"
                                                value={student.dateOfBirth ? formatDateTime(student.dateOfBirth, { dateOnly: true }) : null} />
                                            <InfoRow label="Religion" value={student.religion} />
                                            <InfoRow label="Caste / Category" value={student.category || student.caste} />
                                            <InfoRow label="Address" value={student.address} />
                                            {student.height && <InfoRow label="Height" value={`${student.height} cm`} />}
                                            {student.weight && <InfoRow label="Weight" value={`${student.weight} kg`} />}
                                            {student.bloodGroup && <InfoRow label="Blood Group" value={student.bloodGroup} />}
                                            {student.house && <InfoRow label="House" value={student.house} />}
                                        </div>
                                    </div>

                                    <div>
                                        <SectionHeader icon={GraduationCap} title="Academic Information" />
                                        <div className="divide-y">
                                            <InfoRow label="Class" value={student.sclassName?.sclassName} />
                                            <InfoRow label="Section" value={student.section} />
                                            <InfoRow label="Roll Number" value={student.rollNum} />
                                            <InfoRow label="Admission Date"
                                                value={student.admissionDate ? formatDateTime(student.admissionDate) : null} />
                                            <InfoRow label="Status" value={
                                                <Badge className={isActive
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border-0'
                                                    : 'bg-gray-100 text-gray-600 border-0'
                                                }>
                                                    {student.status || 'Active'}
                                                </Badge>
                                            } />
                                        </div>
                                    </div>

                                    <div>
                                        <SectionHeader icon={Users} title="Parent / Guardian Information" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Father</p>
                                                <div className="divide-y">
                                                    <InfoRow label="Name" value={student.father?.name} />
                                                    <InfoRow label="Phone" value={student.father?.phone} />
                                                    <InfoRow label="Email" value={student.father?.email} />
                                                    <InfoRow label="CNIC" value={student.father?.cnic} />
                                                    <InfoRow label="Occupation" value={student.father?.occupation} />
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Mother</p>
                                                <div className="divide-y">
                                                    <InfoRow label="Name" value={student.mother?.name} />
                                                    <InfoRow label="Phone" value={student.mother?.phone} />
                                                    <InfoRow label="Email" value={student.mother?.email} />
                                                    <InfoRow label="CNIC" value={student.mother?.cnic} />
                                                    <InfoRow label="Occupation" value={student.mother?.occupation} />
                                                </div>
                                            </div>
                                        </div>
                                        {student.guardian?.name && (
                                            <>
                                                <Separator className="my-4" />
                                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Guardian</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="divide-y">
                                                        <InfoRow label="Name" value={student.guardian?.name} />
                                                        <InfoRow label="Relation" value={student.guardian?.relation} />
                                                        <InfoRow label="Phone" value={student.guardian?.phone} />
                                                    </div>
                                                    <div className="divide-y">
                                                        <InfoRow label="Occupation" value={student.guardian?.occupation} />
                                                        <InfoRow label="Email" value={student.guardian?.email} />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div>
                                        <SectionHeader icon={Bus} title="Transport Information" />
                                        {(student.transport?.route || student.transport?.pickupPoint) ? (
                                            <div className="divide-y">
                                                <InfoRow label="Route" value={student.transport?.route} />
                                                <InfoRow label="Pickup Point" value={student.transport?.pickupPoint} />
                                                <InfoRow label="Fees Month" value={student.transport?.feesMonth} />
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-6 text-muted-foreground gap-2 border rounded-lg bg-muted/20">
                                                <Bus className="h-8 w-8 opacity-30" />
                                                <p className="text-xs">No transport information</p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                {/* ── Fees Tab ── */}
                                <TabsContent value="fees">
                                    {feesLoading ? (
                                        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
                                    ) : fees.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                                            <CreditCard className="h-10 w-10 opacity-30" />
                                            <p className="text-sm">No fee records found</p>
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Fee Type</TableHead>
                                                    <TableHead>Amount</TableHead>
                                                    <TableHead>Due Date</TableHead>
                                                    <TableHead>Paid</TableHead>
                                                    <TableHead>Balance</TableHead>
                                                    <TableHead>Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {fees.map((fee, i) => {
                                                    const paid = fee.paidAmount || 0;
                                                    const total = fee.amount || fee.totalAmount || 0;
                                                    const balance = total - paid;
                                                    const isPaid = balance <= 0;
                                                    return (
                                                        <TableRow key={fee._id || i}>
                                                            <TableCell className="font-medium">{fee.feeType || fee.name || 'Fee'}</TableCell>
                                                            <TableCell>Rs. {total.toLocaleString()}</TableCell>
                                                            <TableCell>{fee.dueDate ? formatDateTime(fee.dueDate, { dateOnly: true }) : '–'}</TableCell>
                                                            <TableCell className="text-green-600">Rs. {paid.toLocaleString()}</TableCell>
                                                            <TableCell className={balance > 0 ? 'text-destructive font-semibold' : 'text-green-600'}>
                                                                Rs. {balance.toLocaleString()}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge className={isPaid
                                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0'
                                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0'
                                                                }>
                                                                    {isPaid ? <><CheckCircle2 className="h-3 w-3 mr-1 inline" />Paid</> : <><XCircle className="h-3 w-3 mr-1 inline" />Pending</>}
                                                                </Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    )}
                                </TabsContent>

                                {/* ── Exam Results Tab ── */}
                                <TabsContent value="exam">
                                    {examLoading ? (
                                        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
                                    ) : examResults.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                                            <ClipboardList className="h-10 w-10 opacity-30" />
                                            <p className="text-sm">No exam results found</p>
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Exam</TableHead>
                                                    <TableHead>Subject</TableHead>
                                                    <TableHead>Total</TableHead>
                                                    <TableHead>Obtained</TableHead>
                                                    <TableHead>%</TableHead>
                                                    <TableHead>Grade</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {examResults.map((result, i) => {
                                                    const pct = result.totalMarks
                                                        ? Math.round((result.marksObtained / result.totalMarks) * 100)
                                                        : null;
                                                    return (
                                                        <TableRow key={result._id || i}>
                                                            <TableCell className="font-medium">
                                                                {result.examSchedule?.examGroup?.name || result.examName || 'Exam'}
                                                            </TableCell>
                                                            <TableCell>{result.subject?.subName || result.subjectName || '–'}</TableCell>
                                                            <TableCell>{result.totalMarks ?? '–'}</TableCell>
                                                            <TableCell>{result.marksObtained ?? '–'}</TableCell>
                                                            <TableCell>
                                                                {pct !== null ? (
                                                                    <span className={pct >= 50 ? 'text-green-600 font-semibold' : 'text-destructive font-semibold'}>
                                                                        {pct}%
                                                                    </span>
                                                                ) : '–'}
                                                            </TableCell>
                                                            <TableCell>
                                                                {result.grade ? <Badge variant="outline">{result.grade}</Badge> : '–'}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    )}
                                </TabsContent>

                                {/* ── Attendance Tab ── */}
                                <TabsContent value="attendance">
                                    <div className="flex flex-col items-center justify-center py-10 gap-4">
                                        <div className="grid grid-cols-3 gap-4 w-full max-w-sm text-center">
                                            <div className="rounded-xl border p-4 space-y-1">
                                                <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto" />
                                                <p className="text-2xl font-bold text-green-600">–</p>
                                                <p className="text-xs text-muted-foreground">Present</p>
                                            </div>
                                            <div className="rounded-xl border p-4 space-y-1">
                                                <XCircle className="h-6 w-6 text-destructive mx-auto" />
                                                <p className="text-2xl font-bold text-destructive">–</p>
                                                <p className="text-xs text-muted-foreground">Absent</p>
                                            </div>
                                            <div className="rounded-xl border p-4 space-y-1">
                                                <Clock className="h-6 w-6 text-yellow-500 mx-auto" />
                                                <p className="text-2xl font-bold text-yellow-600">–</p>
                                                <p className="text-xs text-muted-foreground">Late</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                            <AlertCircle className="h-4 w-4" />
                                            <span>Attendance module coming soon</span>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* ── Documents Tab ── */}
                                <TabsContent value="documents">
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Student Photo', value: student.studentPhoto },
                                            { label: "Father's Photo", value: student.father?.photo },
                                            { label: "Mother's Photo", value: student.mother?.photo },
                                            { label: "Guardian's Photo", value: student.guardian?.photo },
                                        ].map(({ label, value }) => (
                                            <div key={label} className="flex items-center justify-between rounded-lg border px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                                    <span className="text-sm font-medium">{label}</span>
                                                </div>
                                                {value ? (
                                                    <a href={`${API_BASE}/${value}`} target="_blank" rel="noopener noreferrer">
                                                        <Button size="sm" variant="outline" className="gap-2">
                                                            <TrendingUp className="h-3 w-3" />View
                                                        </Button>
                                                    </a>
                                                ) : (
                                                    <Badge variant="outline" className="text-muted-foreground">Not uploaded</Badge>
                                                )}
                                            </div>
                                        ))}
                                        <div className="flex items-center gap-2 pt-2 text-muted-foreground text-xs">
                                            <Upload className="h-3 w-3" />
                                            <span>Upload more documents via Edit Student</span>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* ─── Siblings Section ─── */}
            {/* First check stored siblings array, then auto-detected by phone */}
            {(() => {
                const storedSiblings = student.siblings?.filter(s => s.name) || [];
                const allSiblings = [...siblings]; // auto-detected by phone

                if (storedSiblings.length === 0 && allSiblings.length === 0) return null;

                return (
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Heart className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-semibold">Siblings</h3>
                            <Badge variant="secondary">{storedSiblings.length + allSiblings.length}</Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                            {/* Stored siblings (from admission form) */}
                            {storedSiblings.map((sib, idx) => (
                                <Card key={`stored-${idx}`} className="overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="h-2 bg-gradient-to-r from-pink-400 to-purple-400" />
                                    <CardContent className="pt-4 pb-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback className="bg-pink-100 text-pink-700 font-bold">
                                                    {sib.name?.substring(0, 2).toUpperCase() || 'SB'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold text-sm">{sib.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {[sib.class, sib.section].filter(Boolean).join(' - ') || 'N/A'}
                                                </p>
                                                {sib.rollNum && (
                                                    <Badge variant="outline" className="text-xs mt-1">Roll: {sib.rollNum}</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {/* Auto-detected siblings (same school + same father phone) */}
                            {allSiblings.map((sib) => (
                                <Card
                                    key={`auto-${sib._id}`}
                                    className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer hover:border-primary/40"
                                    onClick={() => navigate(`/admin/students/${sib._id}`)}
                                >
                                    <div className="h-2 bg-gradient-to-r from-blue-400 to-indigo-400" />
                                    <CardContent className="pt-4 pb-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border">
                                                <AvatarImage src={`${API_BASE}/${sib.studentPhoto}`} className="object-cover" />
                                                <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                                                    {sib.name?.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold text-sm hover:text-primary transition-colors">{sib.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {sib.sclassName?.sclassName && `Class ${sib.sclassName.sclassName}`}
                                                    {sib.section && ` - ${sib.section}`}
                                                </p>
                                                <Badge variant="outline" className="text-xs mt-1">Roll: {sib.rollNum}</Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default StudentDetailPage;
