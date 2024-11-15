import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Prevent MetaMask injection errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    if (e.message.includes('web3') || e.message.includes('ethereum')) {
      e.preventDefault();
      console.warn('Ignored web3/ethereum injection error');
    }
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
