import axiosClient from './axiosClient';

export const teamApi = {
  getAll: (params) => axiosClient.get('/teams', { params }),
  getById: (id) => axiosClient.get(`/teams/${id}`),
  create: (data) => axiosClient.post('/teams', data),
  update: (id, data) => axiosClient.put(`/teams/${id}`, data),
  delete: (id) => axiosClient.delete(`/teams/${id}`),
};

export default teamApi;
