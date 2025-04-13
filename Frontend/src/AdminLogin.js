import React, { useState } from 'react';
import { BookMarked, Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

// Update the successful login redirect

  
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed. Please check your credentials.');
    }

    const data = await response.json();
    
    // Store authentication data
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Redirect to admin dashboard
    if(data.user.role === 'admin') {
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
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      <header className="bg-gray-900 text-white py-4">
        <nav className="max-w-6xl mx-auto px-6">
          <a href="/" className="flex items-center">
            <BookMarked className="h-6 w-6 mr-2" />
            <h1 className="text-xl font-bold">Constitutional Archive</h1>
          </a>
        </nav>
      </header>
      
      <section className="flex-grow flex items-center justify-center px-6 py-12">
        <article className="bg-white rounded-xl shadow-lg max-w-md w-full p-8">
          <header className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Admin Login</h2>
            <p className="text-gray-600 mt-2">Enter your credentials to access the admin panel</p>
          </header>
          
          {error && (
            <section role="alert" className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">
              <p className="text-sm">{error}</p>
            </section>
          )}
          
          <form onSubmit={handleSubmit}>
            <fieldset className="space-y-6">
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
              
              <section>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <section className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 pr-10 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    placeholder="Enter your password"
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
                
                <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </a>
              </section>
              
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
                    Logging in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    Login
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </button>
            </fieldset>
          </form>
          
          <footer className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Don't have an admin account? <a href="/admin/signup" className="text-blue-600 hover:underline font-medium">Sign up</a>
            </p>
          </footer>
        </article>
      </section>
      
      <footer className="bg-gray-900 text-white py-4">
        <section className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-400">
          <p>&copy; 2025 Constitutional Archive. All rights reserved.</p>
        </section>
      </footer>
    </main>
  );
}