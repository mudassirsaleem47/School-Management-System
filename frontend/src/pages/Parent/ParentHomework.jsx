
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { BookOpen, Calendar, CheckCircle, Clock } from 'lucide-react';

// Mock Data until backend "Homework" module is created
const MOCK_HOMEWORK = [
    { id: 1, subject: 'Mathematics', title: 'Algebra Exercises', description: 'Complete Ex 5.1 Q1 to Q10 in notebook.', dueDate: new Date(new Date().setDate(new Date().getDate() + 1)), status: 'Pending' },
    { id: 2, subject: 'English', title: 'Essay Writing', description: 'Write an essay on "My Favourite Hobby" (200 words).', dueDate: new Date(new Date().setDate(new Date().getDate() + 2)), status: 'Pending' },
    { id: 3, subject: 'Science', title: 'Chapter 3 Reading', description: 'Read Chapter 3 and highlight important definitions.', dueDate: new Date(), status: 'Completed' },
    { id: 4, subject: 'Urdu', title: 'Nazm Tashreeh', description: 'Write tashreeh of first 2 verses.', dueDate: new Date(new Date().setDate(new Date().getDate() - 1)), status: 'Overdue' },
];

const ParentHomework = () => {
    const { currentUser } = useAuth();
    const [homework, setHomework] = useState(MOCK_HOMEWORK);

    const getStatusColor = (status) => {
        switch(status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
            case 'Completed': return 'bg-green-100 text-green-700 hover:bg-green-200';
            case 'Overdue': return 'bg-red-100 text-red-700 hover:bg-red-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="flex-1 p-8 pt-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Homework & Assignments</h2>
                    <p className="text-muted-foreground mt-1">Daily tasks and project deadlines</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-1">
                {homework.map((item) => (
                    <Card key={item.id} className="shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                    {item.subject}: {item.title}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-4 text-sm mt-1">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" /> Due: {format(item.dueDate, 'PPP')}
                                    </span>
                                </CardDescription>
                            </div>
                            <Badge className={`${getStatusColor(item.status)} border-none`}>
                                {item.status}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 mb-4 bg-muted/50 p-3 rounded-md">
                                {item.description}
                            </p>
                            <div className="flex justify-end gap-2">
                                {item.status === 'Pending' && (
                                     <Button variant="outline" size="sm" className="text-xs">Mark as Done</Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ParentHomework;
