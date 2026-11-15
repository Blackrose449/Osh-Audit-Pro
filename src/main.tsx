import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from '@/hooks/useAuth';

async function bootstrap() {
  const mode = import.meta.env.VITE_API_MODE ?? 'mock';
  if (mode === 'mock') {
    const { worker } = await import('@/api/browser');
    await worker.start({ onUnhandledRequest: 'bypass' });
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
}

bootstrap();
