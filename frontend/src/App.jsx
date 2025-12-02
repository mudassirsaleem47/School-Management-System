import { Routes, Route } from 'react-router-dom';
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


import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <div className="App">
      <ToastProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<AdminLoginPage />} /> {/* Default route Admin Login */}
          <Route path="/AdminLogin" element={<AdminLoginPage />} />
          <Route path="/AdminRegister" element={<AdminRegisterPage />} />
          
          {/* Protected Routes (Saare admin pages iske andar aayenge) */}
          <Route element={<ProtectedRoute />}>
             <Route path="/admin" element={<AdminLayout />}> {/* <--- Layout Wrapper */}
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} /> 
                <Route path="students" element={<StudentList />}/>
                <Route path="enquiry" element={<AdmissionEnquiry />}/>
                <Route path="classes" element={<ShowClasses />} />
                <Route path="teachers" element={<TeacherList />} />
                <Route path="visitor-book" element={<VisitorBook />} />
                <Route path="phone-calls" element={<PhoneCallLog />} />
                <Route path="complain" element={<ComplainPage />} />
             </Route>
          </Route>
        </Routes>
      </ToastProvider>
    </div>
  );
}

export default App;