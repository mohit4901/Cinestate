import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProjects, createProject as apiCreateProject } from '../services/api';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await getProjects();
      if (res.projects && res.projects.length > 0) {
        setProjects(res.projects);
        
        // Try to load from localStorage, otherwise default to the first project
        const savedProject = localStorage.getItem('cinestate_active_project');
        if (savedProject && res.projects.find(p => p.project_id === savedProject)) {
          setActiveProjectId(savedProject);
        } else {
          setActiveProjectId(res.projects[0].project_id);
          localStorage.setItem('cinestate_active_project', res.projects[0].project_id);
        }
      }
    } catch (e) {
      console.error("Failed to load projects", e);
    } finally {
      setLoading(false);
    }
  };

  const switchProject = (projectId) => {
    setActiveProjectId(projectId);
    localStorage.setItem('cinestate_active_project', projectId);
    // Force reload to clear any lingering state
    window.location.reload();
  };

  const createProject = async (projectId, name, description) => {
    try {
      await apiCreateProject({ project_id: projectId, name, description });
      await fetchProjects();
      switchProject(projectId);
      return true;
    } catch (e) {
      console.error("Failed to create project", e);
      return false;
    }
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      activeProjectId,
      activeProject: projects.find(p => p.project_id === activeProjectId),
      loading,
      switchProject,
      createProject
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);
