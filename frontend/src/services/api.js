import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getStats = (projectId = 'project-aurora') =>
  api.get(`/projects/${projectId}/stats`).then((res) => res.data);

export const getConflicts = (projectId = 'project-aurora') =>
  api.get(`/projects/${projectId}/conflicts`).then((res) => res.data);

export const approveConflict = (conflictId, approvedBy = 'Director', action = 'APPROVE') =>
  api.post(`/conflicts/${conflictId}/approve`, { approvedBy, action }).then((res) => res.data);

export const getScenes = (projectId = 'project-aurora') =>
  api.get(`/projects/${projectId}/scenes`).then((res) => res.data);

export const getCharacterHistory = (projectId = 'project-aurora', character = 'arjun', attribute = 'injury_location') =>
  api.get(`/projects/${projectId}/character-history`, { params: { character, attribute } }).then((res) => res.data);

export const getDependencies = (projectId = 'project-aurora', sceneId = 'scene_17') =>
  api.get(`/projects/${projectId}/dependencies/${sceneId}`).then((res) => res.data);

export const getAuditLogs = (projectId = 'project-aurora') =>
  api.get(`/projects/${projectId}/audit-logs`).then((res) => res.data);

export const searchEvents = (projectId = 'project-aurora', character = '', scene = '', eventType = '') =>
  api.get(`/projects/${projectId}/search`, { params: { character, scene, event_type: eventType } }).then((res) => res.data);

export const analyzeTake = (data) =>
  api.post('/analyze-take', data).then((res) => res.data);

export default api;
