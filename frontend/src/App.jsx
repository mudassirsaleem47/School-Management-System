import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './Website/pages/Home';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import StudentList from './pages/StudentList';
import AdminRegisterPage from './pages/AdminRegisterPage';
import AdmissionEnquiry from './pages/AdmissionEnquiry';
import ShowClasses from './pages/ShowClasses';
import TeacherList from './pages/TeacherList';
import VisitorBook from './pages/VisitorBook';
import PhoneCallLog from './pages/PhoneCallLog';
import ComplainPage from './pages/ComplainPage';
import StudentAdmission from './pages/StudentAdmission';
import StudentDetailPage from './pages/StudentDetailPage';
import DisabledStudents from './pages/DisabledStudents';
import SettingsProfile from './pages/SettingsProfile';
import FeeReports from './pages/FeeReports';
import FeeAssignment from './pages/FeeAssignment';
import FeeReminder from './pages/FeeReminder';
import FeeManagement from './pages/FeeManagement';
import FeeCollection from './pages/FeeCollection';
import StudentFeeDetail from './pages/StudentFeeDetail';
import IncomeManagement from './pages/IncomeManagement';
import ExpenseManagement from './pages/ExpenseManagement';
import ExamGroup from './pages/ExamGroup';
import MarksGrade from './pages/MarksGrade';
import ExamSchedule from './pages/ExamSchedule';
import MarksDivision from './pages/MarksDivision';
import ExamResult from './pages/ExamResult';
import CampusManagement from './pages/CampusManagement';
import DesignationManagement from './pages/DesignationManagement';
import DisableReasonPage from './pages/DisableReasonPage';
import AccountantList from './pages/AccountantList';
import ReceptionistList from './pages/ReceptionistList';
import MediaManager from './pages/MediaManager';

import SendMessages from './pages/SendMessages';
import MessageTemplates from './pages/MessageTemplates';
import MessageReport from './pages/MessageReport';
import NotificationsPage from './pages/NotificationsPage';
import BirthdayWish from './pages/BirthdayWish';
import TransportPickupPage from './pages/Transport/TransportPickupPage';
import TransportRoutesPage from './pages/Transport/TransportRoutesPage';
import TransportVehiclesPage from './pages/Transport/TransportVehiclesPage';
import TransportStopsPage from './pages/Transport/TransportStopsPage';
import TransportStudentsPage from './pages/Transport/TransportStudentsPage';
import StudentAttendancePage from './pages/Attendance/StudentAttendancePage';
import ApproveLeavePage from './pages/Attendance/ApproveLeavePage';
import AttendanceByDatePage from './pages/Attendance/AttendanceByDatePage';
import LessonTopics from './pages/LessonPlan/LessonTopics';
import PlanManager from './pages/LessonPlan/PlanManager';
import SyllabusTracker from './pages/LessonPlan/SyllabusTracker';

import StudentIdCard from './pages/card-design/StudentIdCard';
import StaffIdCard from './pages/card-design/StaffIdCard';
import CardDesigner from './pages/card-design/CardDesigner';
import ReportCard from './pages/card-design/ReportCard';
import SubjectManagement from './pages/SubjectManagement';
import SubjectGroupPage from './pages/SubjectGroupPage';
import ClassSchedule from './pages/ClassSchedule';
import TeacherSchedule from './pages/TeacherSchedule';
import Promotion from './pages/Promotion';
import ReportsPage from './pages/ReportsPage';
import TeacherDashboard from './pages/TeacherDashboard';
import ParentDashboard from './pages/ParentDashboard';
import ParentAttendance from './pages/Parent/ParentAttendance';
import ParentFees from './pages/Parent/ParentFees';
import ParentHomework from './pages/Parent/ParentHomework';
import ParentReportCard from './pages/Parent/ParentReportCard';
import AccountantDashboard from './pages/Accountant/AccountantDashboard';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import DesignAdmitCard from './pages/examination/DesignAdmitCard';
import PrintAdmitCard from './pages/examination/PrintAdmitCard';
import DesignMarkSheet from './pages/examination/DesignMarkSheet';
import PrintMarkSheet from './pages/examination/PrintMarkSheet';



import { ToastProvider } from './context/ToastContext';
import { CampusProvider } from './context/CampusContext';
import { ThemeProvider } from "./components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

function App() {
  return (
    <div className="App">
      <ToastProvider>
        <CampusProvider>
          <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <Routes>
              {/* Public Website Route */}
              <Route path="/" element={<Home />} />

              {/* Admin Auth Routes */}
              <Route path="/login" element={<AdminLoginPage />} />
              <Route path="/AdminLogin" element={<Navigate to="/login" replace />} />
              <Route path="/register" element={<AdminRegisterPage />} />
              <Route path="/AdminRegister" element={<Navigate to="/register" replace />} />


              <Route element={<ProtectedRoute />}>
                <Route path="/admin" element={<AdminLayout />}> {/* <--- Layout Wrapper */}
                  <Route index element={<AdminDashboard />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="students" element={<StudentList />} />
                  <Route path="students/:studentId" element={<StudentDetailPage />} />
                  <Route path="enquiry" element={<AdmissionEnquiry />} />
                  <Route path="classes" element={<ShowClasses />} />
                  <Route path="subjects" element={<SubjectManagement />} />
                  <Route path="subject-groups" element={<SubjectGroupPage />} />
                  <Route path="class-schedule" element={<ClassSchedule />} />
                  <Route path="teacher-schedule" element={<TeacherSchedule />} />
                  <Route path="promote" element={<Promotion />} />
                  <Route path="teachers" element={<TeacherList />} />
                  <Route path="visitor-book" element={<VisitorBook />} />
                  <Route path="phone-calls" element={<PhoneCallLog />} />
                  <Route path="complain" element={<ComplainPage />} />
                  <Route path="admission" element={<StudentAdmission />} />
                  <Route path="students/disabled" element={<DisabledStudents />} />
                  <Route path="students/disable-reasons" element={<DisableReasonPage />} />
                  <Route path="settings" element={<SettingsProfile />} />

                  
                  <Route path="fee-management" element={<FeeManagement />} />
                  <Route path="fee-assignment" element={<FeeAssignment />} />
                  <Route path="fee-collection" element={<FeeCollection />} />
                  <Route path="fee-collection/:studentId" element={<StudentFeeDetail />} />
                  <Route path="fee-reports" element={<FeeReports />} />
                  <Route path="fee-reminder" element={<FeeReminder />} />
                  <Route path="income" element={<IncomeManagement />} />
                  <Route path="expense" element={<ExpenseManagement />} />
                  <Route path="exam-groups" element={<ExamGroup />} />
                  <Route path="marks-grade" element={<MarksGrade />} />
                  <Route path="exam-schedule" element={<ExamSchedule />} />
                  <Route path="marks-division" element={<MarksDivision />} />
                  <Route path="exam-result" element={<ExamResult />} />
                  <Route path="design-admit-card" element={<DesignAdmitCard />} />
                  <Route path="print-admit-card" element={<PrintAdmitCard />} />
                  <Route path="design-mark-sheet" element={<DesignMarkSheet />} />
                  <Route path="print-mark-sheet" element={<PrintMarkSheet />} />
                  <Route path="campuses" element={<CampusManagement />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="accountants" element={<AccountantList />} />
                  <Route path="receptionists" element={<ReceptionistList />} />
                  <Route path="media" element={<MediaManager />} />
                  {/* <Route path="designations" element={<DesignationManagement />} /> */}
                  <Route path="send-messages" element={<SendMessages />} />
                  <Route path="message-templates" element={<MessageTemplates />} />
                  <Route path="transport/pickup" element={<TransportPickupPage />} />
                  <Route path="transport/routes" element={<TransportRoutesPage />} />
                  <Route path="transport/vehicles" element={<TransportVehiclesPage />} />
                  <Route path="transport/stops" element={<TransportStopsPage />} />
                  <Route path="transport/assignments" element={<TransportStudentsPage />} />
                  <Route path="attendance/student" element={<StudentAttendancePage />} />
                  <Route path="attendance/approve-leave" element={<ApproveLeavePage />} />
                  <Route path="attendance/by-date" element={<AttendanceByDatePage />} />

                  <Route path="lesson-plan/topics" element={<LessonTopics />} />
                  <Route path="lesson-plan/manage" element={<PlanManager />} />
                  <Route path="lesson-plan/status" element={<SyllabusTracker />} />

                  <Route path="birthday-wishes" element={<BirthdayWish />} />


                  {/* Card Management Routes */}
                  <Route path="card-management" element={<Navigate to="card-management/student" />} />
                  <Route path="card-management/student" element={<StudentIdCard />} />
                  <Route path="card-management/staff" element={<StaffIdCard />} />
                  <Route path="card-management/designer" element={<CardDesigner />} />
                  <Route path="/admin/report-card" element={<ReportCard />} />
                  <Route path="message-report" element={<MessageReport />} />
                  <Route path="notifications" element={<NotificationsPage />} />

                  {/* Exam Management */}
                </Route>

                {/* Teacher Protected Routes - reuses AdminLayout */}
                <Route path="/teacher" element={<AdminLayout />}>
                  <Route index element={<TeacherDashboard />} />
                  <Route path="dashboard" element={<TeacherDashboard />} />
                  <Route path="students" element={<StudentList />} />
                  <Route path="classes" element={<ShowClasses />} />
                  <Route path="subjects" element={<SubjectManagement />} />
                  <Route path="subject-groups" element={<SubjectGroupPage />} />
                  <Route path="class-schedule" element={<ClassSchedule />} />
                  <Route path="teacher-schedule" element={<TeacherSchedule />} />
                  <Route path="promote" element={<Promotion />} />
                  <Route path="attendance" element={<StudentAttendancePage />} />
                  <Route path="settings" element={<SettingsProfile />} />
                </Route>


                {/* Parent Protected Routes - reuses AdminLayout */}
                <Route path="/parent" element={<AdminLayout />}>
                  <Route index element={<ParentDashboard />} />
                  <Route path="dashboard" element={<ParentDashboard />} />
                  <Route path="attendance" element={<ParentAttendance />} />
                  <Route path="report-card" element={<ParentReportCard />} />
                  <Route path="homework" element={<ParentHomework />} />
                  <Route path="fees" element={<ParentFees />} />
                  <Route path="fees/history" element={<ParentFees />} />
                  <Route path="settings" element={<SettingsProfile />} />
                </Route>

                {/* Accountant Protected Routes */}
                <Route path="/accountant" element={<AdminLayout />}>
                  <Route index element={<AccountantDashboard />} />
                  <Route path="dashboard" element={<AccountantDashboard />} />
                  <Route path="fee-collection" element={<FeeCollection />} />
                  <Route path="fee-collection/:studentId" element={<StudentFeeDetail />} />
                  <Route path="fee-reports" element={<FeeReports />} />
                  <Route path="income" element={<IncomeManagement />} />
                  <Route path="expense" element={<ExpenseManagement />} />
                  <Route path="settings" element={<SettingsProfile />} />
                </Route>

                {/* Receptionist Protected Routes */}
                <Route path="/receptionist" element={<AdminLayout />}>
                  <Route index element={<ReceptionistDashboard />} />
                  <Route path="dashboard" element={<ReceptionistDashboard />} />
                  <Route path="visitor-book" element={<VisitorBook />} />
                  <Route path="admission-enquiry" element={<AdmissionEnquiry />} />
                  <Route path="call-logs" element={<PhoneCallLog />} />
                  <Route path="complaints" element={<ComplainPage />} />
                  <Route path="settings" element={<SettingsProfile />} />
                </Route>

              </Route>
            </Routes>
            <Toaster />
          </ThemeProvider>
        </CampusProvider>
      </ToastProvider>
    </div>
  );
}

export default App;