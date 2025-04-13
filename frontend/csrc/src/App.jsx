import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/authContext.jsx';
import CreateReportPage from './pages/CreatReport.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ProtectedRoute from './pages/ProtectedRoute.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
const AppRouter = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Protected Routes for different roles */}
          <Route element={<ProtectedRoute requiredRoles={['staff']} />}>
            <Route path="/createReport" element={<CreateReportPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default AppRouter;
