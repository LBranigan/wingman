import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('[API Request]', config.method.toUpperCase(), config.url, 'Full URL:', `${config.baseURL}${config.url}`);
  return config;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    if (response.config.url === '/users/me') {
      console.log('[API] /users/me response:', response.data);
    }
    return response;
  },
  (error) => {
    console.error('[API] Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword })
};

export const users = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data)
};

export const match = {
  getSuggestions: () => api.get('/match/suggestions'),
  request: (partnerId) => api.post('/match/request', { partnerId }),
  getRequests: () => api.get('/match/requests'),
  acceptRequest: (requestId) => api.post(`/match/requests/${requestId}/accept`),
  rejectRequest: (requestId) => api.post(`/match/requests/${requestId}/reject`),
  unmatch: () => api.post('/match/unmatch'),
  invite: (email) => api.post('/match/invite', { email })
};

export const goals = {
  getCurrentWeek: () => api.get('/goals/current-week'),
  getPartnerCurrentWeek: () => api.get('/goals/partner/current-week'),
  create: (text) => api.post('/goals', { text }),
  bulkCreate: (goals) => api.post('/goals/bulk', { goals }),
  update: (goalId, text) => api.put(`/goals/${goalId}`, { text }),
  toggle: (goalId) => api.patch(`/goals/${goalId}/toggle`),
  delete: (goalId) => api.delete(`/goals/${goalId}`),
  getHistory: (params) => api.get('/goals/history', { params }),
  getStatistics: () => api.get('/goals/statistics')
};

export const goalSets = {
  getAll: () => api.get('/goal-sets'),
  getActive: () => api.get('/goal-sets/active'),
  getPartner: () => api.get('/goal-sets/partner'),
  getById: (goalSetId) => api.get(`/goal-sets/${goalSetId}`),
  create: (data) => api.post('/goal-sets', data),
  complete: (goalSetId) => api.post(`/goal-sets/${goalSetId}/complete`),
  delete: (goalSetId) => api.delete(`/goal-sets/${goalSetId}`),
  updateDuration: (goalSetId, duration) => api.patch(`/goal-sets/${goalSetId}/duration`, { duration })
};

export const comments = {
  create: (goalId, text) => api.post('/comments', { goalId, text })
};

export const chat = {
  getMessages: () => api.get('/chat/messages'),
  sendMessage: (text) => api.post('/chat/messages', { text })
};

export default api;