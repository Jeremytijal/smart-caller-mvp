import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Conversations from './pages/Conversations';
import Contacts from './pages/Contacts';
import AgentSettings from './pages/AgentSettings';
import Integrations from './pages/Integrations';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Campaigns from './pages/Campaigns';
import CreateCampaign from './pages/CreateCampaign';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

console.log('App.jsx: Rendering App component...');

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<Onboarding />} />

            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="conversations" element={<Conversations />} />
              <Route path="contacts" element={<Contacts />} />
              <Route path="campaigns" element={<Campaigns />} />
              <Route path="campaigns/new" element={<CreateCampaign />} />
              <Route path="settings" element={<AgentSettings />} />
              <Route path="integrations" element={<Integrations />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
