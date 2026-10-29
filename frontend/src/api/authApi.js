import axiosClient from './axiosClient';

export const authApi = {
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  register: (userData) => axiosClient.post('/auth/register', userData),
  getMe: () => axiosClient.get('/auth/me'),
  getAllUsers: () => axiosClient.get('/auth/users'),
  updateUserRole: (id, role) => axiosClient.put(`/auth/users/${id}/role`, { role }),
  revokeUserSessions: (id) => axiosClient.post(`/auth/users/${id}/revoke-sessions`),
  toggleUserSuspension: (id) => axiosClient.put(`/auth/users/${id}/suspend`),
};

export default authApi;
