import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/authContext.jsx';
import CreateReportPage from './pages/CreatReport.jsx';
import LoginPage from './pages/LoginPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ProtectedRoute from './pages/ProtectedRoute.jsx';
const AppRouter = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Protected Routes for different roles */}
          <Route element={<ProtectedRoute requiredRoles={['staff']} />}>
            <Route path="/createReport" element={<CreateReportPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default AppRouter;
