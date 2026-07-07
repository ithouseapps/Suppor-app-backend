import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth';
import Login from './pages/Login';
import AdminLayout from './pages/admin/Layout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminSupports from './pages/admin/Supports';
import AdminSupportProfile from './pages/admin/SupportProfile';
import AdminRooms from './pages/admin/Rooms';
import AdminSubjects from './pages/admin/Subjects';
import SupportLayout from './pages/support/Layout';
import SupportDashboard from './pages/support/Dashboard';
import SupportHistory from './pages/support/History';
import SupportProfile from './pages/support/Profile';
import StudentLayout from './pages/student/Layout';
import StudentBooking from './pages/student/Booking';
import StudentHistory from './pages/student/History';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to={`/${user.role}`} />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={`/${user.role}`} /> : <Login />} />
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="supports" element={<AdminSupports />} />
        <Route path="supports/:id" element={<AdminSupportProfile />} />
        <Route path="rooms" element={<AdminRooms />} />
        <Route path="subjects" element={<AdminSubjects />} />
      </Route>
      <Route path="/support" element={<ProtectedRoute role="support"><SupportLayout /></ProtectedRoute>}>
        <Route index element={<SupportDashboard />} />
        <Route path="history" element={<SupportHistory />} />
        <Route path="profile" element={<SupportProfile />} />
      </Route>
      <Route path="/student" element={<ProtectedRoute role="student"><StudentLayout /></ProtectedRoute>}>
        <Route index element={<StudentBooking />} />
        <Route path="history" element={<StudentHistory />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? `/${user.role}` : '/login'} />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
