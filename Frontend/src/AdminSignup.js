//AdminSignup.js
// Importing required dependencies and components
import React, { useState } from 'react';
import { BookMarked, User, Mail, Lock, Eye, EyeOff, ChevronLeft, Shield } from 'lucide-react'; // Icons for UI components
import { Link, useNavigate } from 'react-router-dom'; // Navigation and routing components
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

// AdminSignup Component: Handles admin registration logic and UI
export default function AdminSignup() {
  // State for managing form input values
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    accessCode: ''
  });

  // States for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State for loading indicator during API request
  const [isLoading, setIsLoading] = useState(false);

  // State for storing form validation errors
  const [errors, setErrors] = useState({});

  // State for tracking if terms and conditions checkbox is checked
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Hook for navigating programmatically after successful signup
  const navigate = useNavigate();

  // Function to update form data as the user types
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for the current field if user starts typing again
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Function to validate all form fields before submission
  const validateForm = () => {
    const newErrors = {};
    
    // Check if first name is empty
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    
    // Check if last name is empty
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    // Validate email format
    if (!formData.email.match(/\S+@\S+\.\S+/)) newErrors.email = 'Invalid email address';
    
    // Enhanced password validation
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!formData.password.match(/[A-Z]/)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!formData.password.match(/[a-z]/)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!formData.password.match(/[0-9]/)) {
      newErrors.password = 'Password must contain at least one number';
    } else if (!formData.password.match(/[^A-Za-z0-9]/)) {
      newErrors.password = 'Password must contain at least one special character';
    }
    
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Check if access code is empty
    if (!formData.accessCode.trim()) newErrors.accessCode = 'Access code is required';
    
    // Ensure terms and conditions are accepted
    if (!termsAccepted) newErrors.terms = 'You must accept the terms';
    
    return newErrors;
  };

  // Function to handle form submission logic
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    const formErrors = validateForm(); // Run validation
    if (Object.keys(formErrors).length > 0) return setErrors(formErrors); // If errors, update state and stop

    setIsLoading(true); // Start loading spinner
    setErrors({}); // Clear previous errors

    try {
      // Send POST request to the backend signup endpoint
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          accessCode: formData.accessCode
        }),
      });

      const data = await response.json(); // Parse JSON response

      // Check if response is successful, otherwise throw an error
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed. Please try again.');
      }

      // Store authentication data locally (e.g. for session handling)
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Navigate to admin dashboard after successful signup
      navigate('/admin');
      
    } catch (error) {
      // Catch any errors and display as general error
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false); // Stop loading spinner
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Header with app logo and navigation */}
      <header className="bg-gray-900 text-white py-4">
        <nav className="max-w-6xl mx-auto px-6">
          <Link to="/" className="flex items-center">
            <BookMarked className="h-6 w-6 mr-2" />
            <h1 className="text-xl font-bold">Constitutional Archive</h1>
          </Link>
        </nav>
      </header>
      
      {/* Main content area with registration form */}
      <section className="flex-grow flex items-center justify-center px-6 py-12">
        <article className="bg-white rounded-xl shadow-lg max-w-lg w-full p-8">
          <header className="mb-8">
            {/* Back to login link */}
            <Link to="/admin/login" className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 mb-4">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to login
            </Link>

            {/* Form heading and description */}
            <section className="flex items-center mb-4">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-800">Admin Registration</h2>
            </section>
            <p className="text-gray-600 text-sm">
              Create an administrator account to manage constitutional documents and users.
              An access code is required for registration.
            </p>
          </header>
          
          {/* Registration Form Starts */}
          <form onSubmit={handleSubmit}>
            <fieldset className="space-y-6">
              {/* General error alert box */}
              {errors.general && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                  {errors.general}
                </div>
              )}

              {/* First and Last Name Inputs */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <section>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <section className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="pl-10 pr-3 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                      placeholder="John"
                    />
                  </section>
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </section>
                
                {/* Last Name */}
                <section>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <section className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="pl-10 pr-3 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                      placeholder="Doe"
                    />
                  </section>
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </section>
              </section>
              
              {/* Email Field */}
              <section>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <section className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 pr-3 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    placeholder="admin@example.com"
                  />
                </section>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </section>
              
              {/* Password Field with toggle visibility */}
              <section>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <section className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-10 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    placeholder="Create a secure password"
                  />
                  {/* Toggle visibility */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </section>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 8 characters long
                </p>
              </section>
              
              {/* Confirm Password */}
              <section>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <section className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10 pr-10 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </section>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </section>
              
              {/* Admin Access Code */}
              <section>
                <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Administrator Access Code
                </label>
                <section className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="accessCode"
                    name="accessCode"
                    type="text"
                    value={formData.accessCode}
                    onChange={handleChange}
                    className="pl-10 pr-3 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    placeholder="Enter admin access code"
                  />
                </section>
                {errors.accessCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.accessCode}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Please contact the system administrator if you don't have an access code
                </p>
              </section>
              
              {/* Terms and Conditions Checkbox */}
              <section>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="h-4 w-4 mt-1 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    I agree to the <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link> and {' '}
                    <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
                  </span>
                </label>
                {errors.terms && (
                  <p className="mt-1 text-sm text-red-600">{errors.terms}</p>
                )}
              </section>
              <section className="space-y-4">
                {/*  */}
  <figure className="relative">
    <figcaption className="absolute inset-0 flex items-center">
      <hr className="w-full border-t border-gray-300" />
    </figcaption>
    <figcaption className="relative flex justify-center text-sm">
      <mark className="px-2 bg-white text-gray-500">Or continue with</mark>
    </figcaption>
  </figure>


  <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
    <GoogleLogin
      onSuccess={async (credentialResponse) => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
          setErrors({ general: error.message });
        }
      }}
      onError={() => {
        setErrors({ general: 'Google authentication failed' });
      }}
      theme="filled_blue"
      shape="rectangular"
      size="large"
      text="signup_with"
      width="100%"
    />
  </GoogleOAuthProvider>
</section>
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  "Create Admin Account"
                )}
              </button>
            </fieldset>
          </form>
        </article>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-4">
        <section className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-400">
          <p>&copy; 2025 Constitutional Archive. All rights reserved.</p>
        </section>
      </footer>
    </main>
  );
}
