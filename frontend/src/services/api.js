import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002';
const AI_API_BASE = import.meta.env.VITE_AI_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getProjects = () =>
  axios.get(`${AI_API_BASE}/projects`).then(res => res.data);

export const createProject = (data) =>
  axios.post(`${AI_API_BASE}/projects`, data).then(res => res.data);

export const getStats = (projectId) =>
  api.get(`/projects/${projectId}/stats`).then(res => res.data);

export const getConflicts = (projectId) =>
  api.get(`/projects/${projectId}/conflicts`).then(res => res.data);

export const approveConflict = (conflictId, approvedBy = 'Director', action = 'APPROVE') =>
  api.post(`/conflicts/${conflictId}/approve`, { approvedBy, action }).then((res) => res.data);

export const getScenes = (projectId) =>
  api.get(`/projects/${projectId}/scenes`).then(res => res.data);

export const getCharacterHistory = (projectId, character, attribute) =>
  api.get(`/projects/${projectId}/character-history?character=${character}&attribute=${attribute}`).then(res => res.data);

export const getDependencies = (projectId, sceneId) =>
  api.get(`/projects/${projectId}/dependencies/${sceneId}`).then(res => res.data);

export const getAuditLogs = (projectId) =>
  api.get(`/projects/${projectId}/audit-logs`).then(res => res.data);

export const searchEvents = (projectId, character = '', scene = '', eventType = '') =>
  api.get(`/projects/${projectId}/search?character=${character}&scene=${scene}&event_type=${eventType}`).then(res => res.data);

export const analyzeTake = (data) =>
  api.post('/analyze-take', data).then((res) => res.data);

export const analyzeLiveFrame = (formData) =>
  axios.post(`${AI_API_BASE}/analyze-live-frame`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((res) => res.data);

export default api;
