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
import CheckPaymentPage from './components/checkPayment/CheckPaymentPage.jsx'; // Import the new page
import PaymentDetailPage from './components/checkPayment/PaymentDetailPage.jsx';
import Header from './components/common/Header.jsx';
import ChangeUsernamePage from './pages/ChangeUsernamePage.jsx';
import AddReceiptNumberPage from './pages/AddReceiptNumberPage.jsx';
import RejectedReportsPage from './pages/RejectedReportPage.jsx';
const AppRouter = () => {
  return (
    <AuthProvider>
      <Router>
        <Header /> {/* Add the Header component */}
        <Routes>
          {/* Public Routes */}
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/change-username" element={<ChangeUsernamePage />} />

          {/* Protected Routes for different roles */}
          <Route element={<ProtectedRoute />}>
            <Route path="/rejectedReports" element={<RejectedReportsPage />} />
            <Route path="/reports" element={<ReportList />} />
            <Route path="/report/:id" element={<ReportDetailPage />} />
            <Route path="/createReport" element={<CreateReportPage />} />
            <Route path="/tests" element={<TestPage />} />
            <Route path="/addReceiptNumber" element={<AddReceiptNumberPage />} />
            <Route path="/checkPayment" element={<CheckPaymentPage />} /> {/* New route */}
            <Route path="/checkPayment/report/:id" element={<PaymentDetailPage />} /> {/* New route for PaymentDetailPage */}
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default AppRouter;
