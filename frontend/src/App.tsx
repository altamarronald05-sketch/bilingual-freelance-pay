import React, { useState } from 'react';
import './i18n/config';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { ToastProvider } from './components/Toast';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { NewProjectModal } from './components/NewProjectModal';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions'>('dashboard');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center text-cyan-400 font-bold text-sm">
        Cargando PayLance Bilingüe...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <Navbar activeTab={activeTab} setActiveTab={(t) => setActiveTab(t as any)} onOpenNewProject={() => {}} />
        <main className="container mx-auto px-4 py-6">
          <Login />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(t) => setActiveTab(t as any)}
        onOpenNewProject={() => setShowNewProjectModal(true)}
      />

      <main className="container mx-auto px-4 py-6">
        {activeTab === 'dashboard' ? <Dashboard /> : <Transactions />}
      </main>

      {showNewProjectModal && (
        <NewProjectModal
          onClose={() => setShowNewProjectModal(false)}
          onCreated={() => {
            setShowNewProjectModal(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}
