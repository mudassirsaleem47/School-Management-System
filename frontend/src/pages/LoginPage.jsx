import React from 'react';
import { LoginForm } from '../components/login-form';
import { TeacherLoginForm } from '../components/teacher-login-form';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Shield, GraduationCap } from 'lucide-react';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md">
        <Tabs defaultValue="admin" className="w-full">
          {/* Navigation Tabs */}
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="admin" className="gap-2">
              <Shield className="w-4 h-4" />
              Admin
            </TabsTrigger>
            <TabsTrigger value="teacher" className="gap-2">
              <GraduationCap className="w-4 h-4" />
              Teacher
            </TabsTrigger>
          </TabsList>

          {/* Login Forms */}
          <TabsContent value="admin" className="mt-0">
            <LoginForm />
          </TabsContent>

          <TabsContent value="teacher" className="mt-0">
            <TeacherLoginForm />
          </TabsContent>
        </Tabs>

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
    </div>
  );
};

export default LoginPage;
