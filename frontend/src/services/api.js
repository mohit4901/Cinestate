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
  api.get('/projects').then(res => res.data);

export const createProject = (data) =>
  api.post('/projects', data).then(res => res.data);

export const getStats = (projectId) =>
  api.get(`/stats?project_id=${projectId}`).then(res => res.data);

export const getConflicts = (projectId) =>
  api.get(`/conflicts?project_id=${projectId}`).then(res => res.data);

export const approveConflict = (conflictId, approvedBy = 'Director', action = 'APPROVE') =>
  api.post(`/conflicts/${conflictId}/approve`, { approvedBy, action }).then((res) => res.data);

export const getScenes = (projectId) =>
  api.get(`/scenes?project_id=${projectId}`).then(res => res.data);

export const getCharacterHistory = (projectId, character, attribute) =>
  api.get(`/character-history?project_id=${projectId}&character=${character}&attribute=${attribute}`).then(res => res.data);

export const getDependencies = (projectId, sceneId) =>
  api.get(`/downstream-dependencies?project_id=${projectId}&scene_id=${sceneId}`).then(res => res.data);

export const getAuditLogs = (projectId) =>
  api.get(`/agent-audit-logs?project_id=${projectId}`).then(res => res.data);

export const searchEvents = (projectId, character = '', scene = '', eventType = '') =>
  api.get(`/search?project_id=${projectId}&character=${character}&scene=${scene}&event_type=${eventType}`).then(res => res.data);

export const analyzeTake = (data) =>
  api.post('/analyze-take', data).then((res) => res.data);

export const analyzeLiveFrame = (formData) =>
  axios.post(`${AI_API_BASE}/analyze-live-frame`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((res) => res.data);

export default api;
