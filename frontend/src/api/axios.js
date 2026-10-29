import axios from 'axios';

// Utilise la route /api relative (fonctionne sur localhost comme sur Vercel)
const API = axios.create({
  baseURL: '/api',
});

// Intercepteur pour ajouter le token JWT
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs d'auth
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (window.location.pathname.startsWith('/backoffice-portal')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/backoffice-portal/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
