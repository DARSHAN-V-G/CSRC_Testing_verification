import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/authContext.jsx';
import CreateReportPage from './pages/CreatReport.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ProtectedRoute from './pages/ProtectedRoute.jsx';
import ReportList from './components/fetchReport/ReportList.jsx';
import ReportDetailPage from './components/fetchReport/ReportDetailPage.jsx';
import TestPage from './pages/TestPage.jsx';
const AppRouter = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Protected Routes for different roles */}
          <Route element={<ProtectedRoute />}>
            <Route path="/reports" element={<ReportList />} />
            <Route path="/report/:id" element={<ReportDetailPage />} />
            <Route path="/createReport" element={<CreateReportPage />} />
            <Route path="/tests" element={<TestPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default AppRouter;
