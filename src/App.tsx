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

export default App;
