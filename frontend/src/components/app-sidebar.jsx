import * as React from "react"
import {
  IconBook,
  IconBriefcase,
  IconBuildingSkyscraper,
  IconCurrencyDollar,
  IconFileText,
  IconId,
  IconMessage,
  IconSchool,
  IconSettings,
  IconUsers,
  IconWallet,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAuth } from "../context/AuthContext"

// This is sample data.
const navMainData = [
  { 
      title: 'Front Office', 
      icon: IconBriefcase,
      items: [
          { title: 'Admission Enquiry', url: '/admin/enquiry' },
          { title: 'Visitor Book', url: '/admin/visitor-book' },
          { title: 'Phone Call Log', url: '/admin/phone-calls' },
          { title: 'Complain', url: '/admin/complain' },
      ]
  },
  { 
      title: 'Student Information', 
      icon: IconSchool, 
      items: [
          { title: 'Students Details', url: '/admin/students' },
          { title: 'Student Admission', url: '/admin/admission' },
          { title: 'Disabled Students', url: '/admin/students/disabled' },
          { title: 'Disable Reasons', url: '/admin/students/disable-reasons' },
      ]
  },
  { 
      title: 'Academics', 
      icon: IconBook, 
      items: [
          { title: 'Classes', url: '/admin/classes' },
          { title: 'Subjects', url: '/admin/subjects' },
          { title: 'Class Schedule', url: '/admin/class-schedule' },
          { title: 'Teacher Schedule', url: '/admin/teacher-schedule' },
          { title: 'Promote Students', url: '/admin/promote' },
      ]
  },
  { 
      title: 'Fees Collections',    
      icon: IconCurrencyDollar, 
      items: [
          { title: 'Collect Fees', url: '/admin/fee-collection' },
          { title: 'Assign Fees', url: '/admin/fee-assignment' },
          { title: 'Fee Management', url: '/admin/fee-management' },
          { title: 'Fee Reports', url: '/admin/fee-reports' },
      ]
  },
  {
      title: 'Finance',
      icon: IconWallet,
      items: [
          { title: 'Income Management', url: '/admin/income' },
          { title: 'Expense Management', url: '/admin/expense' },
      ]
  },
  {
      title: 'Examinations',
      icon: IconBook,
      items: [
          { title: 'Exam Groups', url: '/admin/exam-groups' },
          { title: 'Exam Schedule', url: '/admin/exam-schedule' },
          { title: 'Exam Result', url: '/admin/exam-result' },
          { title: 'Marks Grade', url: '/admin/marks-grade' },
          { title: 'Marks Division', url: '/admin/marks-division' },
      ]
  },
  {
      title: 'Staff Management',
      icon: IconUsers,
      items: [
          { title: 'Staff List', url: '/admin/staff' },
          { title: 'Designations', url: '/admin/designations' },
      ]
  },
  {
      title: 'Communication',
      icon: IconMessage,
      items: [
          { title: 'Send Messages', url: '/admin/send-messages' },
          { title: 'Message Templates', url: '/admin/message-templates' },
          { title: 'Message Report', url: '/admin/message-report' },
          { title: 'Birthday Wishes', url: '/admin/birthday-wishes' },
          { title: 'Messaging Setup', url: '/admin/messaging-setup' },
      ]
  },
  {
      title: 'Card Management',
      icon: IconId,
      items: [
          { title: 'Student ID Card', url: '/admin/card-management/student' },
          { title: 'Staff ID Card', url: '/admin/card-management/staff' },
          { title: 'Result Card', url: '/admin/report-card' },
          { title: 'Template Designer', url: '/admin/card-management/designer' },
      ]
  },
  { title: 'Campuses', url: '/admin/campuses', icon: IconBuildingSkyscraper },
  { title: 'Reports', url: '/admin/reports', icon: IconFileText },
  { 
    title: 'Settings', 
    icon: IconSettings,
    items: [
      { title: 'Profile Settings', url: '/admin/settings' },
      { title: 'Toast Test', url: '/admin/toast-test' },
    ]
  },
]

export function AppSidebar({
  ...props
}) {
  const { currentUser } = useAuth();
  
  // Prepare user data for NavUser component
  const userData = {
    name: currentUser?.name || "Admin",
    email: currentUser?.email || "admin@school.com",
    avatar: currentUser?.avatar || "/avatars/admin.png",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainData} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
