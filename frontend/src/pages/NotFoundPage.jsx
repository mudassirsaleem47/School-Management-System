import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-background text-center px-4">
      <div className="bg-muted/50 p-6 rounded-full mb-6">
        <FileQuestion className="h-24 w-24 text-muted-foreground opacity-50" />
      </div>
      
      <h1 className="text-6xl font-extrabold text-primary mb-4 tracking-tight">404</h1>
      <h2 className="text-3xl font-bold mb-2">Page Not Found</h2>
      
      <p className="text-muted-foreground text-lg mb-8 max-w-md">
        Oops! The page you are looking for doesn't exist, has been moved, or you don't have permission to view it.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          variant="outline" 
          size="lg" 
          onClick={() => navigate(-1)}
          className="w-full sm:w-auto"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Go Back
        </Button>
        <Button 
          size="lg" 
          onClick={() => navigate('/')}
          className="w-full sm:w-auto"
        >
          <Home className="mr-2 h-5 w-5" />
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
