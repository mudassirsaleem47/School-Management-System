
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import API_URL from '../../config/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, FileText, Trophy } from 'lucide-react';

const ParentReportCard = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState([]);

    useEffect(() => {
    const fetchResults = async () => {
        try {
            if (!currentUser?._id) return;
            setLoading(true);
            const res = await axios.get(`${API_URL}/ExamResults/Student/${currentUser._id}`);
            setResults(res.data);
        } catch (err) {
            console.error("Error fetching results:", err);
        } finally {
            setLoading(false);
        }
    };
    fetchResults();
    }, [currentUser]);

    const getGradeColor = (grade) => {
        if (!grade) return 'bg-gray-100';
        if (grade.startsWith('A')) return 'bg-green-100 text-green-800';
        if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800';
        if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800';
        if (grade.startsWith('D')) return 'bg-orange-100 text-orange-800';
        return 'bg-red-100 text-red-800';
    };

    return (
        <div className="flex-1 p-8 pt-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Report Card</h2>
                    <p className="text-muted-foreground mt-1">Academic performance and exam results</p>
                </div>
                 <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Download PDF
                </Button>
            </div>

            <div className="grid gap-6">
                {results.length === 0 ? (
                    <Card className="text-center py-12">
                         <div className="flex justify-center mb-4">
                            <Trophy className="h-12 w-12 text-muted-foreground opacity-20" />
                        </div>
                        <h3 className="text-lg font-medium">No Exam Results Yet</h3>
                        <p className="text-muted-foreground">Results will appear here once exams are graded.</p>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Exam Results</CardTitle>
                            <CardDescription>
                                Detailed breakdown of marks by subject
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Exam Name</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Marks Obtained</TableHead>
                                        <TableHead>Total Marks</TableHead>
                                        <TableHead>Grade</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {results.map((result, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">
                                                {result.examGroup?.examGroupName || "Term Exam"}
                                            </TableCell>
                                            <TableCell>{result.subName?.subName || "Subject"}</TableCell>
                                            <TableCell>{result.marksObtained}</TableCell>
                                            <TableCell>100</TableCell> {/* Assuming 100 or need to fetch max marks */}
                                            <TableCell>
                                                <Badge className={getGradeColor("A")}> {/* Placeholder grade logic until backend returns grade */}
                                                    A
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default ParentReportCard;
