import axiosClient from './axiosClient';

export const tournamentApi = {
  getAll: (params) => axiosClient.get('/tournaments', { params }),
  getById: (id) => axiosClient.get(`/tournaments/${id}`),
  getStandings: (id) => axiosClient.get(`/tournaments/${id}/standings`),
  create: (data) => axiosClient.post('/tournaments', data),
  update: (id, data) => axiosClient.put(`/tournaments/${id}`, data),
  delete: (id) => axiosClient.delete(`/tournaments/${id}`),
};

export default tournamentApi;
