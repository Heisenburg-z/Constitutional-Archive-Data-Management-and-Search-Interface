import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ConstitutionalArchiveHomepage from './components/HomePage';
import AdminDashboard from './AdminDashboard';
import AdminLogin from './AdminLogin';
import AdminSignup from './AdminSignup';
import CompleteSignup from './CompleteSignup'; 

import ResetPasswordPage from "./ResetPassword"; 
import ForgotPassword from "./ForgotPassword"; 




const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('authToken');
  return isAuthenticated ? children : <Navigate to="/admin/login" />;
};

function App() {
  return (
    <Router>
      <>
        <Routes>
          <Route path="/" element={<ConstitutionalArchiveHomepage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/signup" element={<AdminSignup />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
         <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/complete-signup" element={<CompleteSignup />} />
          <Route 
            path="/admin/*" 
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            } 
          />
        </Routes>

        {/* 👇 Toast container goes here */}
        <ToastContainer position="top-right" autoClose={3000} />
      </>
    </Router>
  );
}

export default App;
