import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
    BarChart3, Users, GraduationCap, BookOpen, DollarSign, TrendingUp,
    TrendingDown, Building, UserCheck, UserX, CalendarDays, Clock,
    Download, FileText, Printer, ArrowUpRight, ArrowDownRight,
    PieChart as PieChartIcon, Activity, Landmark, Receipt, CreditCard, School,
    ChevronRight, RefreshCw, Loader2, AlertCircle, Eye
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell,
    ResponsiveContainer, Tooltip
} from 'recharts';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";

// Chart Configs
const enrollmentConfig = {
    students: {
        label: "Students",
        color: "hsl(var(--primary))",
    },
};

const financialConfig = {
    income: {
        label: "Income",
        color: "hsl(142, 71%, 45%)",
    },
    expenses: {
        label: "Expenses",
        color: "hsl(0, 84%, 60%)",
    },
};

const genderConfig = {
    male: {
        label: "Male",
        color: "hsl(217, 91%, 60%)",
    },
    female: {
        label: "Female",
        color: "hsl(330, 81%, 60%)",
    },
};

const feeConfig = {
    collected: {
        label: "Collected",
        color: "hsl(217, 91%, 60%)",
    },
    pending: {
        label: "Pending",
        color: "hsl(38, 92%, 50%)",
    },
};

const statusConfig = {
    active: {
        label: "Active",
        color: "hsl(142, 71%, 45%)",
    },
    inactive: {
        label: "Inactive",
        color: "hsl(0, 84%, 60%)",
    },
};

const API_BASE = import.meta.env.VITE_API_URL;

// ================================================================
// REPORT CATEGORIES
// ================================================================
const REPORT_CATEGORIES = [
    { id: 'overview', label: 'Overview', icon: BarChart3, description: 'School-wide summary' },
    { id: 'students', label: 'Students', icon: GraduationCap, description: 'Enrollment & demographics' },
    { id: 'financial', label: 'Financial', icon: DollarSign, description: 'Income, expenses & fees' },
    { id: 'staff', label: 'Staff & Teachers', icon: Users, description: 'Staff statistics' },
    { id: 'academic', label: 'Academic', icon: BookOpen, description: 'Classes & subjects' },
];

// ================================================================
// MAIN COMPONENT
// ================================================================
const ReportsPage = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const [activeCategory, setActiveCategory] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Data States
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [staff, setStaff] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [feeStats, setFeeStats] = useState(null);
    const [incomeStats, setIncomeStats] = useState(null);
    const [expenseStats, setExpenseStats] = useState(null);
    const [enquiries, setEnquiries] = useState([]);
    const [complaints, setComplaints] = useState([]);

    const schoolId = currentUser?._id;

    // ================================================================
    // FETCH DATA
    // ================================================================
    const fetchAllData = async () => {
        if (!schoolId) return;
        try {
            const [
                studentsRes, teachersRes, staffRes, classesRes, subjectsRes,
                feeStatsRes, incomeStatsRes, expenseStatsRes, enquiriesRes, complaintsRes
            ] = await Promise.allSettled([
                axios.get(`${API_BASE}/Students/${schoolId}`),
                axios.get(`${API_BASE}/Teachers/${schoolId}`),
                axios.get(`${API_BASE}/Staff/${schoolId}`),
                axios.get(`${API_BASE}/Sclasses/${schoolId}`),
                axios.get(`${API_BASE}/AllSubjects/${schoolId}`),
                axios.get(`${API_BASE}/fee-statistics/${schoolId}`),
                axios.get(`${API_BASE}/income-statistics/${schoolId}`),
                axios.get(`${API_BASE}/expense-statistics/${schoolId}`),
                axios.get(`${API_BASE}/Enquiry/${schoolId}`),
                axios.get(`${API_BASE}/Complains/${schoolId}`),
            ]);

            if (studentsRes.status === 'fulfilled') setStudents(Array.isArray(studentsRes.value.data) ? studentsRes.value.data : []);
            if (teachersRes.status === 'fulfilled') setTeachers(Array.isArray(teachersRes.value.data) ? teachersRes.value.data : []);
            if (staffRes.status === 'fulfilled') setStaff(Array.isArray(staffRes.value.data) ? staffRes.value.data : []);
            if (classesRes.status === 'fulfilled') setClasses(Array.isArray(classesRes.value.data) ? classesRes.value.data : []);
            if (subjectsRes.status === 'fulfilled') setSubjects(Array.isArray(subjectsRes.value.data) ? subjectsRes.value.data : []);
            if (feeStatsRes.status === 'fulfilled') setFeeStats(feeStatsRes.value.data);
            if (incomeStatsRes.status === 'fulfilled') setIncomeStats(incomeStatsRes.value.data);
            if (expenseStatsRes.status === 'fulfilled') setExpenseStats(expenseStatsRes.value.data);
            if (enquiriesRes.status === 'fulfilled') setEnquiries(Array.isArray(enquiriesRes.value.data) ? enquiriesRes.value.data : []);
            if (complaintsRes.status === 'fulfilled') setComplaints(Array.isArray(complaintsRes.value.data) ? complaintsRes.value.data : []);
        } catch (err) {
            showToast("Some reports data failed to load", "error");
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchAllData();
            setLoading(false);
        };
        loadData();
    }, [schoolId]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchAllData();
        setRefreshing(false);
        showToast("Reports refreshed!", "success");
    };

    // ================================================================
    // COMPUTED STATS
    // ================================================================
    const stats = useMemo(() => {
        const totalStudents = students.length;
        const activeStudents = students.filter(s => s.status !== 'Disabled' && s.status !== 'disabled').length;
        const disabledStudents = totalStudents - activeStudents;
        const maleStudents = students.filter(s => s.gender === 'Male' || s.gender === 'male').length;
        const femaleStudents = students.filter(s => s.gender === 'Female' || s.gender === 'female').length;

        const totalTeachers = teachers.length;
        const totalStaff = staff.length;
        const totalClasses = classes.length;
        const totalSubjects = subjects.length;

        // Enrollment by class
        const enrollmentByClass = {};
        students.forEach(s => {
            const className = s.sclass?.sclassName || 'Unassigned';
            enrollmentByClass[className] = (enrollmentByClass[className] || 0) + 1;
        });

        // Financial
        const totalIncome = incomeStats?.totalIncome || 0;
        const totalExpense = expenseStats?.totalExpense || 0;
        const netBalance = totalIncome - totalExpense;
        const totalFeeCollected = feeStats?.totalCollected || 0;
        const totalFeePending = feeStats?.totalPending || 0;

        // Enquiry stats
        const totalEnquiries = enquiries.length;
        const pendingEnquiries = enquiries.filter(e => e.status === 'Pending' || e.status === 'pending').length;

        // Complaints
        const totalComplaints = complaints.length;
        const resolvedComplaints = complaints.filter(c => c.status === 'Resolved' || c.status === 'resolved' || c.status === 'Done').length;

        // Student-teacher ratio
        const studentTeacherRatio = totalTeachers > 0 ? Math.round(totalStudents / totalTeachers) : 0;

        // Chart-ready data
        const classEnrollmentData = Object.entries(enrollmentByClass)
            .sort((a, b) => b[1] - a[1]).slice(0, 10)
            .map(([name, count]) => ({ name: name.length > 12 ? name.slice(0,12)+'…' : name, students: count }));

        const genderData = [
            { name: 'Male', value: maleStudents, fill: 'hsl(217, 91%, 60%)' },
            { name: 'Female', value: femaleStudents, fill: 'hsl(330, 81%, 60%)' },
        ];

        const financialData = [
            { name: 'Income', amount: totalIncome, fill: 'var(--color-income)' },
            { name: 'Expenses', amount: totalExpense, fill: 'var(--color-expenses)' },
        ];

        const feeData = [
            { category: 'collected', amount: totalFeeCollected, fill: 'var(--color-collected)' },
            { category: 'pending', amount: totalFeePending, fill: 'var(--color-pending)' },
        ];

        const statusData = [
            { status: 'active', count: activeStudents, fill: 'var(--color-active)' },
            { status: 'inactive', count: disabledStudents, fill: 'var(--color-inactive)' },
        ];

        return {
            totalStudents, activeStudents, disabledStudents, maleStudents, femaleStudents,
            totalTeachers, totalStaff, totalClasses, totalSubjects,
            enrollmentByClass,
            totalIncome, totalExpense, netBalance, totalFeeCollected, totalFeePending,
            totalEnquiries, pendingEnquiries,
            totalComplaints, resolvedComplaints,
            studentTeacherRatio,
            classEnrollmentData, genderData, financialData, feeData, statusData,
        };
    }, [students, teachers, staff, classes, subjects, feeStats, incomeStats, expenseStats, enquiries, complaints]);

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(amount || 0);
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-12">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <p className="text-muted-foreground font-medium">Loading reports...</p>
                </div>
            </div>
        );
    }

    // ================================================================
    // RENDER
    // ================================================================
    return (
        <div className="flex-1 p-8 pt-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
                        <p className="text-sm text-muted-foreground">Comprehensive overview of your school's data & performance.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" /> Print
                    </Button>
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex gap-8">
                {/* Left Navigation */}
                <nav className="w-56 shrink-0 hidden lg:block self-start sticky top-6">
                    <div className="space-y-1">
                        {REPORT_CATEGORIES.map((cat) => {
                            const Icon = cat.icon;
                            const isActive = activeCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all duration-200 group ${
                                        isActive
                                            ? 'bg-primary/10 text-primary shadow-sm'
                                            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                                    }`}
                                >
                                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                        isActive ? 'bg-primary/15' : 'bg-muted/50 group-hover:bg-muted'
                                    }`}>
                                        <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : ''}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${isActive ? 'text-primary' : ''}`}>{cat.label}</p>
                                        <p className="text-[11px] text-muted-foreground truncate">{cat.description}</p>
                                    </div>
                                    {isActive && <ChevronRight className="h-4 w-4 text-primary shrink-0" />}
                                </button>
                            );
                        })}
                    </div>

                    {/* Quick Stats Summary */}
                    <Separator className="my-5" />
                    <div className="space-y-3 px-2">
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Quick Summary</p>
                        <QuickStat label="Students" value={stats.totalStudents} icon={GraduationCap} />
                        <QuickStat label="Teachers" value={stats.totalTeachers} icon={Users} />
                        <QuickStat label="Classes" value={stats.totalClasses} icon={School} />
                        <QuickStat label="Subjects" value={stats.totalSubjects} icon={BookOpen} />
                    </div>
                </nav>

                {/* Mobile Navigation */}
                <div className="lg:hidden w-full mb-4">
                    <ScrollArea className="w-full">
                        <div className="flex gap-2 pb-2">
                            {REPORT_CATEGORIES.map((cat) => {
                                const Icon = cat.icon;
                                const isActive = activeCategory === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                                            isActive
                                                ? 'bg-primary text-primary-foreground shadow-sm'
                                                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {cat.label}
                                    </button>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* ========== OVERVIEW ========== */}
                    {activeCategory === 'overview' && (
                        <div className="space-y-6">
                            <SectionHeader title="School Overview" description="High-level metrics across all departments." />

                            {/* Key Metrics Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                                <MetricCard
                                    title="Total Students"
                                    value={stats.totalStudents}
                                    icon={GraduationCap}
                                    subtitle={`${stats.activeStudents} active`}
                                    color="blue"
                                />
                                <MetricCard
                                    title="Teachers"
                                    value={stats.totalTeachers}
                                    icon={Users}
                                    subtitle={`1:${stats.studentTeacherRatio} ratio`}
                                    color="green"
                                />
                                <MetricCard
                                    title="Total Classes"
                                    value={stats.totalClasses}
                                    icon={School}
                                    subtitle={`${stats.totalSubjects} subjects`}
                                    color="violet"
                                />
                                <MetricCard
                                    title="Net Balance"
                                    value={formatCurrency(stats.netBalance)}
                                    icon={DollarSign}
                                    subtitle={stats.netBalance >= 0 ? 'Positive' : 'Negative'}
                                    color={stats.netBalance >= 0 ? 'emerald' : 'red'}
                                    trend={stats.netBalance >= 0 ? 'up' : 'down'}
                                />
                            </div>

                            {/* Secondary Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card>
                                    <CardContent className="p-5">
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-sm font-medium text-muted-foreground">Enquiries</p>
                                            <Badge variant="outline" className="text-xs">{stats.totalEnquiries} total</Badge>
                                        </div>
                                        <div className="flex items-end gap-2">
                                            <p className="text-3xl font-bold">{stats.pendingEnquiries}</p>
                                            <p className="text-sm text-muted-foreground mb-1">pending</p>
                                        </div>
                                        <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-amber-500 transition-all"
                                                style={{ width: `${stats.totalEnquiries > 0 ? ((stats.totalEnquiries - stats.pendingEnquiries) / stats.totalEnquiries) * 100 : 0}%` }}
                                            />
                                        </div>
                                        <p className="text-[11px] text-muted-foreground mt-1.5">
                                            {stats.totalEnquiries - stats.pendingEnquiries} processed
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-5">
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-sm font-medium text-muted-foreground">Complaints</p>
                                            <Badge variant="outline" className="text-xs">{stats.totalComplaints} total</Badge>
                                        </div>
                                        <div className="flex items-end gap-2">
                                            <p className="text-3xl font-bold">{stats.resolvedComplaints}</p>
                                            <p className="text-sm text-muted-foreground mb-1">resolved</p>
                                        </div>
                                        <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-green-500 transition-all"
                                                style={{ width: `${stats.totalComplaints > 0 ? (stats.resolvedComplaints / stats.totalComplaints) * 100 : 0}%` }}
                                            />
                                        </div>
                                        <p className="text-[11px] text-muted-foreground mt-1.5">
                                            {stats.totalComplaints - stats.resolvedComplaints} pending
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-5">
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-sm font-medium text-muted-foreground">Staff</p>
                                            <Badge variant="outline" className="text-xs">{stats.totalStaff + stats.totalTeachers} total</Badge>
                                        </div>
                                        <div className="flex items-end gap-2">
                                            <p className="text-3xl font-bold">{stats.totalStaff}</p>
                                            <p className="text-sm text-muted-foreground mb-1">non-teaching</p>
                                        </div>
                                        <div className="mt-3 flex gap-2">
                                            <div className="flex-1 text-center p-2 rounded-lg bg-blue-500/10">
                                                <p className="text-lg font-bold text-blue-600">{stats.totalTeachers}</p>
                                                <p className="text-[10px] text-muted-foreground">Teachers</p>
                                            </div>
                                            <div className="flex-1 text-center p-2 rounded-lg bg-violet-500/10">
                                                <p className="text-lg font-bold text-violet-600">{stats.totalStaff}</p>
                                                <p className="text-[10px] text-muted-foreground">Staff</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Enrollment and Status Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card className="shadow-sm border-muted/40">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <div className="space-y-1">
                                            <CardTitle className="text-base font-semibold">Enrollment by Class</CardTitle>
                                            <CardDescription>Student distribution across top 10 classes.</CardDescription>
                                        </div>
                                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <School className="h-4 w-4 text-primary" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="h-[300px] pt-4">
                                        {stats.classEnrollmentData.length > 0 ? (
                                            <ChartContainer config={enrollmentConfig} className="h-full w-full">
                                                <BarChart data={stats.classEnrollmentData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                                                    <XAxis 
                                                        dataKey="name" 
                                                        stroke="hsl(var(--muted-foreground))" 
                                                        fontSize={11} 
                                                        tickLine={false} 
                                                        axisLine={false}
                                                    />
                                                    <YAxis 
                                                        stroke="hsl(var(--muted-foreground))" 
                                                        fontSize={11} 
                                                        tickLine={false} 
                                                        axisLine={false}
                                                        tickFormatter={(value) => `${value}`}
                                                    />
                                                    <ChartTooltip content={<ChartTooltipContent />} />
                                                    <Bar 
                                                        dataKey="students" 
                                                        fill="var(--color-students)" 
                                                        radius={[4, 4, 0, 0]}
                                                        barSize={30}
                                                    />
                                                </BarChart>
                                            </ChartContainer>
                                        ) : (
                                            <EmptyState message="No enrollment data available" />
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm border-muted/40">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <div className="space-y-1">
                                            <CardTitle className="text-base font-semibold">Student Status</CardTitle>
                                            <CardDescription>Active vs Inactive student ratio.</CardDescription>
                                        </div>
                                        <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                                            <Activity className="h-4 w-4 text-green-600" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="h-[300px] flex items-center justify-center pt-4">
                                        <ChartContainer config={statusConfig} className="h-full w-full max-w-[280px]">
                                            <PieChart>
                                                <Pie
                                                    data={stats.statusData}
                                                    dataKey="count"
                                                    nameKey="status"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                >
                                                    {stats.statusData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                                </Pie>
                                                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                                <ChartLegend content={<ChartLegendContent />} className="mt-4" />
                                            </PieChart>
                                        </ChartContainer>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* ========== STUDENTS ========== */}
                    {activeCategory === 'students' && (
                        <div className="space-y-6">
                            <SectionHeader title="Student Reports" description="Enrollment, demographics, and student analytics." />

                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                                <MetricCard title="Total Enrolled" value={stats.totalStudents} icon={GraduationCap} color="blue" subtitle="All time" />
                                <MetricCard title="Active Students" value={stats.activeStudents} icon={UserCheck} color="green" subtitle={`${stats.totalStudents > 0 ? ((stats.activeStudents / stats.totalStudents) * 100).toFixed(0) : 0}% of total`} />
                                <MetricCard title="Disabled/Left" value={stats.disabledStudents} icon={UserX} color="red" subtitle="Inactive records" />
                                <MetricCard title="Student:Teacher" value={`1:${stats.studentTeacherRatio}`} icon={Users} color="violet" subtitle="Ratio" />
                            </div>

                            {/* Gender Distribution */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="shadow-sm border-muted/40">
                                    <CardHeader>
                                        <CardTitle className="text-base">Gender Distribution</CardTitle>
                                        <CardDescription>Breakdown of male and female students.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-[280px]">
                                        <ChartContainer config={genderConfig} className="h-full w-full">
                                            <PieChart>
                                                <Pie
                                                    data={[
                                                        { name: 'male', value: stats.maleStudents, fill: 'var(--color-male)' },
                                                        { name: 'female', value: stats.femaleStudents, fill: 'var(--color-female)' },
                                                    ]}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    innerRadius={60}
                                                    outerRadius={90}
                                                    paddingAngle={2}
                                                >
                                                    <Cell fill="var(--color-male)" />
                                                    <Cell fill="var(--color-female)" />
                                                </Pie>
                                                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                                <ChartLegend content={<ChartLegendContent />} />
                                            </PieChart>
                                        </ChartContainer>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm border-muted/40">
                                    <CardHeader>
                                        <CardTitle className="text-base">Student Ratio Highlights</CardTitle>
                                        <CardDescription>Key demographic percentages.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col justify-center gap-4 h-[280px]">
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                    <Users className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Male Students</p>
                                                    <p className="text-xs text-muted-foreground">{stats.maleStudents} total</p>
                                                </div>
                                            </div>
                                            <p className="text-2xl font-bold text-blue-600">
                                                {stats.totalStudents > 0 ? ((stats.maleStudents / stats.totalStudents) * 100).toFixed(1) : 0}%
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-pink-500/5 border border-pink-500/10">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                                                    <Users className="h-5 w-5 text-pink-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Female Students</p>
                                                    <p className="text-xs text-muted-foreground">{stats.femaleStudents} total</p>
                                                </div>
                                            </div>
                                            <p className="text-2xl font-bold text-pink-600">
                                                {stats.totalStudents > 0 ? ((stats.femaleStudents / stats.totalStudents) * 100).toFixed(1) : 0}%
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Class-wise Enrollment */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Class-wise Enrollment</CardTitle>
                                    <CardDescription>Number of students in each class.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {Object.keys(stats.enrollmentByClass).length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                            {Object.entries(stats.enrollmentByClass)
                                                .sort((a, b) => b[1] - a[1])
                                                .map(([className, count]) => (
                                                    <div key={className} className="flex flex-col items-center p-4 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors">
                                                        <p className="text-2xl font-bold">{count}</p>
                                                        <p className="text-sm text-muted-foreground mt-1 truncate max-w-full">{className}</p>
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <EmptyState message="No class enrollment data available." />
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* ========== FINANCIAL ========== */}
                    {activeCategory === 'financial' && (
                        <div className="space-y-6">
                            <SectionHeader title="Financial Reports" description="Income, expenses, fee collection, and balance overview." />

                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                                <MetricCard title="Total Income" value={formatCurrency(stats.totalIncome)} icon={TrendingUp} color="green" trend="up" subtitle="All sources" />
                                <MetricCard title="Total Expenses" value={formatCurrency(stats.totalExpense)} icon={TrendingDown} color="red" trend="down" subtitle="All categories" />
                                <MetricCard title="Fee Collected" value={formatCurrency(stats.totalFeeCollected)} icon={Receipt} color="blue" subtitle="From students" />
                                <MetricCard title="Fee Pending" value={formatCurrency(stats.totalFeePending)} icon={CreditCard} color="amber" subtitle="Outstanding" />
                            </div>

                            {/* Net Balance Card */}
                            <Card className={stats.netBalance >= 0 ? 'border-green-500/20' : 'border-red-500/20'}>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground font-medium mb-1">Net Balance (Income - Expenses)</p>
                                            <p className={`text-4xl font-bold ${stats.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatCurrency(stats.netBalance)}
                                            </p>
                                        </div>
                                        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${stats.netBalance >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                            {stats.netBalance >= 0
                                                ? <TrendingUp className="h-8 w-8 text-green-600" />
                                                : <TrendingDown className="h-8 w-8 text-red-600" />
                                            }
                                        </div>
                                    </div>
                                    <Separator className="my-5" />
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center p-3 rounded-xl bg-green-500/5">
                                            <p className="text-lg font-bold text-green-600">{formatCurrency(stats.totalIncome)}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">Income</p>
                                        </div>
                                        <div className="text-center p-3 rounded-xl bg-red-500/5">
                                            <p className="text-lg font-bold text-red-600">{formatCurrency(stats.totalExpense)}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">Expenses</p>
                                        </div>
                                        <div className="text-center p-3 rounded-xl bg-blue-500/5">
                                            <p className="text-lg font-bold text-blue-600">{formatCurrency(stats.totalFeeCollected)}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">Fee Collected</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Financial and Fee Collection Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card className="shadow-sm border-muted/40">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <div className="space-y-1">
                                            <CardTitle className="text-base font-semibold">Income vs Expenses</CardTitle>
                                            <CardDescription>Comparison of total financial flow.</CardDescription>
                                        </div>
                                        <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                                            <BarChart3 className="h-4 w-4 text-green-600" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="h-[300px] pt-4">
                                        <ChartContainer config={financialConfig} className="h-full w-full">
                                            <BarChart data={stats.financialData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                                                <XAxis 
                                                    dataKey="name" 
                                                    stroke="hsl(var(--muted-foreground))" 
                                                    fontSize={12} 
                                                    tickLine={false} 
                                                    axisLine={false} 
                                                />
                                                <YAxis 
                                                    stroke="hsl(var(--muted-foreground))" 
                                                    fontSize={11} 
                                                    tickLine={false} 
                                                    axisLine={false}
                                                    tickFormatter={(value) => `${value / 1000}k`}
                                                />
                                                <ChartTooltip content={<ChartTooltipContent />} />
                                                <Bar dataKey="amount" radius={[4, 4, 0, 0]} barSize={50}>
                                                    {stats.financialData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ChartContainer>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm border-muted/40">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <div className="space-y-1">
                                            <CardTitle className="text-base font-semibold">Fee Collection Coverage</CardTitle>
                                            <CardDescription>Ratio of collected vs pending fees.</CardDescription>
                                        </div>
                                        <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                            <Receipt className="h-4 w-4 text-blue-600" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="h-[300px] flex items-center justify-center pt-4">
                                        <ChartContainer config={feeConfig} className="h-full w-full max-w-[280px]">
                                            <PieChart>
                                                <Pie
                                                    data={stats.feeData}
                                                    dataKey="amount"
                                                    nameKey="category"
                                                    innerRadius={70}
                                                    outerRadius={90}
                                                    paddingAngle={5}
                                                >
                                                    {stats.feeData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                                </Pie>
                                                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                                <ChartLegend content={<ChartLegendContent />} className="mt-4" />
                                            </PieChart>
                                        </ChartContainer>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* ========== STAFF & TEACHERS ========== */}
                    {activeCategory === 'staff' && (
                        <div className="space-y-6">
                            <SectionHeader title="Staff & Teachers" description="Overview of your school workforce." />

                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                <MetricCard title="Total Teachers" value={stats.totalTeachers} icon={GraduationCap} color="blue" subtitle="Teaching staff" />
                                <MetricCard title="Total Staff" value={stats.totalStaff} icon={Users} color="violet" subtitle="Non-teaching" />
                                <MetricCard title="Total Workforce" value={stats.totalTeachers + stats.totalStaff} icon={Building} color="green" subtitle="All personnel" />
                            </div>

                            {/* Workforce Composition */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Workforce Composition</CardTitle>
                                    <CardDescription>Distribution of teaching vs non-teaching staff.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="text-center p-6 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                            <div className="h-14 w-14 mx-auto rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
                                                <GraduationCap className="h-7 w-7 text-blue-600" />
                                            </div>
                                            <p className="text-4xl font-bold text-blue-600">{stats.totalTeachers}</p>
                                            <p className="text-sm text-muted-foreground mt-2">Teachers</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {((stats.totalTeachers + stats.totalStaff) > 0 ? ((stats.totalTeachers / (stats.totalTeachers + stats.totalStaff)) * 100).toFixed(0) : 0)}% of workforce
                                            </p>
                                        </div>
                                        <div className="text-center p-6 rounded-xl bg-violet-500/5 border border-violet-500/10">
                                            <div className="h-14 w-14 mx-auto rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
                                                <Users className="h-7 w-7 text-violet-600" />
                                            </div>
                                            <p className="text-4xl font-bold text-violet-600">{stats.totalStaff}</p>
                                            <p className="text-sm text-muted-foreground mt-2">Non-Teaching Staff</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {((stats.totalTeachers + stats.totalStaff) > 0 ? ((stats.totalStaff / (stats.totalTeachers + stats.totalStaff)) * 100).toFixed(0) : 0)}% of workforce
                                            </p>
                                        </div>
                                    </div>

                                    {/* Ratio bar */}
                                    <div className="mt-5 h-4 rounded-full overflow-hidden flex">
                                        <div className="bg-blue-500 transition-all duration-700" style={{ width: `${(stats.totalTeachers + stats.totalStaff) > 0 ? (stats.totalTeachers / (stats.totalTeachers + stats.totalStaff)) * 100 : 50}%` }} />
                                        <div className="bg-violet-500 flex-1" />
                                    </div>
                                    <div className="flex justify-between mt-1.5 text-[11px] text-muted-foreground">
                                        <span>Teachers ({stats.totalTeachers})</span>
                                        <span>Staff ({stats.totalStaff})</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Key Ratios */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Key Ratios</CardTitle>
                                    <CardDescription>Important workforce ratios.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="flex items-center gap-3 p-4 rounded-xl border bg-muted/20">
                                            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                <Users className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-bold">1:{stats.studentTeacherRatio}</p>
                                                <p className="text-xs text-muted-foreground">Student:Teacher</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-4 rounded-xl border bg-muted/20">
                                            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                <School className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-bold">{stats.totalClasses > 0 ? Math.round(stats.totalStudents / stats.totalClasses) : 0}</p>
                                                <p className="text-xs text-muted-foreground">Students/Class avg</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-4 rounded-xl border bg-muted/20">
                                            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                <BookOpen className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-bold">{stats.totalTeachers > 0 ? (stats.totalSubjects / stats.totalTeachers).toFixed(1) : 0}</p>
                                                <p className="text-xs text-muted-foreground">Subjects/Teacher avg</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* ========== ACADEMIC ========== */}
                    {activeCategory === 'academic' && (
                        <div className="space-y-6">
                            <SectionHeader title="Academic Reports" description="Classes, subjects, and academic structure." />

                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                <MetricCard title="Total Classes" value={stats.totalClasses} icon={School} color="blue" subtitle="Active classes" />
                                <MetricCard title="Total Subjects" value={stats.totalSubjects} icon={BookOpen} color="violet" subtitle="Offered subjects" />
                                <MetricCard title="Avg Class Size" value={stats.totalClasses > 0 ? Math.round(stats.totalStudents / stats.totalClasses) : 0} icon={Users} color="green" subtitle="Students per class" />
                            </div>

                            {/* Classes Detail */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Class Details</CardTitle>
                                    <CardDescription>All active classes with their enrollment numbers.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {classes.length > 0 ? (
                                        <div className="space-y-2">
                                            {classes.map((cls) => {
                                                const classStudents = students.filter(s => s.sclass?._id === cls._id).length;
                                                const sections = cls.sections?.length || 0;
                                                return (
                                                    <div key={cls._id} className="flex items-center justify-between p-3.5 rounded-xl border hover:bg-muted/30 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                                                <School className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium">{cls.sclassName}</p>
                                                                <p className="text-[11px] text-muted-foreground">
                                                                    {sections > 0 ? `${sections} section${sections > 1 ? 's' : ''}` : 'No sections'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Badge variant="secondary">{classStudents} students</Badge>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <EmptyState message="No classes found." />
                                    )}
                                </CardContent>
                            </Card>

                            {/* Subjects Overview */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Subjects Overview</CardTitle>
                                    <CardDescription>All {stats.totalSubjects} subjects offered by the school.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {subjects.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {subjects.map((sub) => (
                                                <Badge key={sub._id} variant="outline" className="px-3 py-1.5 text-sm">
                                                    {sub.subName}
                                                    {sub.subCode && <span className="ml-1.5 text-muted-foreground">({sub.subCode})</span>}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState message="No subjects found." />
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ================================================================
// REUSABLE COMPONENTS
// ================================================================

const SectionHeader = ({ title, description, action }) => (
    <div className="flex items-center justify-between mb-2">
        <div>
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>
        {action}
    </div>
);

const colorMap = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-600', darkText: 'dark:text-blue-400' },
    green: { bg: 'bg-green-500/10', text: 'text-green-600', darkText: 'dark:text-green-400' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', darkText: 'dark:text-emerald-400' },
    violet: { bg: 'bg-violet-500/10', text: 'text-violet-600', darkText: 'dark:text-violet-400' },
    red: { bg: 'bg-red-500/10', text: 'text-red-600', darkText: 'dark:text-red-400' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-600', darkText: 'dark:text-amber-400' },
};

const MetricCard = ({ title, value, icon: Icon, subtitle, color = 'blue', trend }) => {
    const c = colorMap[color] || colorMap.blue;
    return (
        <Card className={`hover:shadow-lg transition-all duration-300 border-l-4 ${color === 'blue' ? 'border-l-blue-500' : color === 'green' ? 'border-l-green-500' : color === 'violet' ? 'border-l-violet-500' : color === 'red' ? 'border-l-red-500' : color === 'amber' ? 'border-l-amber-500' : 'border-l-primary'}`}>
            <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
                        <div className="flex items-end gap-2">
                            <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
                            {trend && (
                                <span className={`flex items-center text-xs font-bold mb-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                    {trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                                    {trend === 'up' ? '↑' : '↓'}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className={`h-11 w-11 rounded-2xl ${c.bg} flex items-center justify-center shadow-inner`}>
                        <Icon className={`h-5 w-5 ${c.text}`} />
                    </div>
                </div>
                {subtitle && (
                    <div className="flex items-center gap-1.5 mt-1">
                        <div className={`h-1.5 w-1.5 rounded-full ${c.bg.replace('/10', '')}`} />
                        <p className="text-xs text-muted-foreground font-medium">{subtitle}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const QuickStat = ({ label, value, icon: Icon }) => (
    <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-md bg-muted/80 flex items-center justify-center">
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="flex-1">
            <p className="text-[11px] text-muted-foreground">{label}</p>
        </div>
        <p className="text-sm font-semibold">{value}</p>
    </div>
);

const EmptyState = ({ message }) => (
    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
        <AlertCircle className="h-10 w-10 mb-3 opacity-40" />
        <p className="text-sm">{message}</p>
    </div>
);

export default ReportsPage;
