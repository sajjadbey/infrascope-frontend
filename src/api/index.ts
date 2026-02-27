import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

export const getStats = () => api.get('/stats/');
export const getASNs = (params?: Record<string, unknown>) => api.get('/asns/', { params });
export const getASNDetail = (asnNumber: number | string) => api.get(`/asns/${asnNumber}/`);
export const lookupIP = (ip: string) => api.get('/lookup/', { params: { ip } });
export const getTopologyData = () => api.get('/topology/');
export const getMapData = () => api.get('/map/');
