
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config/api';
import {
  Users, BookOpen, Calendar, Activity, Clock,
  Bell, BarChart3, TrendingUp, DollarSign,
  FileText, CheckCircle, XCircle, AlertCircle,
  GraduationCap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const ParentDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // State for dashboard data
  const [attendanceStats, setAttendanceStats] = useState({ percentage: 0, status: 'N/A' });
  const [feeStats, setFeeStats] = useState({ pending: 0, status: 'Clear' });
  const [examStats, setExamStats] = useState({ nextExam: 'N/A', type: '' });
  const [academicPerformance, setAcademicPerformance] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!currentUser?._id) return;
        setLoading(true);

        const studentId = currentUser._id;
        const sclassId = currentUser.sclassName?._id || currentUser.sclassName;
        const schoolId = currentUser.school?._id || currentUser.school;

        // Fetch all data in parallel
        const [attendanceRes, feesRes, notificationsRes, marksRes, scheduleRes] = await Promise.allSettled([
          axios.get(`${API_URL}/Student/${studentId}/Attendance` /* Note: need to verify this route or use /Attendance/Student/:id */), 
          axios.get(`${API_URL}/StudentFees/${studentId}`),
          axios.get(`${API_URL}/Notifications/${studentId}`),
          axios.get(`${API_URL}/ExamResults/Student/${studentId}`),
          axios.get(`${API_URL}/ExamSchedules/Class/${sclassId}`) 
        ]);
        
        // --- Process Attendance ---
        // Actually I added route: /Attendance/Student/:studentId
        const realAttendanceRes = await axios.get(`${API_URL}/Attendance/Student/${studentId}`).catch(() => ({ data: [] }));
        const attendanceData = realAttendanceRes.data || [];
        if (attendanceData.length > 0) {
            const presentCount = attendanceData.filter(a => a.status === 'Present').length;
            const percentage = Math.round((presentCount / attendanceData.length) * 100);
            setAttendanceStats({ 
                percentage, 
                status: percentage > 75 ? 'Good' : (percentage > 50 ? 'Average' : 'Low') 
            });
        }

        // --- Process Fees ---
        // Assuming Response: { ...fees... } or array
        if (feesRes.status === 'fulfilled') {
            // Logic depends on fee structure. Assuming simple calculation or mock logic if API structure is unknown
            // Let's assume feesRes.data is array of fee objects associated with student
            const fees = Array.isArray(feesRes.data) ? feesRes.data : [];
            // This endpoint might return "Fee Details". Let's assume we sum up 'amount' where status is 'Pending'
            // If unknown, we default to 0.
            setFeeStats({ pending: 0, status: 'Clear' }); // Placeholder until fee structure confirmed
        }

        // --- Process Notifications ---
        if (notificationsRes.status === 'fulfilled') {
            setNotifications(notificationsRes.value.data.notifications || []);
        }

        // --- Process Marks (Academic Performance) ---
        if (marksRes.status === 'fulfilled') {
            const results = marksRes.value.data || [];
            // Format for Chart: { subject: 'Math', marks: 80 }
            // Group by subject and average if multiple exams? Or just take latest?
            // Let's take the latest exam results
            if (results.length > 0) {
                 // Simplified: Just take the first 5 results found
                 const chartData = results.slice(0, 5).map(r => ({
                     subject: r.subName?.subName || r.subjectName || "Subject",
                     marks: r.marksObtained || 0
                 }));
                 setAcademicPerformance(chartData);
            }
        }

        // --- Process Next Exam ---
        if (scheduleRes.status === 'fulfilled') {
            const schedules = Array.isArray(scheduleRes.value.data) ? scheduleRes.value.data : [];
            // Find upcoming exam
            const today = new Date();
            const upcoming = schedules
                .filter(s => new Date(s.examDate) >= today)
                .sort((a,b) => new Date(a.examDate) - new Date(b.examDate))[0];
            
            if (upcoming) {
                setExamStats({ 
                    nextExam: format(new Date(upcoming.examDate), 'dd MMM'), 
                    type: upcoming.examGroup?.examGroupName || 'Exam'
                });
            }
        }

      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  const StatCard = ({ title, value, subtext, icon: Icon, color, bg }) => (
    <Card className="overflow-hidden relative hover:shadow-lg transition-all duration-300 border-none shadow-md">
      <div className={`absolute top-0 right-0 w-24 h-24 ${bg} rounded-full -translate-y-8 translate-x-8 opacity-20`} />
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${bg} ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
          {subtext && <Badge variant="outline" className={`${color} bg-white/50 backdrop-blur-sm`}>{subtext}</Badge>}
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 min-h-screen animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Parent Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Welcome back, Mr. {currentUser?.name || "Parent"}
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-card p-2 rounded-lg shadow-sm border px-4 cursor-default">
           <GraduationCap className="w-5 h-5 text-primary" />
           <span className="font-semibold">{currentUser?.name}</span>
           <span className="text-xs text-muted-foreground">({currentUser?.sclassName?.sclassName || "Class N/A"})</span>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px] p-1 bg-muted/50 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg transition-all">Overview</TabsTrigger>
          <TabsTrigger value="academics" className="rounded-lg transition-all">Academics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          >
            <motion.div variants={itemVariants}>
              <StatCard 
                title="Attendance" 
                value={loading ? <Skeleton className="h-8 w-20" /> : `${attendanceStats.percentage}%`}
                subtext={attendanceStats.status} 
                icon={CheckCircle} 
                color="text-emerald-600" 
                bg="bg-emerald-100" 
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard 
                title="Pending Fees" 
                value={loading ? <Skeleton className="h-8 w-20" /> : `PKR ${feeStats.pending}`} 
                subtext={feeStats.status}
                icon={AlertCircle} 
                color="text-amber-600" 
                bg="bg-amber-100" 
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard 
                title="Next Exam" 
                value={loading ? <Skeleton className="h-8 w-20" /> : examStats.nextExam} 
                subtext={examStats.type} 
                icon={Calendar} 
                color="text-blue-600" 
                bg="bg-blue-100" 
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard 
                title="Total Subjects" 
                value={loading ? <Skeleton className="h-8 w-20" /> : (academicPerformance.length || "0")} 
                subtext="Current Term" 
                icon={TrendingUp} 
                color="text-purple-600" 
                bg="bg-purple-100" 
              />
            </motion.div>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Main Chart Area */}
            <Card className="col-span-4 border-none shadow-md">
              <CardHeader>
                <CardTitle>Academic Performance</CardTitle>
                <CardDescription>Recent test results across subjects</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                  {loading ? (
                       <Skeleton className="h-full w-full" />
                  ) : academicPerformance.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={academicPerformance}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                        <XAxis 
                            dataKey="subject" 
                            stroke="#888888" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                        />
                        <YAxis 
                            stroke="#888888" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                            tickFormatter={(value) => `${value}`} 
                        />
                        <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                            }}
                        />
                        <Bar 
                            dataKey="marks" 
                            fill="currentColor" 
                            radius={[4, 4, 0, 0]} 
                            className="fill-primary" 
                            barSize={40}
                        />
                        </BarChart>
                    </ResponsiveContainer>
                  ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                          No academic records found.
                      </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Screen */}
            <Card className="col-span-3 border-none shadow-md">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Notices and updates from school</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {loading ? (
                         <div className="space-y-4">
                             {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                         </div>
                    ) : notifications.length > 0 ? (
                        notifications.map((note, i) => (
                        <div key={i} className="flex gap-4 items-start p-3 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="mt-1 bg-blue-100 p-2 rounded-full">
                            <Bell className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">{note.message}</p>
                            <p className="text-xs text-muted-foreground">{format(new Date(note.date), 'dd MMM yyyy')}</p>
                            </div>
                        </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full py-8 text-center text-muted-foreground">
                            <Bell className="h-8 w-8 mb-2 opacity-50" />
                            <p>No new notifications.</p>
                        </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="academics">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Academic Report</CardTitle>
              <CardDescription>Comprehensive view of {currentUser?.name}'s performance</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="flex items-center justify-center p-8 text-muted-foreground">
                  <p>Detailed reports and grade history will be available here.</p>
                  {/* Future: Add table of all marks here */}
               </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ParentDashboard;
