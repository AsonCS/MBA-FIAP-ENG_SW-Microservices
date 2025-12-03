import axios, { AxiosResponse } from 'axios';

const BACKEND_URL = 'http://localhost' // process.env.NEXT_PUBLIC_BACKEND_URL;
const FEED_URL = 'http://localhost/feed' // process.env.NEXT_PUBLIC_FEED_URL;

const backendApi = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

backendApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface LoginResponse {
  accessToken: string;
}

interface RegisterResponse {
  id: string;
  username: string;
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  const response: AxiosResponse<LoginResponse> = await backendApi.post('/api/auth/login', { username, password });
  if (response.data.accessToken) {
    localStorage.setItem('accessToken', response.data.accessToken);
  }
  return response.data;
};

export const register = async (username: string, password: string): Promise<RegisterResponse> => {
  const response: AxiosResponse<RegisterResponse> = await backendApi.post('/api/users', { username, password });
  return response.data;
};

export const postMessage = async (subject: string, content: string): Promise<any> => {
  const response = await backendApi.post(`/api/subjects/${subject}`, { message: content });
  return response.data;
};

export const getFeedUrl = (subject: string): string => {
  return `${FEED_URL}/api/subjects/${subject}`;
};