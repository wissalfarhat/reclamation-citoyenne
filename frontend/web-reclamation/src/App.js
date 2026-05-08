import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import Layout from './components/common/Layout';
import './styles/global.css';

// Pages
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import DashboardPage from './pages/admin/DashboardPage';
import ReclamationsPage from './pages/admin/ReclamationsPage';
import ReclamationDetailPage from './pages/admin/ReclamationDetailPage';
import UsersPage from './pages/admin/UsersPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import StatisticsPage from './pages/admin/StatisticsPage';
import MapPage from './pages/common/MapPage';
import ProfilePage from './pages/common/ProfilePage';
import AgentDashboardPage from './pages/agent/AgentDashboardPage';
import AssignedReclamationsPage from './pages/agent/AssignedReclamationsPage';

//  Defined BEFORE App
const HomeRedirect = () => {
  const { user } = useAuth();
  if (user?.typeUtilisateur === 'Administrateur') return <Navigate to="/dashboard" replace />;
  if (user?.typeUtilisateur === 'AgentMunicipal') return <Navigate to="/agent/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};
function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Routes protégées avec Layout */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<HomeRedirect />} /> {/*  Changed */}
              <Route path="/dashboard" element={<DashboardPage />} /> {/*  Added */}
              <Route path="/reclamations" element={<ReclamationsPage />} />
              <Route path="/reclamations/:id" element={<ReclamationDetailPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* Routes Admin */}
          <Route element={<PrivateRoute allowedRoles={['Administrateur']} />}>
            <Route element={<Layout />}>
              <Route path="/utilisateurs" element={<UsersPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/statistiques" element={<StatisticsPage />} />
            </Route>
          </Route>

          {/* Routes Agent */}
          <Route element={<PrivateRoute allowedRoles={['AgentMunicipal']} />}>
            <Route element={<Layout />}>
              <Route path="/agent/dashboard" element={<AgentDashboardPage />} />
              <Route path="/agent/reclamations" element={<AssignedReclamationsPage />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;