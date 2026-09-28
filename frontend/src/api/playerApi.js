import axiosClient from './axiosClient';

export const playerApi = {
  getAll: (params) => axiosClient.get('/players', { params }),
  getById: (id) => axiosClient.get(`/players/${id}`),
  create: (data) => axiosClient.post('/players', data),
  update: (id, data) => axiosClient.put(`/players/${id}`, data),
  delete: (id) => axiosClient.delete(`/players/${id}`),
  getLeaderboard: () => axiosClient.get('/players/stats/leaderboard'),
};

export default playerApi;
