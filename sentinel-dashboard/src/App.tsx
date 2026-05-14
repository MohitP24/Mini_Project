import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { EventTimelinePage } from './pages/EventTimelinePage';
import { SessionExplorerPage } from './pages/SessionExplorerPage';
import { PolicyAdminPage } from './pages/PolicyAdminPage';
import { WhatIfSimulationPage } from './pages/WhatIfSimulationPage';
import { ForensicsPage } from './pages/ForensicsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/events" element={<EventTimelinePage />} />
            <Route path="/sessions" element={<SessionExplorerPage />} />
            <Route path="/policies" element={<PolicyAdminPage />} />
            <Route path="/simulation" element={<WhatIfSimulationPage />} />
            <Route path="/forensics" element={<ForensicsPage />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
