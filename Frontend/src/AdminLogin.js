// Import required dependencies and components
import React, { useState, useEffect } from 'react';
import { BookMarked, Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react'; // Icons
import { useNavigate, useParams } from 'react-router-dom'; // Added useParams
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import ForgotPasswordModal from './components/ForgotPasswordModal';

// AdminLogin Component: Handles administrator authentication logic and UI
export default function AdminLogin() {
  // Get token from URL params if it exists
  const { token } = useParams();

  // State for managing form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State to show/hide password input
  const [showPassword, setShowPassword] = useState(false);

  // Tracks if "Remember Me" checkbox is selected
  const [rememberMe, setRememberMe] = useState(false);

  // Indicates form submission state
  const [isLoading, setIsLoading] = useState(false);

  // Stores login error messages
  const [error, setError] = useState('');

  // Hook to programmatically navigate to another route
  const navigate = useNavigate();

  // State to show the Forgot Password Modal
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  // Check if URL has token parameter and show reset modal accordingly
  useEffect(() => {
    if (token) {
      setShowForgotPasswordModal(true);
    }
  }, [token]);

  // Handles form submission for login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      // First check if response is OK
      if (!response.ok) {
        let errorMessage = 'Login failed. Please check your credentials.';
        
        // Try to read response as text first
        const textResponse = await response.text();
        console.log('Raw response:', textResponse);
        
        // Only try to parse as JSON if it looks like JSON
        if (textResponse.trim().startsWith('{') || textResponse.trim().startsWith('[')) {
          try {
            const errorData = JSON.parse(textResponse);
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            // If parsing fails, use the text response
            errorMessage = textResponse || errorMessage;
          }
        } else {
          // If not JSON-like, use text directly
          errorMessage = textResponse || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      // For successful responses, safely parse JSON
      const responseText = await response.text();
      const data = responseText ? JSON.parse(responseText) : {};
      
      // Store token and user info
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect based on role
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        throw new Error('You do not have admin privileges');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle visibility of password field
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Open Forgot Password Modal
  const openForgotPasswordModal = () => {
    setShowForgotPasswordModal(true);
  };

  // Close Forgot Password Modal
  const closeForgotPasswordModal = () => {
    setShowForgotPasswordModal(false);
    // If we're on the reset password route, navigate back to login
    if (token) {
      navigate('/admin/login');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Header with logo */}
      <header className="bg-gray-900 text-white py-4">
        <nav className="max-w-6xl mx-auto px-6">
          <a href="/" className="flex items-center">
            <BookMarked className="h-6 w-6 mr-2" />
            <h1 className="text-xl font-bold">Constitutional Archive</h1>
          </a>
        </nav>
      </header>

      {/* Main login form section */}
      <section className="flex-grow flex items-center justify-center px-6 py-12">
        <article className="bg-white rounded-xl shadow-lg max-w-md w-full p-8">
          <header className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Admin Login</h2>
            <p className="text-gray-600 mt-2">Enter your credentials to access the admin panel</p>
          </header>

          {/* Error message if login fails */}
          {error && (
            <section role="alert" className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">
              <p className="text-sm">{error}</p>
            </section>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit}>
            <fieldset className="space-y-6">

              {/* Email Field */}
              <section>
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
                    placeholder="admin@example.com"
                  />
                </section>
              </section>

              {/* Password Field */}
              <section>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <section className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"} // Show password if state is true
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 pr-10 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    placeholder="Enter your password"
                  />
                  {/* Toggle password visibility */}
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

              {/* Remember Me and Forgot Password Links */}
              <section className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>

                {/* Link to password recovery */}
                <button
                  type="button"
                  onClick={openForgotPasswordModal}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot password?
                </button>
              </section>
              <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
  <GoogleLogin
    onSuccess={async (credentialResponse) => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ credential: credentialResponse.credential }),
        });
        const data = await response.json();
        
        if (data.requiresAdditionalInfo) {
          navigate('/complete-signup', { state: { token: data.tempToken } });
        } else {
          localStorage.setItem('authToken', data.token);
          navigate('/admin');
        }
      } catch (error) {
        setError(error.message);
      }
    }}
    onError={() => {
      setError('Google login failed');
    }}
    useOneTap
  />
</GoogleOAuthProvider>
              {showForgotPasswordModal && (
                <ForgotPasswordModal 
                  closeModal={closeForgotPasswordModal} 

                />
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading} // Disable button when loading
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  // Spinner animation while loading
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  // Normal button text
                  <span className="flex items-center justify-center">
                    Login
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </button>
            </fieldset>
          </form>

          {/* Footer prompt to register if not yet signed up */}
          <footer className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Don't have an admin account?{' '}
              <a href="/admin/signup" className="text-blue-600 hover:underline font-medium">
                Sign up
              </a>
            </p>
          </footer>
        </article>
      </section>

      {/* Site footer */}
      <footer className="bg-gray-900 text-white py-4">
        <section className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-400">
          <p>&copy; 2025 Constitutional Archive. All rights reserved.</p>
        </section>
      </footer>
    </main>
  );
}