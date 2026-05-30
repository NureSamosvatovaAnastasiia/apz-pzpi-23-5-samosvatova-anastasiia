import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Підключення глобальних стилів
import './index.css'; 

// Ініціалізація системи локалізації (i18next)
import './i18n/i18n.js';

// Спеціальний код для діагностики "білого екрану"
// Він виведе помилку прямо на сторінку червоним текстом, щоб ми одразу її побачили
window.addEventListener('error', (event) => {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 2rem; color: #ef4444; font-family: sans-serif; background: #fee2e2; min-height: 100vh;">
        <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Критична помилка (Білий екран)</h1>
        <p style="margin-bottom: 1rem;">Щось пішло не так під час запуску додатку. Ось деталі:</p>
        <pre style="background: #fef2f2; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; border: 1px solid #fca5a5;">
          ${event.error?.stack || event.message}
        </pre>
      </div>
    `;
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);