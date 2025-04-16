import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function CompleteSignup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    accessCode: ''
  });
  const [errors, setErrors] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/google/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${location.state.token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      localStorage.setItem('authToken', data.token);
      navigate('/admin');
    } catch (error) {
      setErrors({ general: error.message });
    }
  };

  return (
    // This is the main container for the complete signup form
    <main className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow">
      <header>
        <h2 className="text-2xl font-bold mb-4">Complete Registration</h2>
      </header>
      
      {errors.general && <p role="alert" className="text-red-500 mb-4">{errors.general}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <fieldset>
          <label htmlFor="firstName" className="block mb-1">First Name</label>
          <input
            id="firstName"
            type="text"
            required
            className="w-full p-2 border rounded"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
        </fieldset>
        
        <fieldset>
          <label htmlFor="lastName" className="block mb-1">Last Name</label>
          <input
            id="lastName"
            type="text"
            required
            className="w-full p-2 border rounded"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
        </fieldset>
        
        <fieldset>
          <label htmlFor="accessCode" className="block mb-1">Access Code</label>
          <input
            id="accessCode"
            type="text"
            required
            className="w-full p-2 border rounded"
            value={formData.accessCode}
            onChange={(e) => setFormData({ ...formData, accessCode: e.target.value })}
          />
        </fieldset>
        
        <footer>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Complete Registration
          </button>
        </footer>
      </form>
    </main>
  );
}