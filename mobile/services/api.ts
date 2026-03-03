import axios from 'axios';

// Replace with your local IP if running on a real device
// For Android Emulator, 10.0.2.2 usually maps to localhost
const API_URL = 'http://10.0.2.2:3000'; 

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};
