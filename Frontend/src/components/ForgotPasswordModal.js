import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, X } from 'lucide-react';

function ForgotPasswordModal({ closeModal, token = null }) {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');
  const [mode] = useState(token ? 'reset' : 'request');

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle the email form submission (Request reset)
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users/request-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Password reset link sent to your email');
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to send reset link');
      }
    } catch (err) {
      setStatus('error');
      setMessage('An error occurred. Please try again.');
      console.error(err);
    }
  };

  // Handle the password reset form submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match');
      return;
    }
    
    setStatus('loading');
    
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users/reset-password/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Password has been reset successfully');
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setStatus('error');
      setMessage('An error occurred. Please try again.');
      console.error(err);
    }
  };

  return (
    <section className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay">
      <section className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative modal">
        {/* Close button */}
        <button 
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 close-btn"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>
        
        <header className="text-center mb-6">
          <figure className="mx-auto bg-blue-100 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
            {mode === 'request' ? (
              <Mail className="h-6 w-6 text-blue-600" />
            ) : (
              <Lock className="h-6 w-6 text-blue-600" />
            )}
          </figure>
          <h2 className="text-xl font-bold text-gray-800">
            {mode === 'request' ? 'Forgot Password' : 'Reset Your Password'}
          </h2>
          <p className="text-gray-600 mt-1">
            {mode === 'request' 
              ? 'Enter your email address and we\'ll send you a link to reset your password.' 
              : 'Enter your new password below'}
          </p>
        </header>
        
        {status === 'success' ? (
          <section className="text-center py-4">
            <section className="bg-green-50 text-green-800 p-4 rounded-lg mb-6">
              <p>{message}</p>
            </section>
            <button
              onClick={closeModal}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Close
            </button>
          </section>
        ) : (
          <form onSubmit={mode === 'request' ? handleEmailSubmit : handlePasswordSubmit}>
            {status === 'error' && (
              <section role="alert" className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">
                <p className="text-sm">{message}</p>
              </section>
            )}
            
            {mode === 'request' ? (
              <section className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <section className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 pr-3 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    placeholder="your@email.com"
                    disabled={status === 'loading'}
                  />
                </section>
              </section>
            ) : (
              <>
                {/* New Password Field */}
                <section className="mb-4">
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <section className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="pl-10 pr-10 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                      placeholder="Enter your new password"
                      minLength="8"
                      disabled={status === 'loading'}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </section>
                </section>

                {/* Confirm Password Field */}
                <section className="mb-4">
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <section className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pl-10 pr-3 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                      placeholder="Confirm your new password"
                      minLength="8"
                      disabled={status === 'loading'}
                    />
                  </section>
                </section>
              </>
            )}
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <section className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {mode === 'request' ? 'Sending...' : 'Resetting...'}
                </section>
              ) : (
                mode === 'request' ? 'Send Reset Link' : 'Reset Password'
              )}
            </button>
          </form>
        )}
      </section>
    </section>
  );
}

export default ForgotPasswordModal;
