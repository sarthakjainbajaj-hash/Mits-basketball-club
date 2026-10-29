import axiosClient from './axiosClient';

export const tournamentApi = {
  getAll: (params) => axiosClient.get('/tournaments', { params }),
  getById: (id) => axiosClient.get(`/tournaments/${id}`),
  getStandings: (id, params) => axiosClient.get(`/tournaments/${id}/standings`, { params }),
  create: (data) => axiosClient.post('/tournaments', data),
  update: (id, data) => axiosClient.put(`/tournaments/${id}`, data),
  delete: (id) => axiosClient.delete(`/tournaments/${id}`),
  addTeam: (id, teamId) => axiosClient.post(`/tournaments/${id}/teams`, { teamId }),
  addTeams: (id, teamIds) => axiosClient.post(`/tournaments/${id}/teams`, { teamIds }),
  removeTeam: (id, teamId) => axiosClient.delete(`/tournaments/${id}/teams/${teamId}`),
  generateFixtures: (id, data) => axiosClient.post(`/tournaments/${id}/generate-fixtures`, data),
};

export default tournamentApi;
