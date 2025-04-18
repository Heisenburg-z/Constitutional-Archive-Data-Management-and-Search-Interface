// src/services/uploadService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

export const uploadDocument = async (formData) => {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await axios.post(`${API_URL}/api/archives/upload`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        // You can track upload progress here if needed
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload progress: ${percentCompleted}%`);
      }
    });
    
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Upload failed';
    throw new Error(errorMessage);
  }
};

export const fetchDirectories = async () => {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await axios.get(`${API_URL}/api/archives/directories`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch directories');
  }
};