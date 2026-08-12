import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Layout from './layouts/Layout';
import Dashboard from './pages/Dashboard';
import Production from './pages/Production';
import Script from './pages/Script';
import Footage from './pages/Footage';
import DirectorHUD from './pages/DirectorHUD';
import Conflicts from './pages/Conflicts';
import ProductionSearch from './pages/ProductionSearch';
import AgentActivity from './pages/AgentActivity';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Cinematic Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Studio App Shell Routes */}
        <Route element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="production" element={<Production />} />
          <Route path="script" element={<Script />} />
          <Route path="footage" element={<Footage />} />
          <Route path="live-monitor" element={<DirectorHUD />} />
          <Route path="conflicts" element={<Conflicts />} />
          <Route path="search" element={<ProductionSearch />} />
          <Route path="agents" element={<AgentActivity />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
