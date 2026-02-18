import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCampus } from '../context/CampusContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config/api';
import {
  Users, School, BookOpen, DollarSign, TrendingUp, Activity, Clock,
  Calendar, Bell, BarChart3, ArrowUpRight, MoreHorizontal, GraduationCap,
  Receipt, CreditCard, UserCheck, UserX, ArrowDownRight, Wallet,
  RefreshCw, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell,
  AreaChart, Area, ResponsiveContainer, RadialBarChart, RadialBar, Legend,
  Tooltip
} from 'recharts';
import DashboardCalendar from '@/components/DashboardCalendar';


const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const { selectedCampus, campuses } = useCampus();
  const navigate = useNavigate();
  const isTeacher = currentUser?.userType === 'teacher';
  const schoolId = isTeacher ? (currentUser?.school?._id || currentUser?.school) : currentUser?._id;
  const basePath = isTeacher ? '/teacher' : '/admin';

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classes: 0,
    revenue: 0,
  });
  const [activities, setActivities] = useState([]);
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [students, setStudents] = useState([]);
  const [feeStats, setFeeStats] = useState(null);
  const [incomeStats, setIncomeStats] = useState(null);
  const [expenseStats, setExpenseStats] = useState(null);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser, selectedCampus, campuses]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      let studentCount = 0;
      let teacherCount = 0;
      let classCount = 0;

      if (isTeacher) {
        // Teacher: count from assigned classes
        classCount = currentUser?.assignedClasses?.length || 0;
        // Fetch students for teacher's school
        try {
          const studentsRes = await axios.get(`${API_URL}/Students/${schoolId}`);
          const allStudents = Array.isArray(studentsRes.data) ? studentsRes.data : [];
          // Filter students by teacher's assigned classes
          const assignedClassIds = (currentUser?.assignedClasses || []).map(c => c._id || c);
          const myStudents = allStudents.filter(s => {
            const sclassId = s.sclass?._id || s.sclass;
            return assignedClassIds.includes(sclassId?.toString());
          });
          studentCount = myStudents.length;
          setStudents(myStudents);
        } catch (err) { setStudents([]); }
      } else if (selectedCampus) {
        const res = await axios.get(`${API_URL}/CampusStats/${selectedCampus._id}`);
        if (res.data.success) {
          const s = res.data.stats;
          studentCount = s.totalStudents;
          teacherCount = s.totalTeachers;
          classCount = s.totalClasses;
        }
      } else if (campuses.length > 0) {
        const promises = campuses.map(campus =>
          axios.get(`${API_URL}/CampusStats/${campus._id}`)
        );
        const results = await Promise.all(promises);
        results.forEach(res => {
          if (res.data.success) {
            studentCount += res.data.stats.totalStudents;
            teacherCount += res.data.stats.totalTeachers;
            classCount += res.data.stats.totalClasses;
          }
        });
      }

      let revenue = 0;
      if (!isTeacher) {
        try {
          const incomeRes = await axios.get(`${API_URL}/IncomeStatistics/${currentUser._id}`);
          revenue = incomeRes.data.totalIncome?.amount || 0;
        } catch (err) { }
      }

      setStats({ students: studentCount, teachers: teacherCount, classes: classCount, revenue });

      // Parallel fetch - teacher skips financial APIs
      const fetchPromises = [
        axios.get(`${API_URL}/Notifications/${schoolId}`),
        axios.get(`${API_URL}/Events/${schoolId}`),
        ...(isTeacher ? [] : [axios.get(`${API_URL}/Students/${schoolId}`)]),
        ...(isTeacher ? [] : [axios.get(`${API_URL}/fee-statistics/${schoolId}`)]),
        ...(isTeacher ? [] : [axios.get(`${API_URL}/income-statistics/${schoolId}`)]),
        ...(isTeacher ? [] : [axios.get(`${API_URL}/expense-statistics/${schoolId}`)]),
        axios.get(`${API_URL}/Sclasses/${schoolId}`),
      ];
      const results = await Promise.allSettled(fetchPromises);

      let idx = 0;
      const notifRes = results[idx++];
      const eventRes = results[idx++];
      let studentsRes, feeStatsRes, incomeStatsRes, expenseStatsRes;
      if (!isTeacher) {
        studentsRes = results[idx++];
        feeStatsRes = results[idx++];
        incomeStatsRes = results[idx++];
        expenseStatsRes = results[idx++];
      }
      const classesRes = results[idx++];

      if (notifRes.status === 'fulfilled') {
        setActivities(notifRes.value.data.notifications?.slice(0, 5) || []);
        setNotifications(notifRes.value.data.notifications?.filter(n => !n.read).slice(0, 5) || []);
      }
      if (eventRes.status === 'fulfilled') {
        const upcoming = (Array.isArray(eventRes.value.data) ? eventRes.value.data : [])
          .filter(e => new Date(e.eventFrom) >= new Date())
          .sort((a, b) => new Date(a.eventFrom) - new Date(b.eventFrom))
          .slice(0, 3);
        setEvents(upcoming);
      }
      if (!isTeacher) {
        if (studentsRes?.status === 'fulfilled') setStudents(Array.isArray(studentsRes.value.data) ? studentsRes.value.data : []);
        if (feeStatsRes?.status === 'fulfilled') setFeeStats(feeStatsRes.value.data);
        if (incomeStatsRes?.status === 'fulfilled') setIncomeStats(incomeStatsRes.value.data);
        if (expenseStatsRes?.status === 'fulfilled') setExpenseStats(expenseStatsRes.value.data);
      }
      if (classesRes?.status === 'fulfilled') setClasses(Array.isArray(classesRes.value.data) ? classesRes.value.data : []);

    } catch (error) {
      console.error("Dashboard data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ================================================================
  // COMPUTED CHART DATA
  // ================================================================
  const chartData = useMemo(() => {
    // Enrollment by class for bar chart
    const enrollmentByClass = {};
    students.forEach(s => {
      const className = s.sclass?.sclassName || 'Unassigned';
      enrollmentByClass[className] = (enrollmentByClass[className] || 0) + 1;
    });
    const classEnrollmentData = Object.entries(enrollmentByClass)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, students]) => ({ name: name.length > 10 ? name.slice(0, 10) + '…' : name, students }));

    // Gender distribution for pie chart
    const maleCount = students.filter(s => s.gender === 'Male' || s.gender === 'male').length;
    const femaleCount = students.filter(s => s.gender === 'Female' || s.gender === 'female').length;
    const otherCount = students.length - maleCount - femaleCount;
    const genderData = [
      { name: 'Male', value: maleCount, fill: 'hsl(217, 91%, 60%)' },
      { name: 'Female', value: femaleCount, fill: 'hsl(330, 81%, 60%)' },
    ];
    if (otherCount > 0) genderData.push({ name: 'Other', value: otherCount, fill: 'hsl(150, 60%, 50%)' });

    // Financial for donut chart
    const totalIncome = incomeStats?.totalIncome || 0;
    const totalExpense = expenseStats?.totalExpense || 0;
    const totalFeeCollected = feeStats?.totalCollected || 0;
    const totalFeePending = feeStats?.totalPending || 0;

    const financialOverview = [
      { name: 'Income', value: totalIncome, fill: 'hsl(142, 71%, 45%)' },
      { name: 'Expenses', value: totalExpense, fill: 'hsl(0, 84%, 60%)' },
    ];

    const feeData = [
      { name: 'Collected', value: totalFeeCollected, fill: 'hsl(217, 91%, 60%)' },
      { name: 'Pending', value: totalFeePending, fill: 'hsl(38, 92%, 50%)' },
    ];

    // Student status
    const activeStudents = students.filter(s => s.status !== 'Disabled' && s.status !== 'disabled').length;
    const disabledStudents = students.length - activeStudents;
    const statusData = [
      { name: 'Active', value: activeStudents, fill: 'hsl(142, 71%, 45%)' },
      { name: 'Inactive', value: disabledStudents, fill: 'hsl(0, 84%, 60%)' },
    ];

    return {
      classEnrollmentData, genderData, financialOverview, feeData, statusData,
      totalIncome, totalExpense, totalFeeCollected, totalFeePending,
      activeStudents, disabledStudents, maleCount, femaleCount
    };
  }, [students, feeStats, incomeStats, expenseStats, classes]);

  const formatCurrency = (amount) => {
    if (amount >= 1000000) return `PKR ${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `PKR ${(amount / 1000).toFixed(0)}K`;
    return `PKR ${amount?.toLocaleString() || 0}`;
  };

  const statCards = isTeacher ? [
    {
      icon: BookOpen, label: 'My Classes', count: stats.classes,
      subtitle: `${currentUser?.assignedClasses?.length || 0} assigned`, color: 'text-blue-600',
      bg: 'bg-blue-500/10', ring: 'ring-blue-500/20'
    },
    {
      icon: GraduationCap, label: 'My Students', count: stats.students,
      subtitle: 'In your classes', color: 'text-violet-600',
      bg: 'bg-violet-500/10', ring: 'ring-violet-500/20'
    },
    {
      icon: School, label: 'Subject', count: currentUser?.subject || 'N/A',
      subtitle: currentUser?.qualification || '', color: 'text-orange-600',
      bg: 'bg-orange-500/10', ring: 'ring-orange-500/20'
    },
    {
      icon: UserCheck, label: 'Experience', count: `${currentUser?.experience || 0} yrs`,
      subtitle: 'Teaching experience', color: 'text-emerald-600',
      bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/20'
    },
  ] : [
    {
      icon: GraduationCap, label: 'Total Students', count: stats.students,
      subtitle: `${chartData.activeStudents} active`, color: 'text-blue-600',
      bg: 'bg-blue-500/10', ring: 'ring-blue-500/20'
    },
    {
      icon: Users, label: 'Teachers', count: stats.teachers,
      subtitle: `1:${stats.teachers > 0 ? Math.round(stats.students / stats.teachers) : 0} ratio`,
      color: 'text-violet-600', bg: 'bg-violet-500/10', ring: 'ring-violet-500/20'
    },
    {
      icon: School, label: 'Total Classes', count: stats.classes,
      subtitle: `${classes.length} active`, color: 'text-orange-600',
      bg: 'bg-orange-500/10', ring: 'ring-orange-500/20'
    },
    {
      icon: DollarSign, label: 'Revenue', count: formatCurrency(stats.revenue),
      subtitle: 'Total income', color: 'text-emerald-600',
      bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/20'
    },
  ];

  const quickActions = isTeacher ? [
    { label: 'My Students', icon: GraduationCap, route: '/teacher/students', color: 'text-blue-600', bg: 'bg-blue-500/10' },
    { label: 'Class Schedule', icon: Calendar, route: '/teacher/class-schedule', color: 'text-purple-600', bg: 'bg-purple-500/10' },
    { label: 'Mark Attendance', icon: UserCheck, route: '/teacher/attendance', color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    { label: 'Settings', icon: Activity, route: '/teacher/settings', color: 'text-orange-600', bg: 'bg-orange-500/10' },
  ] : [
    { label: 'Add Student', icon: Users, route: '/admin/admission', color: 'text-blue-600', bg: 'bg-blue-500/10' },
    { label: 'Manage Classes', icon: BookOpen, route: '/admin/classes', color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
    { label: 'Class Schedule', icon: Calendar, route: '/admin/class-schedule', color: 'text-purple-600', bg: 'bg-purple-500/10' },
    { label: 'All Students', icon: School, route: '/admin/students', color: 'text-orange-600', bg: 'bg-orange-500/10' },
    { label: 'Fee Collection', icon: Receipt, route: '/admin/fee-collection', color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    { label: 'Reports', icon: BarChart3, route: '/admin/reports', color: 'text-pink-600', bg: 'bg-pink-500/10' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };

  // Custom chart tooltip style
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border bg-background px-3 py-2 shadow-lg">
        <p className="text-sm font-medium mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-xs text-muted-foreground">
            <span className="inline-block w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: entry.color || entry.fill }} />
            {entry.name}: <span className="font-semibold text-foreground">{entry.value?.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-semibold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {isTeacher ? `Welcome, ${currentUser?.name || 'Teacher'}` : 'Dashboard'}
          </h2>
          <p className="text-muted-foreground mt-0.5">
            {isTeacher ? `${currentUser?.subject || ''} Teacher` : "Overview of your institute's performance."}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="hidden sm:flex" onClick={fetchDashboardData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {!isTeacher && (
            <Button onClick={() => navigate('/admin/admission')}>
              <Users className="mr-2 h-4 w-4" />
              New Admission
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div variants={itemVariants} key={idx}>
              <Card className="hover:shadow-md transition-all duration-300 overflow-hidden relative group">
                <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-full -translate-y-8 translate-x-8 opacity-50 group-hover:scale-125 transition-transform duration-500`} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-24" /> : stat.count}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts Row 1 */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-4 lg:grid-cols-7">
        {/* Enrollment Bar Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-4">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Class Enrollment</CardTitle>
                  <CardDescription>Student distribution across classes</CardDescription>
                </div>
                <Badge variant="outline" className="text-xs font-normal">
                  {chartData.classEnrollmentData.length} classes
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[280px] flex items-center justify-center">
                  <Skeleton className="h-full w-full rounded-lg" />
                </div>
              ) : chartData.classEnrollmentData.length > 0 ? (
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.classEnrollmentData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} className="text-muted-foreground" axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={1} />
                          <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.6} />
                        </linearGradient>
                      </defs>
                      <Bar dataKey="students" fill="url(#barGradient)" radius={[6, 6, 0, 0]} maxBarSize={45} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                  No enrollment data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Gender + Status Pie Charts */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Student Demographics</CardTitle>
              <CardDescription>Gender & status distribution</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[280px] w-full rounded-lg" />
              ) : (
                <div className="grid grid-cols-2 gap-2 h-[280px]">
                  {/* Gender Chart */}
                  <div className="flex flex-col items-center">
                    <p className="text-[11px] text-muted-foreground font-medium mb-1">Gender</p>
                    <div className="flex-1 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData.genderData}
                            cx="50%" cy="50%"
                            innerRadius={35} outerRadius={65}
                            paddingAngle={3}
                            dataKey="value"
                            labelLine={false}
                            label={renderCustomizedLabel}
                          >
                            {chartData.genderData.map((entry, i) => (
                              <Cell key={i} fill={entry.fill} strokeWidth={0} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex gap-3 mt-1">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-[10px] text-muted-foreground">{chartData.maleCount} M</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-pink-500" />
                        <span className="text-[10px] text-muted-foreground">{chartData.femaleCount} F</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Chart */}
                  <div className="flex flex-col items-center">
                    <p className="text-[11px] text-muted-foreground font-medium mb-1">Status</p>
                    <div className="flex-1 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData.statusData}
                            cx="50%" cy="50%"
                            innerRadius={35} outerRadius={65}
                            paddingAngle={3}
                            dataKey="value"
                            labelLine={false}
                            label={renderCustomizedLabel}
                          >
                            {chartData.statusData.map((entry, i) => (
                              <Cell key={i} fill={entry.fill} strokeWidth={0} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex gap-3 mt-1">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-[10px] text-muted-foreground">{chartData.activeStudents} Active</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-[10px] text-muted-foreground">{chartData.disabledStudents} Left</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Financial Charts Row - Hidden for Teacher */}
      {!isTeacher && (
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Financial Summary */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Financial Overview</CardTitle>
                  <CardDescription>Income vs Expenses</CardDescription>
                </div>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[200px] w-full rounded-lg" />
              ) : (
                <div>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData.financialOverview}
                          cx="50%" cy="50%"
                          innerRadius={50} outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                          labelLine={false}
                        >
                          {chartData.financialOverview.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} strokeWidth={0} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-6 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-green-500" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">Income</p>
                        <p className="text-xs font-semibold">{formatCurrency(chartData.totalIncome)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-red-500" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">Expenses</p>
                        <p className="text-xs font-semibold">{formatCurrency(chartData.totalExpense)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Fee Collection Chart */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Fee Collection</CardTitle>
                  <CardDescription>Collected vs Pending</CardDescription>
                </div>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[200px] w-full rounded-lg" />
              ) : (
                <div>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData.feeData}
                          cx="50%" cy="50%"
                          innerRadius={50} outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                          labelLine={false}
                        >
                          {chartData.feeData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} strokeWidth={0} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-6 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-blue-500" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">Collected</p>
                        <p className="text-xs font-semibold">{formatCurrency(chartData.totalFeeCollected)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-amber-500" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">Pending</p>
                        <p className="text-xs font-semibold">{formatCurrency(chartData.totalFeePending)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Fee Collection Progress */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Collection Rate</CardTitle>
                  <CardDescription>Fee collection progress</CardDescription>
                </div>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[200px] w-full rounded-lg" />
              ) : (
                (() => {
                  const total = chartData.totalFeeCollected + chartData.totalFeePending;
                  const percent = total > 0 ? (chartData.totalFeeCollected / total) * 100 : 0;
                  const radialData = [{ name: 'Collected', value: percent, fill: 'hsl(217, 91%, 60%)' }];
                  return (
                    <div>
                      <div className="h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" startAngle={180} endAngle={0} data={radialData}>
                            <RadialBar background clockWise dataKey="value" cornerRadius={10} fill="hsl(217, 91%, 60%)" />
                          </RadialBarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="text-center -mt-10">
                        <p className="text-3xl font-bold">{percent.toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatCurrency(chartData.totalFeeCollected)} of {formatCurrency(total)}
                        </p>
                      </div>
                    </div>
                  );
                })()
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      )}

      {/* Activity + Quick Actions Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity */}
        <Card className="col-span-4 lg:col-span-4 flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system updates and notifications</CardDescription>
              </div>
              <Activity className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-5">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-3 w-[200px]" />
                      </div>
                    </div>
                  ))
                ) : activities.length > 0 ? (
                  activities.map((activity, idx) => (
                    <div key={idx} className="flex gap-4 group">
                      <div className="relative mt-1">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border bg-background group-hover:bg-muted transition-colors">
                          <Bell className="h-4 w-4 text-muted-foreground" />
                        </div>
                        {!activity.read && (
                          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{activity.message}</p>
                        <div className="flex items-center pt-1 text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {activity.timestamp ? format(new Date(activity.timestamp), 'MMM dd, yyyy • h:mm a') : 'Just now'}
                        </div>
                      </div>
                    </div>
                  ))
                  ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <div className="p-3 bg-muted rounded-full mb-3">
                      <Bell className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">No recent activity</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Quick Actions & Events */}
        <div className="col-span-3 space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2.5">
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={idx} variant="outline"
                    className="h-auto flex-col items-center justify-center py-3.5 space-y-1.5 hover:bg-muted/50 transition-all duration-200 group"
                    onClick={() => navigate(action.route)}
                  >
                    <div className={`p-2 rounded-xl ${action.bg} group-hover:scale-110 transition-transform`}>
                      <Icon className={`h-4 w-4 ${action.color}`} />
                    </div>
                    <span className="text-[11px] font-medium">{action.label}</span>
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          {/* Calendar Widget */}
          <div className="h-[400px]">
            <DashboardCalendar />
          </div>
        </div>


      </div>
    </div>
  );
};

export default AdminDashboard;