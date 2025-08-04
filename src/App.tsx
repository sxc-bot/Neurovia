import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import MindMetrics from './pages/MindMetrics';
import AIReport from './pages/AIReport';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/mind-metrics" element={<MindMetrics />} />
          <Route path="/ai-report" element={<AIReport />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;