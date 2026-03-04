import axios from 'axios';
import { Platform } from 'react-native';

// Adjust API URL based on platform
let API_URL = 'http://10.0.2.2:3000'; // Android Emulator default

if (Platform.OS === 'web') {
  // On Netlify, we use the proxy configured in netlify.toml
  // /api/* -> /.netlify/functions/api/*
  API_URL = '/api';
} else if (Platform.OS === 'ios') {
  API_URL = 'http://localhost:3000'; // iOS Simulator
}

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
