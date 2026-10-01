import axiosClient from './axiosClient';

export const matchApi = {
  getAll: (params) => axiosClient.get('/matches', { params }),
  getById: (id) => axiosClient.get(`/matches/${id}`),
  create: (data) => axiosClient.post('/matches', data),
  update: (id, data) => axiosClient.put(`/matches/${id}`, data),
  delete: (id) => axiosClient.delete(`/matches/${id}`),
  getSummary: (id) => axiosClient.get(`/matches/${id}/summary`),

  // Live Scoreboard Operations
  start: (id) => axiosClient.post(`/matches/${id}/start`),
  pause: (id, payload = {}) => axiosClient.post(`/matches/${id}/pause`, payload),
  resume: (id) => axiosClient.post(`/matches/${id}/resume`),
  resetTimer: (id, duration) => axiosClient.post(`/matches/${id}/reset-timer`, { duration }),
  controlShotClock: (id, payload) => axiosClient.post(`/matches/${id}/shot-clock`, payload),
  updateScore: (id, payload) => axiosClient.post(`/matches/${id}/score`, payload),
  recordFoul: (id, payload) => axiosClient.post(`/matches/${id}/foul`, payload),
  togglePossession: (id, possession) => axiosClient.post(`/matches/${id}/possession`, { possession }),
  callTimeout: (id, payload) => axiosClient.post(`/matches/${id}/timeout`, typeof payload === 'object' ? payload : { team: payload }),
  recordPlayerStat: (id, payload) => axiosClient.post(`/matches/${id}/player-stats`, payload),
  substitute: (id, payload) => axiosClient.post(`/matches/${id}/substitute`, payload),
  controlPeriod: (id, payload) => axiosClient.post(`/matches/${id}/period`, payload),
  undo: (id) => axiosClient.post(`/matches/${id}/undo`),
  end: (id) => axiosClient.post(`/matches/${id}/end`),
};

export default matchApi;
