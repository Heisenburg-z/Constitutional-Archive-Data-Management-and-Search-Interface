// src/services/uploadService.js
import axios from 'axios';



export const uploadDocument = async (formData) => {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await axios.post(`/api/archives/upload`, formData, {
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
    console.log('✅ Axios upload response:', response);
    return response.data;
  } catch (error) {
    console.error('❌ Axios upload error:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.error || 'Upload failed';
    throw new Error(errorMessage);
  }
};

export const fetchDirectories = async () => {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await axios.get(`/api/archives/directories`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch directories');
  }
};