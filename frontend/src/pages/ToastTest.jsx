import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '../context/ToastContext';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Info, AlertTriangle, Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ToastTest = () => {
  const { showToast } = useToast();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Component & Color Test Page</h1>
        <p className="text-muted-foreground mt-2">
          Test colors, components, and toast notifications
        </p>
      </div>

      {/* Color Variables Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>Shadcn Color Variables</CardTitle>
          <CardDescription>
            All theme color variables with their current values
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="red">Red</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="blue">Blue</SelectItem>
              </SelectContent>
            </Select>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Base Colors */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Base Colors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-12 h-12 rounded-md bg-background border-2" />
                <div>
                  <p className="text-sm font-medium">background</p>
                  <p className="text-xs text-muted-foreground">hsl(var(--background))</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-12 h-12 rounded-md bg-foreground" />
                <div>
                  <p className="text-sm font-medium">foreground</p>
                  <p className="text-xs text-muted-foreground">hsl(var(--foreground))</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-12 h-12 rounded-md bg-card border-2" />
                <div>
                  <p className="text-sm font-medium">card</p>
                  <p className="text-xs text-muted-foreground">hsl(var(--card))</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-12 h-12 rounded-md bg-popover border-2" />
                <div>
                  <p className="text-sm font-medium">popover</p>
                  <p className="text-xs text-muted-foreground">hsl(var(--popover))</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Colors */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Action Colors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-12 h-12 rounded-md bg-primary" />
                <div>
                  <p className="text-sm font-medium">primary</p>
                  <p className="text-xs text-muted-foreground">hsl(var(--primary))</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-12 h-12 rounded-md bg-secondary" />
                <div>
                  <p className="text-sm font-medium">secondary</p>
                  <p className="text-xs text-muted-foreground">hsl(var(--secondary))</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-12 h-12 rounded-md bg-muted" />
                <div>
                  <p className="text-sm font-medium">muted</p>
                  <p className="text-xs text-muted-foreground">hsl(var(--muted))</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-12 h-12 rounded-md bg-accent" />
                <div>
                  <p className="text-sm font-medium">accent</p>
                  <p className="text-xs text-muted-foreground">hsl(var(--accent))</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-12 h-12 rounded-md bg-destructive" />
                <div>
                  <p className="text-sm font-medium">destructive</p>
                  <p className="text-xs text-muted-foreground">hsl(var(--destructive))</p>
                </div>
              </div>
            </div>
          </div>

          {/* Border & Input */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Border & Input</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-12 h-12 rounded-md border-4 border-border bg-background" />
                <div>
                  <p className="text-sm font-medium">border</p>
                  <p className="text-xs text-muted-foreground">hsl(var(--border))</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-12 h-12 rounded-md bg-input" />
                <div>
                  <p className="text-sm font-medium">input</p>
                  <p className="text-xs text-muted-foreground">hsl(var(--input))</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-12 h-12 rounded-md border-4 border-ring bg-background" />
                <div>
                  <p className="text-sm font-medium">ring</p>
                  <p className="text-xs text-muted-foreground">hsl(var(--ring))</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Colors */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Sidebar Colors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-12 h-12 rounded-md bg-sidebar" />
                <div>
                  <p className="text-sm font-medium">sidebar</p>
                  <p className="text-xs text-muted-foreground">hsl(var(--sidebar-background))</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-12 h-12 rounded-md bg-sidebar-primary" />
                <div>
                  <p className="text-sm font-medium">sidebar-primary</p>
                  <p className="text-xs text-muted-foreground">hsl(var(--sidebar-primary))</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-12 h-12 rounded-md bg-sidebar-accent" />
                <div>
                  <p className="text-sm font-medium">sidebar-accent</p>
                  <p className="text-xs text-muted-foreground">hsl(var(--sidebar-accent))</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Toast Types */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Toast Types</CardTitle>
          <CardDescription>
            Using useToast() hook - automatically saved to notification history
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            onClick={() => showToast('Operation completed successfully!', 'success')}
            className="gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Success Toast
          </Button>

          <Button
            variant="destructive"
            onClick={() => showToast('Something went wrong!', 'error')}
            className="gap-2"
          >
            <XCircle className="w-4 h-4" />
            Error Toast
          </Button>

          <Button
            variant="secondary"
            onClick={() => showToast('Here is some useful information', 'info')}
            className="gap-2"
          >
            <Info className="w-4 h-4" />
            Info Toast
          </Button>

          <Button
            variant="outline"
            onClick={() => showToast('Warning: Please be careful!', 'warning')}
            className="gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Warning Toast
          </Button>
        </CardContent>
      </Card>

      {/* Advanced Sonner Features */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Features</CardTitle>
          <CardDescription>
            Using Sonner directly for advanced features
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() =>
              toast.success('Student Added Successfully', {
                description: 'Roll No: 2024001, Class: 10th Grade',
              })
            }
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            With Description
          </Button>

          <Button
            variant="secondary"
            onClick={() =>
              toast('Event Created', {
                description: 'Monday, Feb 3, 2026 at 2:00 PM',
                action: {
                  label: 'View',
                  onClick: () => console.log('View clicked'),
                },
              })
            }
            className="gap-2"
          >
            <Info className="w-4 h-4" />
            With Action
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              const promise = new Promise((resolve) => 
                setTimeout(() => resolve({ name: 'Data' }), 2000)
              );
              
              toast.promise(promise, {
                loading: 'Loading data...',
                success: (data) => `${data.name} loaded successfully!`,
                error: 'Failed to load data',
              });
            }}
            className="gap-2"
          >
            <Info className="w-4 h-4" />
            Promise Toast
          </Button>

          <Button
            variant="outline"
            onClick={() =>
              toast.success('Auto-close in 10 seconds', {
                duration: 10000,
              })
            }
            className="gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Custom Duration
          </Button>
        </CardContent>
      </Card>

      {/* Multiple Toasts */}
      <Card>
        <CardHeader>
          <CardTitle>Multiple Toasts</CardTitle>
          <CardDescription>
            Test multiple toasts at once
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => {
              showToast('First notification', 'info');
              setTimeout(() => showToast('Second notification', 'success'), 500);
              setTimeout(() => showToast('Third notification', 'warning'), 1000);
            }}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Show Multiple Toasts
          </Button>
        </CardContent>
      </Card>

      {/* Rich Content Example */}
      <Card>
        <CardHeader>
          <CardTitle>Rich Content</CardTitle>
          <CardDescription>
            Custom JSX content in toast
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() =>
              toast(
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Payment Received</p>
                    <p className="text-sm text-muted-foreground">Fee Collection - PKR 5,000</p>
                  </div>
                </div>
              )
            }
          >
            Rich Content Toast
          </Button>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Implementation Note</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>useToast() hook:</strong> Saves notifications to backend for history tracking
          </p>
          <p>
            <strong>Direct toast() import:</strong> Only shows UI notification, no backend storage
          </p>
          <p className="text-muted-foreground">
            For production use, prefer <code className="px-1.5 py-0.5 rounded bg-muted">useToast()</code> to maintain notification history.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ToastTest;
