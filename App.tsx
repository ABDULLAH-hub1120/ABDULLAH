import React, { useState } from 'react';
import { GlobalStateProvider, useGlobalState } from './context/GlobalStateContext';
import { Layout } from './components/Layout';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { Pricing } from './components/Pricing';
import { AdminDashboard } from './components/AdminDashboard';
import { Toaster } from 'react-hot-toast';

// Inner App Component to use context hooks
const AppContent = () => {
  const { currentUser } = useGlobalState();
  const [currentView, setCurrentView] = useState<'dashboard' | 'pricing' | 'admin'>('dashboard');

  if (!currentUser) {
    return <Auth />;
  }

  return (
    <Layout view={currentView} setView={setCurrentView}>
      {currentView === 'dashboard' && <Dashboard />}
      {currentView === 'pricing' && <Pricing />}
      {currentView === 'admin' && currentUser.role === 'admin' ? (
        <AdminDashboard />
      ) : currentView === 'admin' ? (
        <div className="text-center py-20 text-red-500">Access Restricted</div>
      ) : null}
    </Layout>
  );
};

const App = () => {
  return (
    <GlobalStateProvider>
      <AppContent />
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155',
          },
        }}
      />
    </GlobalStateProvider>
  );
};

export default App;
