import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LandingPage         from './pages/LandingPage';
import LoginPage           from './pages/auth/LoginPage';
import RegisterPage        from './pages/auth/RegisterPage';
import AdminDashboard      from './pages/admin/AdminDashboard';
import ClientDashboard     from './pages/client/ClientDashboard';
import BookingPage         from './pages/client/BookingPage';
import ProfessionalPage    from './pages/professional/ProfessionalPage';
import ManageEstablishment from './pages/professional/ManageEstablishment';
import ManageProfessionals from './pages/professional/ManageProfessionals';
import ManageServices      from './pages/professional/ManageServices';

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--gray-400)', fontSize:14 }}>Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/landing" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'owner') return <Navigate to="/professional" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/"         element={<HomeRedirect />} />
      <Route path="/landing"  element={<LandingPage />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
      <Route path="/dashboard" element={<PrivateRoute roles={['client']}><ClientDashboard /></PrivateRoute>} />
      <Route path="/booking" element={<PrivateRoute roles={['client']}><BookingPage /></PrivateRoute>} />
      <Route path="/professional" element={<PrivateRoute roles={['owner']}><ProfessionalPage /></PrivateRoute>} />
      <Route path="/professional/establishment" element={<PrivateRoute roles={['owner']}><ManageEstablishment /></PrivateRoute>} />
      <Route path="/professional/team" element={<PrivateRoute roles={['owner']}><ManageProfessionals /></PrivateRoute>} />
      <Route path="/professional/services" element={<PrivateRoute roles={['owner']}><ManageServices /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}