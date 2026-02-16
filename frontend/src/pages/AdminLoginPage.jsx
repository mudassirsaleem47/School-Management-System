import { Link, useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/login-form';
import { TeacherLoginForm } from '../components/teacher-login-form';
import { ParentLoginForm } from '../components/parent-login-form';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Shield, GraduationCap, Users } from 'lucide-react';

const AdminLoginPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground">
      <div className="w-full max-w-md">
        {/* Existing Admin/Teacher Tabs */}
        <Tabs defaultValue="admin" className="w-full">
          {/* Navigation Tabs */}
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="admin" className="gap-2">
              <Shield className="w-4 h-4" />
              Admin
            </TabsTrigger>
            <TabsTrigger value="teacher" className="gap-2">
              <GraduationCap className="w-4 h-4" />
              Teacher
            </TabsTrigger>
            <TabsTrigger value="parent" className="gap-2">
              <Users className="w-4 h-4" />
              Parent
            </TabsTrigger>
          </TabsList>

          {/* Login Forms */}
          <TabsContent value="admin" className="mt-0">
            <LoginForm />
          </TabsContent>

          <TabsContent value="teacher" className="mt-0">
            <TeacherLoginForm />
          </TabsContent>

          <TabsContent value="parent" className="mt-0">
            <ParentLoginForm />
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

export default AdminLoginPage;