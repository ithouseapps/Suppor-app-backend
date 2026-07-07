import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth';
import Login from './pages/Login';
import AdminLayout from './pages/admin/Layout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminSupports from './pages/admin/Supports';
import AdminSupportProfile from './pages/admin/SupportProfile';
import AdminProfile from './pages/admin/Profile';
import AdminAdmins from './pages/admin/Admins';
import AdminRooms from './pages/admin/Rooms';
import AdminSubjects from './pages/admin/Subjects';
import TelegramSettings from './pages/admin/TelegramSettings';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) {
    return <Navigate to={`/${user.role}`} />;
  }
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
        <Route path="supports/:id/profile" element={<AdminSupportProfile />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="admins" element={<AdminAdmins />} />
        <Route path="rooms" element={<AdminRooms />} />
        <Route path="subjects" element={<AdminSubjects />} />
        <Route path="telegram" element={<TelegramSettings />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
