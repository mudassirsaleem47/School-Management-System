import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCampus } from '../context/CampusContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config/api';
import {
  IconUsers,
  IconSchool,
  IconBook,
  IconCurrencyDollar,
  IconTrendingUp,
  IconActivity,
  IconClock,
  IconArrowUpRight,
  IconCalendar,
  IconBell,
  IconChartBar
} from '@tabler/icons-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const { selectedCampus, campuses } = useCampus();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classes: 0,
    revenue: 0,
    capacity: 0
  });
  const [activities, setActivities] = useState([]);
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser, selectedCampus, campuses]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Stats (Students, Teachers, Classes)
      let studentCount = 0;
      let teacherCount = 0;
      let classCount = 0;

      if (selectedCampus) {
        // Fetch specific campus stats
        const res = await axios.get(`${API_URL}/CampusStats/${selectedCampus._id}`);
        if (res.data.success) {
          const s = res.data.stats;
          studentCount = s.totalStudents;
          teacherCount = s.totalTeachers;
          classCount = s.totalClasses;
        }
      } else if (campuses.length > 0) {
        // Fetch and sum all campuses
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

      // 2. Fetch Revenue (School Wide)
      let revenue = 0;
      try {
        const incomeRes = await axios.get(`${API_URL}/IncomeStatistics/${currentUser._id}`);
        revenue = incomeRes.data.totalIncome?.amount || 0;
      } catch (err) {
        console.error("Error fetching revenue:", err);
      }

      setStats({
        students: studentCount,
        teachers: teacherCount,
        classes: classCount,
        revenue: revenue
      });

      // 3. Fetch Recent Activities (Notifications)
      try {
        const notifRes = await axios.get(`${API_URL}/Notifications/${currentUser._id}`);
        setActivities(notifRes.data.slice(0, 5)); // Top 5 recent
        setNotifications(notifRes.data.filter(n => !n.read).slice(0, 5)); // Unread
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }

      // 4. Fetch Upcoming Events
      try {
        const eventRes = await axios.get(`${API_URL}/Events/${currentUser._id}`);
        // Filter upcoming events
        const upcoming = eventRes.data
          .filter(e => new Date(e.date) >= new Date())
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 3);
        setEvents(upcoming);
      } catch (err) {
        console.error("Error fetching events:", err);
      }

    } catch (error) {
      console.error("Dashboard data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      icon: IconUsers,
      label: 'Total Students',
      count: stats.students,
      change: '+0%', // Placeholder for trend
      trend: 'neutral'
    },
    {
      icon: IconSchool,
      label: 'Total Teachers',
      count: stats.teachers,
      change: '+0%',
      trend: 'neutral'
    },
    {
      icon: IconBook,
      label: 'Total Classes',
      count: stats.classes,
      change: '+0%',
      trend: 'neutral'
    },
    {
      icon: IconCurrencyDollar,
      label: 'Revenue',
      count: `PKR ${stats.revenue.toLocaleString()}`,
      change: '+0%',
      trend: 'up'
    },
  ];

  const quickActions = [
    { label: 'Student Admission', icon: IconUsers, route: '/admin/admissions', color: 'text-blue-600' },
    { label: 'Manage Classes', icon: IconBook, route: '/admin/classes', color: 'text-indigo-600' },
    { label: 'View Schedule', icon: IconCalendar, route: '/admin/class-schedule', color: 'text-purple-600' },
    { label: 'Manage Subjects', icon: IconBook, route: '/admin/subjects', color: 'text-green-600' },
    { label: 'View Students', icon: IconSchool, route: '/admin/students', color: 'text-orange-600' },
    { label: 'Teacher Schedule', icon: IconClock, route: '/admin/teacher-schedule', color: 'text-pink-600' },
  ];

  return (
    <div className="space-y-6 p-6">

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stat.count}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  {stat.trend === 'up' && (
                    <IconTrendingUp className="h-3 w-3 text-green-600" />
                  )}
                  <span className={stat.trend === 'up' ? 'text-green-600' : ''}>
                    {stat.change} from last month
                  </span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system updates</CardDescription>
              </div>
              <IconActivity className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading activities...</p>
              ) : activities.length > 0 ? (
                activities.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="mt-1">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message || "New activity"}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <IconClock className="h-3 w-3" />
                        {activity.date ? format(new Date(activity.date), 'MMM dd, h:mm a') : 'Just now'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={idx}
                    variant="ghost"
                    className="justify-start h-auto py-3"
                    onClick={() => navigate(action.route)}
                  >
                    <Icon className={`h-4 w-4 mr-3 ${action.color}`} />
                    <span className="text-sm">{action.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Events</CardTitle>
              <IconCalendar className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading events...</p>
              ) : events.length > 0 ? (
                events.map((event, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex flex-col items-center justify-center bg-primary/10 text-primary rounded-md p-2 min-w-[48px]">
                      <span className="text-xs font-medium uppercase">
                        {event.date ? format(new Date(event.date), 'MMM') : 'EVT'}
                      </span>
                      <span className="text-lg font-bold">
                        {event.date ? format(new Date(event.date), 'dd') : '00'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{event.eventName || "Event"}</p>
                      <p className="text-xs text-muted-foreground">{event.description || "No description"}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming events</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Notifications</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="h-5 px-2">
                  {notifications.length}
                </Badge>
                <IconBell className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : notifications.length > 0 ? (
                notifications.map((notif, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500 mt-2 shrink-0" />
                    <div>
                       <p className="text-sm font-medium">{notif.message}</p>
                       <p className="text-xs text-muted-foreground">
                         {notif.date ? format(new Date(notif.date), 'MMM dd') : ''}
                       </p>
                     </div>
                   </div>
                 ))
              ) : (
                <p className="text-sm text-muted-foreground">No new notifications</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance (Placeholder for now) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Performance</CardTitle>
              <IconChartBar className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Attendance Rate</span>
                  <span className="text-sm font-bold">94%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-green-600" style={{ width: '94%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Pass Rate</span>
                  <span className="text-sm font-bold">87%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600" style={{ width: '87%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Staff Satisfaction</span>
                  <span className="text-sm font-bold">92%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600" style={{ width: '92%' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;