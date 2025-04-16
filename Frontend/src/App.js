import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ConstitutionalArchiveHomepage from './ConstitutionalArchiveHomepage';
import AdminDashboard from './AdminDashboard';
import AdminLogin from './AdminLogin';
import AdminSignup from './AdminSignup';
import CompleteSignup from './CompleteSignup'; 

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('authToken');
  return isAuthenticated ? children : <Navigate to="/admin/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ConstitutionalArchiveHomepage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/signup" element={<AdminSignup />} />
        {/* Add this new route for Google signup completion */}
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
    </Router>
  );
}

export default App;