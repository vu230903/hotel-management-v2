import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Upload single image
export const uploadImage = async (file, token) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await axios.post(`${API_BASE_URL}/upload/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`
    }
  });

  return response.data;
};

// Upload multiple images
export const uploadImages = async (files, token) => {
  console.log('🚀 uploadImages called with:', { filesCount: files.length, hasToken: !!token });
  console.log('🌐 API_BASE_URL:', API_BASE_URL);
  
  const formData = new FormData();
  files.forEach(file => {
    console.log('📁 Adding file:', file.name, file.size);
    formData.append('images', file);
  });

  console.log('📤 Sending request to:', `${API_BASE_URL}/upload/images-base64-mongo`);
  
  try {
    const response = await axios.post(`${API_BASE_URL}/upload/images-base64-mongo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
      timeout: 10000, // 10 second timeout for testing
    });
    console.log('📥 Response received:', response.data);
    return response.data.data.map(img => img.url);
  } catch (error) {
    console.error('❌ Upload API error:', error.response?.data || error.message);
    throw error;
  }
};

export default {
  uploadImage,
  uploadImages
};
