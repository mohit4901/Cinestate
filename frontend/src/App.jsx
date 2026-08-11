import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layouts/Layout';
import Dashboard from './pages/Dashboard';
import Production from './pages/Production';
import Script from './pages/Script';
import Footage from './pages/Footage';
import Conflicts from './pages/Conflicts';
import ProductionSearch from './pages/ProductionSearch';
import AgentActivity from './pages/AgentActivity';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="production" element={<Production />} />
          <Route path="script" element={<Script />} />
          <Route path="footage" element={<Footage />} />
          <Route path="conflicts" element={<Conflicts />} />
          <Route path="search" element={<ProductionSearch />} />
          <Route path="agents" element={<AgentActivity />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
