import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { I18nextProvider } from 'react-i18next';
import i18n from './lib/i18n';
import { AppProvider } from './contexts/AppContext';
import './index.css';

// Simple test component
const TestComponent = () => {
  return (
    <div className="p-8 bg-app-dark text-white">
      <h1 className="text-2xl mb-4">Debug Component</h1>
      <p>This component is rendering correctly with all providers.</p>
    </div>
  );
};

// Create a test app with all the providers in the right order
const DebugApp = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <TestComponent />
        </AppProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
};

// Only initialize if directly loaded
if (import.meta.hot) {
  const container = document.getElementById('root');
  if (container) {
    createRoot(container).render(<DebugApp />);
  }
}

export default DebugApp;