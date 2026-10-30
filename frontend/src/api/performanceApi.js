import axiosClient from './axiosClient';

export const performanceApi = {
  // Get aggregated performance analytics (Admin / Super Admin only)
  getStats: () => axiosClient.get('/performance/stats', { params: { _nocache: true } }),

  // Reset performance buffer metrics (Admin only)
  resetStats: () => axiosClient.post('/performance/reset'),
};

export default performanceApi;
