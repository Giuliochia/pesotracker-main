import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/App.css';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
