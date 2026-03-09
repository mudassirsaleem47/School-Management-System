import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  IconUsers,
  IconSchool,
  IconBook,
  IconChartBar,
} from "@tabler/icons-react";
import SearchBar from './SearchBar';
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import CalendarDialog from "./CalendarDialog";
import TaskModal from "./TaskModal";



const AdminLayout = () => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const isTeacher = currentUser?.userType === 'teacher';
  const isParent = currentUser?.userType === 'parent';
  const isAccountant = currentUser?.userType === 'accountant';
  const isReceptionist = currentUser?.userType === 'receptionist';
  const basePath = isTeacher ? '/teacher' : (isParent ? '/parent' : (isAccountant ? '/accountant' : (isReceptionist ? '/receptionist' : '/admin')));
  const [extraBreadcrumb, setExtraBreadcrumb] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  // Reset extra breadcrumb on route change
  useEffect(() => {
    setExtraBreadcrumb(null);
  }, [location.pathname]);

  // Dynamic Browser Tab Title
  useEffect(() => {
    if (!currentUser) return;

    // 1. Get School Name from currentUser (handles different user types)
    const schoolName = currentUser.schoolName || currentUser.school?.schoolName || "School Management System";

    // 2. Determine Page Name from path
    const paths = location.pathname.split('/').filter(Boolean);
    const lastSegment = paths[paths.length - 1];

    // Convert slug to Title Case (e.g. "student-list" -> "Student List")
    const toTitle = (str) => {
      if (!str) return "Dashboard";
      return str
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    let pageTitle = toTitle(lastSegment);

    // 3. Set Document Title
    if (pageTitle.toLowerCase() === "dashboard" || paths.length <= 1) {
      document.title = schoolName;
    } else {
      document.title = `${pageTitle} - ${schoolName}`;
    }
  }, [location.pathname, currentUser]);


  // Apply Theme Globals from Storage
  useEffect(() => {
    try {
      const savedAccent = localStorage.getItem('sms_accentColor');
      if (savedAccent) {
        const color = JSON.parse(savedAccent);
        const root = document.documentElement;
        const isDark = root.classList.contains('dark');
        const hslValue = isDark ? color.hslDark : color.hsl;
        root.style.setProperty('--primary', hslValue);
        root.style.setProperty('--ring', color.ring);
        root.style.setProperty('--sidebar-primary', hslValue);
        root.style.setProperty('--sidebar-primary-foreground', isDark ? '0 0% 9%' : '0 0% 98%');

        // Sidebar hover box — light tint of accent color
        // Parse H S from hslValue (format: "H S% L%") and override L for a soft muted bg
        const parts = hslValue.split(' ');
        if (parts.length >= 2) {
          const hs = `${parts[0]} ${parts[1]}`; // e.g. "220 70%"
          const accentBg = isDark ? `${hs} 20%` : `${hs} 94%`;   // very light / very dark tint
          const accentFg = isDark ? `${hs} 80%` : `${hs} 25%`;   // readable foreground
          root.style.setProperty('--sidebar-accent', accentBg);
          root.style.setProperty('--sidebar-accent-foreground', accentFg);
        }
      }

      const savedRadius = localStorage.getItem('sms_borderRadius');
      if (savedRadius) document.documentElement.style.setProperty('--radius', savedRadius);

      const savedFont = localStorage.getItem('sms_fontSize');
      if (savedFont) document.documentElement.style.fontSize = savedFont;


    } catch (e) {
      console.error('Failed to apply theme preferences:', e);
    }
  }, []);

  // Generate breadcrumb dari current path
  const generateBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const basePath = paths[0]; // 'admin' or 'teacher'

    // Skip first segment (admin/teacher)
    const pathsWithoutBase = paths.slice(1);

    // MongoDB ObjectId pattern (24 hex chars)
    const isObjectId = (str) => /^[a-f0-9]{24}$/i.test(str);

    // Convert path to readable title
    const toTitle = (str) => {
      return str
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    // Filter out ObjectId segments
    const filteredPaths = pathsWithoutBase.filter(p => !isObjectId(p));

    return filteredPaths.map((path, index) => {
      // Rebuild href using original paths (with IDs) for correct navigation
      const href = `/${basePath}/${pathsWithoutBase.slice(0, pathsWithoutBase.indexOf(path) + 1).join('/')}`;
      const isLast = index === filteredPaths.length - 1;
      const title = toTitle(path);

      // Skip "Dashboard" from dynamic crumbs to avoid redundancy with the static root crumb
      if (title === "Dashboard") return null;

      return {
        title: title,
        href: href,
        isLast: isLast
      };
    }).filter(Boolean); // Filter out nulls
  };

  const breadcrumbs = generateBreadcrumbs();



  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header with Breadcrumb */}
        <header className="flex h-16 shrink-0 sticky top-0 z-50 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {/* Dashboard Link - Always visible as root */}
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink asChild>
                  <Link to={`${basePath}/dashboard`}>Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>

              {/* Dynamic Breadcrumbs */}
              {breadcrumbs.length > 0 && (
                <>
                  <BreadcrumbSeparator className="hidden md:block" />
                  {breadcrumbs.map((crumb) => (
                    <React.Fragment key={crumb.href}>
                      <BreadcrumbItem>
                        {crumb.isLast && !extraBreadcrumb ? (
                          <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={crumb.href}>{crumb.title}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {(!crumb.isLast || extraBreadcrumb) && <BreadcrumbSeparator />}
                    </React.Fragment>
                  ))}
                  {extraBreadcrumb && (
                    <BreadcrumbItem>
                      <BreadcrumbPage>{extraBreadcrumb}</BreadcrumbPage>
                    </BreadcrumbItem>
                  )}
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto w-full max-w-sm flex items-center gap-2">
            <SearchBar />
            <TaskModal />
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={() => setShowCalendar(true)}
              title="Open Calendar"
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 flex-col gap-6 p-4">
          <Outlet context={{ setExtraBreadcrumb }} />
        </div>
      </SidebarInset>

      <CalendarDialog open={showCalendar} onOpenChange={setShowCalendar} />
    </SidebarProvider>
  );
};

export default AdminLayout;
