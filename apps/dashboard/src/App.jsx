import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import OverviewPage from './pages/OverviewPage';
import SessionsPage from './pages/SessionsPage';
import SessionDetailPage from './pages/SessionDetailPage';
import HeatmapPage from './pages/HeatmapPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Navbar />
          <main className="content-body">
            <Routes>
              <Route path="/" element={<OverviewPage />} />
              <Route path="/sessions" element={<SessionsPage />} />
              <Route path="/sessions/:sessionId" element={<SessionDetailPage />} />
              <Route path="/heatmap" element={<HeatmapPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
