import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Schools from './pages/Schools';
import Interventions from './pages/Interventions';
import Calendar from './components/calendar/Calendar';
import Contacts from './pages/Contacts';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={
            <Layout>
              <Dashboard />
            </Layout>
          } />
          
          <Route path="/schools" element={
            <Layout>
              <Schools />
            </Layout>
          } />

          <Route path="/interventions" element={
            <Layout>
              <Interventions />
            </Layout>
          } />

          <Route path="/calendar" element={
            <Layout>
              <Calendar />
            </Layout>
          } />

          <Route path="/contacts" element={
            <Layout>
              <Contacts />
            </Layout>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default function App() {
  return (
    <html lang="en">
      <body>
        <CopilotKit publicApiKey="ck_pub_e59434d09550fac8e377e043efb5d3bd">
          <CopilotSidebar
            labels={{
              title: "Sidebar Assistant",
              initial: "How can I help you today?"
            }}
            instructions="Your product deserves an AI sidekick"
          />
        </CopilotKit>
      </body>
    </html>
  );
}