import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/App.css';
import { scheduleCheck, shouldNotify, showReminder, getSettings } from './utils/notifications';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

// Check on app load if notification is due, then poll every minute
const _initNotif = async () => {
  const s = getSettings();
  if (shouldNotify(s)) await showReminder();
  scheduleCheck();
};
_initNotif();

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
