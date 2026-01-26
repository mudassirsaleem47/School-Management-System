import { Routes, Route } from 'react-router-dom';
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
import DisabledStudents from './pages/DisabledStudents';
import SettingsProfile from './pages/SettingsProfile';
import FeeManagement from './pages/FeeManagement';
import FeeCollection from './pages/FeeCollection';
import FeeReports from './pages/FeeReports';
import FeeAssignment from './pages/FeeAssignment';
import IncomeManagement from './pages/IncomeManagement';
import ExpenseManagement from './pages/ExpenseManagement';
import ExamGroup from './pages/ExamGroup';
import MarksGrade from './pages/MarksGrade';
import ExamSchedule from './pages/ExamSchedule';
import MarksDivision from './pages/MarksDivision';
import ExamResult from './pages/ExamResult';
import CampusManagement from './pages/CampusManagement';
import StaffManagement from './pages/StaffManagement';
import DesignationManagement from './pages/DesignationManagement';
import DisableReasonPage from './pages/DisableReasonPage';
import TeacherLoginPage from './pages/TeacherLoginPage';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherLayout from './components/TeacherLayout';
import AttendancePage from './pages/teacher/AttendancePage';
import TeacherStudentsPage from './pages/teacher/TeacherStudentsPage';
import SchedulePage from './pages/teacher/SchedulePage';
import TeacherResultsPage from './pages/teacher/TeacherResultsPage';




import { ToastProvider } from './context/ToastContext';
import { CampusProvider } from './context/CampusContext';

function App() {
  return (
    <div className="App">
      <ToastProvider>
        <CampusProvider>
          <Routes>
            {/* Public Website Route */}
            <Route path="/" element={<Home />} />

            {/* Admin Auth Routes */}
          <Route path="/AdminLogin" element={<AdminLoginPage />} />
            <Route path="/AdminRegister" element={<AdminRegisterPage />} />

            {/* Teacher Auth Routes */}
            <Route path="/teacher/login" element={<TeacherLoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}> {/* <--- Layout Wrapper */}
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<StudentList />} />
              <Route path="enquiry" element={<AdmissionEnquiry />} />
              <Route path="classes" element={<ShowClasses />} />
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
              <Route path="fee-reports" element={<FeeReports />} />
              <Route path="income" element={<IncomeManagement />} />
              <Route path="expense" element={<ExpenseManagement />} />
              <Route path="exam-groups" element={<ExamGroup />} />
              <Route path="marks-grade" element={<MarksGrade />} />
              <Route path="exam-schedule" element={<ExamSchedule />} />
              <Route path="marks-division" element={<MarksDivision />} />
              <Route path="exam-result" element={<ExamResult />} />
                <Route path="campuses" element={<CampusManagement />} />
                <Route path="staff" element={<StaffManagement />} />
                <Route path="designations" element={<DesignationManagement />} />
            </Route>

              {/* Teacher Protected Routes */}
              <Route path="/teacher" element={<TeacherLayout />}>
                <Route path="dashboard" element={<TeacherDashboard />} />
                <Route path="attendance" element={<AttendancePage />} />
                <Route path="students" element={<TeacherStudentsPage />} />
                <Route path="results" element={<TeacherResultsPage />} />
                <Route path="schedule" element={<SchedulePage />} />
                <Route path="settings" element={<SettingsProfile />} />
              </Route>
          </Route>
        </Routes>
        </CampusProvider>
      </ToastProvider>
    </div>
  );
}

export default App;