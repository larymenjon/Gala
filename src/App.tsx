import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import PublicRsvpPage from './pages/PublicRsvpPage';
import ImportPage from './pages/ImportPage';
import ReportsPage from './pages/ReportsPage';
import AccountPage from './pages/AccountPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/r/:slug" element={<PublicRsvpPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin" element={<Navigate to="/admin/inicio" replace />} />
        <Route path="/admin/inicio" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/admin/listas" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
        <Route path="/admin/importar" element={<ProtectedRoute><ImportPage /></ProtectedRoute>} />
        <Route path="/admin/relatorios" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
        <Route path="/admin/conta" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
        <Route path="/admin/configuracoes" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/admin/eventos/:id" element={<ProtectedRoute><EventDetailPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
