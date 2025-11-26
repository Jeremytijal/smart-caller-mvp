import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Conversations from './pages/Conversations';
import Integrations from './pages/Integrations';
import LeadQuality from './pages/LeadQuality';
import Onboarding from './pages/Onboarding';
import AgentSetup from './pages/AgentSetup';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="conversations" element={<Conversations />} />
          <Route path="integrations" element={<Integrations />} />
          <Route path="quality" element={<LeadQuality />} />
          <Route path="agent-setup" element={<AgentSetup />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
