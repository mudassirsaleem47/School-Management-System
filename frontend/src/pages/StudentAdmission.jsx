import React from 'react';
import StudentAdmissionForm from '../components/forms/StudentAdmissionForm';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, GraduationCap, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StudentAdmission = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editStudentId = searchParams.get('edit');

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header */}
            <div className="flex flex-col gap-4">


                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                {editStudentId ? <Pencil className="h-8 w-8 text-primary" /> : <GraduationCap className="h-8 w-8 text-primary" />}
                            </div>
                            {editStudentId ? "Edit Student" : "Student Admission"}
                        </h2>
                        <p className="text-muted-foreground mt-2 max-w-2xl">
                            {editStudentId 
                                ? "Update the student's details below." 
                                : "Complete the admission form below to register a new student. Ensure all required documents and details are accurate."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Container */}
            <div className="grid gap-6">
                <StudentAdmissionForm
                    editStudentId={editStudentId} // pass ID
                    onSuccess={() => navigate('/admin/students')}
                    onCancel={() => navigate(-1)}
                />
            </div>
        </div>
    );
};

export default StudentAdmission;
