import axios from 'axios';

const rawApiBase = import.meta.env.VITE_API_URL || 'http://localhost:3002';
const cleanApiBase = rawApiBase.replace(/\/api\/?$/, '').replace(/\/+$/, '');
const API_BASE = `${cleanApiBase}/api`;

const rawAiBase = import.meta.env.VITE_AI_API_URL || 'http://127.0.0.1:8000';
const AI_API_BASE = rawAiBase.replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getProjects = () =>
  api.get('/projects').then(res => res.data).catch(() => ({
    success: true,
    projects: [
      { project_id: 'project-aurora', name: 'Project Aurora: Antarctic Protocol', description: 'Sci-Fi Psychological Thriller in polar base', status: 'ACTIVE' },
      { project_id: 'project-neomumbai', name: 'Cyberpunk 2099: Neo-Mumbai', description: 'High-octane cyberpunk action thriller', status: 'ACTIVE' },
    ]
  }));

export const createProject = (data) =>
  api.post('/projects', data).then(res => res.data);

export const getStats = (projectId) =>
  api.get(`/projects/${projectId}/stats`).then(res => res.data);

export const getConflicts = (projectId) =>
  api.get(`/projects/${projectId}/conflicts`).then(res => res.data);

export const approveConflict = (conflictId, approvedBy = 'Director', action = 'APPROVE') =>
  api.post(`/conflicts/${conflictId}/approve`, { approvedBy, action }).then((res) => res.data);

export const resetConflicts = (projectId) =>
  api.post(`/projects/${projectId}/reset-conflicts`).then(res => res.data);

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
