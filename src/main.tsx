import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);

  const renderApplication = () => {
    try {
      // Tes apakah localStorage sudah benar-benar siap diakses oleh WebView Android
      window.localStorage.setItem('test_env', 'ok');
      window.localStorage.removeItem('test_env');
      
      // Jika aman dan siap, render aplikasi React Anda
      root.render(
        <StrictMode>
          <App />
        </StrictMode>
      );
    } catch (e) {
      // Jika WebView belum siap (menolak localStorage), beri jeda 300ms lalu coba lagi
      setTimeout(renderApplication, 300);
    }
  };

  // Pastikan browser/WebView sudah selesai memuat struktur halaman sepenuhnya
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    renderApplication();
  } else {
    window.addEventListener('load', renderApplication);
  }
}
