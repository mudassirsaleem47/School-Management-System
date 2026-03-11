
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import API_URL from '../config/api'; // Assuming this exists based on context
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Clock, Bell, GraduationCap } from "lucide-react";

const TeacherDashboard = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!currentUser?._id) return;
        
        // Parallel fetching
        const [notificationsRes] = await Promise.all([
          axios.get(`${API_URL}/Notifications/${currentUser._id}`)
        ]);

        setNotifications(notificationsRes.data.message ? [] : notificationsRes.data);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    Welcome back, {currentUser?.name || "Teacher"}
                </h2>
                <p className="text-muted-foreground">
                    Here's what's happening in your classes today.
                </p>
            </div>
            <div className="flex items-center space-x-2">
                <Badge variant="outline" className="px-3 py-1 text-sm">
                    {new Date().toLocaleDateString()}
                </Badge>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Assigned Classes</CardTitle>
                    <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{currentUser?.assignedClasses?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">Active classes</p>
                </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Subject</CardTitle>
                    <BookOpen className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{currentUser?.subject || "N/A"}</div>
                    <p className="text-xs text-muted-foreground">Primary Subject</p>
                </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-orange-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                    <Bell className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{notifications.length}</div>
                    <p className="text-xs text-muted-foreground">Unread messages</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-1">
            {/* Notifications */}
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>
                        Recent updates and notices.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[300px] w-full pr-4">
                        {notifications.length > 0 ? (
                            <div className="space-y-4">
                                {notifications.map((note, index) => (
                                    <div key={index} className="flex flex-col gap-1 p-3 rounded-lg border bg-card/50 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-sm">{note.title || "Notification"}</span>
                                            <span className="text-xs text-muted-foreground">{new Date(note.date).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground max-h-12 overflow-hidden text-ellipsis">
                                            {note.message}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                <Bell className="h-8 w-8 mb-2 opacity-50" />
                                <p>No new notifications.</p>
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
        
        {/* Classes Overview */}
        <Card className="col-span-4 hover:shadow-md transition-shadow">
            <CardHeader>
                <CardTitle>My Classes</CardTitle>
                <CardDescription>Classes you are currently managing.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-4">
                    {currentUser?.assignedClasses?.length > 0 ? (
                        currentUser.assignedClasses.map((cls, idx) => (
                            <div key={idx} className="flex items-center p-4 border rounded-lg bg-accent/10 min-w-[150px]">
                                <GraduationCap className="h-8 w-8 mr-3 text-primary" />
                                <div>
                                    <p className="font-bold">{cls.sclassName || "Class"}</p>
                                    <p className="text-xs text-muted-foreground">Assigned</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted-foreground">No classes assigned yet.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    </div>
  );
};

export default TeacherDashboard;
