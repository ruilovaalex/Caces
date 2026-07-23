import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './app/App.tsx';
import { ToastProvider } from './components/common/Toast.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
);
