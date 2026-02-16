import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isTeacher = currentUser?.userType === 'teacher';
  const isParent = currentUser?.userType === 'parent';
  const basePath = isTeacher ? '/teacher' : (isParent ? '/parent' : '/admin');
  const [extraBreadcrumb, setExtraBreadcrumb] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  // Reset extra breadcrumb on route change
  useEffect(() => {
    setExtraBreadcrumb(null);
  }, [location.pathname]);

  // Generate breadcrumb dari current path
  const generateBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const basePath = paths[0]; // 'admin' or 'teacher'

    // Skip first segment (admin/teacher)
    const pathsWithoutBase = paths.slice(1);

    // Convert path to readable title
    const toTitle = (str) => {
      return str
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    return pathsWithoutBase.map((path, index) => {
      const href = `/${basePath}/${pathsWithoutBase.slice(0, index + 1).join('/')}`;
      const isLast = index === pathsWithoutBase.length - 1;
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

  const handleSelect = (path) => {
    setOpen(false);
    navigate(path);
  };

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
                  {breadcrumbs.map((crumb, index) => (
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
