import React from 'react';
import { Link } from 'react-router-dom';
import { RegisterForm } from '../components/register-form';
import { Shield, GraduationCap } from 'lucide-react';

const AdminRegisterPage = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground">
            {/* Navigation Tabs */}
            <div className="w-full max-w-md mb-6">
                <div className="bg-card rounded-lg shadow-md p-2 flex gap-2">
                    <Link
                        to="/AdminLogin"
                        className="flex-1 px-6 py-3 bg-muted text-muted-foreground rounded-lg font-medium text-center transition hover:bg-muted/80 flex items-center justify-center gap-2"
                    >
                        <Shield className="w-5 h-5" />
                        Login
                    </Link>
                    <Link
                        to="/AdminRegister"
                        className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium text-center transition hover:bg-primary/90 flex items-center justify-center gap-2"
                    >
                        <GraduationCap className="w-5 h-5" />
                        Register
                    </Link>
                </div>
            </div>

            {/* Register Form */}
            <div className="w-full max-w-md">
                <RegisterForm />
            </div>

            {/* Support */}
            <div className="mt-6 text-center">
                <p className="text-muted-foreground text-sm">
                    Need help?{' '}
                    <a href="#" className="text-primary hover:underline font-medium">
                        Contact support
                    </a>
                </p>
            </div>
        </div>
    );
};

export default AdminRegisterPage;