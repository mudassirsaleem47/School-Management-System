import React, { useState, useEffect } from 'react';
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
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  IconSearch,
  IconUsers,
  IconSchool,
  IconBook,
  IconCalendar,
  IconCurrencyDollar,
  IconFileText,
  IconSettings,
  IconChartBar,
  IconUserPlus,
  IconClipboardList
} from "@tabler/icons-react";



const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Keyboard shortcut for Ctrl+K
  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Navigation items for search
  const navigationItems = [
    {
      group: "Main",
      items: [
        { name: "Dashboard", icon: IconChartBar, path: "/admin/dashboard" },
        { name: "Students", icon: IconUsers, path: "/admin/students" },
        { name: "Teachers", icon: IconSchool, path: "/admin/teachers" },
        { name: "Classes", icon: IconBook, path: "/admin/classes" },
      ]
    },
    {
      group: "Academic",
      items: [
        { name: "Subjects", icon: IconBook, path: "/admin/subjects" },
      ]
    }
  ];

  // Generate breadcrumb dari current path
  const generateBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);

    // Skip first 'admin' segment
    const pathsWithoutAdmin = paths.slice(1);

    // Convert path to readable title
    const toTitle = (str) => {
      return str
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    return pathsWithoutAdmin.map((path, index) => {
      const href = `/admin/${pathsWithoutAdmin.slice(0, index + 1).join('/')}`;
      const isLast = index === pathsWithoutAdmin.length - 1;

      return {
        title: toTitle(path),
        href: href,
        isLast: isLast
      };
    });
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
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {/* Dashboard Link */}
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink asChild>
                  <Link to="/admin/dashboard">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>

              {/* Dynamic Breadcrumbs */}
              {breadcrumbs.length > 0 && (
                <>
                  <BreadcrumbSeparator className="hidden md:block" />
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb.href}>
                      <BreadcrumbItem>
                        {crumb.isLast ? (
                          <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={crumb.href}>{crumb.title}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {!crumb.isLast && <BreadcrumbSeparator />}
                    </React.Fragment>
                  ))}
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>


          {/* Search Bar Trigger */}
        
        </header>


        {/* Main Content */}
        <div className="flex flex-1 flex-col gap-6 p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminLayout;