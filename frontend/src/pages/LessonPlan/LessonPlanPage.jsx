import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Calendar, ListChecks, CheckSquare } from 'lucide-react';
import LessonList from './components/LessonList';
import LessonPlanManager from './components/LessonPlanManager';
import SyllabusStatus from './components/SyllabusStatus';

const LessonPlanPage = () => {
    return (
        <div className="flex-1 p-8 pt-6 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Lesson Plan</h2>
            </div>
            
            <Tabs defaultValue="lessons" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="lessons" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" /> Lessons & Topics
                    </TabsTrigger>
                    <TabsTrigger value="manage" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Manage Lesson Plan
                    </TabsTrigger>
                    <TabsTrigger value="status" className="flex items-center gap-2">
                        <CheckSquare className="h-4 w-4" /> Syllabus Status
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="lessons" className="space-y-4">
                    <LessonList />
                </TabsContent>
                
                <TabsContent value="manage" className="space-y-4">
                    <LessonPlanManager />
                </TabsContent>
                
                <TabsContent value="status" className="space-y-4">
                    <SyllabusStatus />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default LessonPlanPage;
