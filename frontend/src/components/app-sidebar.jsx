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
  IconBus,
  IconCalendar,
} from "@tabler/icons-react"

import { Link } from "react-router-dom"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { useAuth } from "../context/AuthContext"

// Admin full navigation
const adminNavData = [
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
    title: 'Lesson Plan',
    icon: IconBook,
    items: [
      { title: 'Lessons & Topics', url: '/admin/lesson-plan/topics' },
      { title: 'Manage Lesson Plan', url: '/admin/lesson-plan/manage' },
      { title: 'Syllabus Status', url: '/admin/lesson-plan/status' },
    ]
  },
  {
    title: 'Attendance',
    icon: IconCalendar,
    items: [
      { title: 'Student Attendance', url: '/admin/attendance/student' },
      { title: 'Approve Leave', url: '/admin/attendance/approve-leave' },
      { title: 'Attendance By Date', url: '/admin/attendance/by-date' },
    ]
  },
  { 
      title: 'Academics', 
      icon: IconBook, 
      items: [
          { title: 'Classes', url: '/admin/classes' },
          { title: 'Subjects', url: '/admin/subjects' },
        { title: 'Subject Groups', url: '/admin/subject-groups' },
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
    ]
  },
  {
    title: 'Transport',
    icon: IconBus,
    items: [
      { title: 'Pickup Points', url: '/admin/transport/pickup' },
      { title: 'Routes', url: '/admin/transport/routes' },
      { title: 'Vehicles', url: '/admin/transport/vehicles' },
      { title: 'Stops', url: '/admin/transport/stops' },
      { title: 'Assign Students', url: '/admin/transport/assignments' },
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
]

const adminFooterData = [
  { title: 'Reports', url: '/admin/reports', icon: IconFileText },
]



// Teacher limited navigation
const teacherNavData = [
  { title: 'Dashboard', url: '/teacher/dashboard', icon: IconSchool },
  {
    title: 'Student Information',
    icon: IconUsers,
    items: [
      { title: 'My Students', url: '/teacher/students' },
    ]
  },
  {
    title: 'Academics',
    icon: IconBook,
    items: [
      { title: 'Classes', url: '/teacher/classes' },
      { title: 'Subjects', url: '/teacher/subjects' },
      { title: 'Subject Groups', url: '/teacher/subject-groups' },
      { title: 'Class Schedule', url: '/teacher/class-schedule' },
      { title: 'Teacher Schedule', url: '/teacher/teacher-schedule' },
      { title: 'Promote Students', url: '/teacher/promote' },
    ]
  },
  {
    title: 'Attendance',
    icon: IconBook,
    items: [
      { title: 'Mark Attendance', url: '/teacher/attendance' },
    ]
  },
]


const parentNavData = [
  { title: 'Dashboard', url: '/parent/dashboard', icon: IconSchool },
  {
    title: 'Academics',
    icon: IconBook,
    items: [
      { title: 'Attendance', url: '/parent/attendance' },
      { title: 'Report Card', url: '/parent/report-card' },
      { title: 'Homework', url: '/parent/homework' },
    ]
  },
  {
    title: 'Fees',
    icon: IconCurrencyDollar,
    items: [
      { title: 'Fee Status', url: '/parent/fees' },
      { title: 'History', url: '/parent/fees/history' },
    ]
  },
]

const teacherFooterData = [
  { title: 'Settings', url: '/teacher/settings', icon: IconSettings },
]

export function AppSidebar({
  ...props
}) {
  const { currentUser } = useAuth();
  const isTeacher = currentUser?.userType === 'teacher';
  const isParent = currentUser?.userType === 'parent';

  // Select nav data based on role
  const navData = isTeacher ? teacherNavData : (isParent ? parentNavData : adminNavData);
  const footerData = isTeacher ? teacherFooterData : adminFooterData; // Parent can share footer for now

  // Prepare user data for NavUser component
  const userData = {
    name: currentUser?.name || (isTeacher ? "Teacher" : (isParent ? "Parent" : "Admin")),
    email: currentUser?.email || (isTeacher ? "teacher@school.com" : (isParent ? "parent@school.com" : "admin@school.com")),
    avatar: currentUser?.avatar || "/avatars/admin.png",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navData} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {footerData.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link to={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

