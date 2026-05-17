const KEY = 'pt_reminder';

const MESSAGES = [
  'Ricordati di pesarti oggi! 💪',
  'È il momento della tua pesata! ⚡',
  'Tieni traccia dei progressi — pesati ora! 📊',
  'La bilancia ti aspetta! 🎯',
  'Un piccolo gesto, grandi risultati. Pesati! 🏆',
  'Come va oggi? Registra il tuo peso! 📈',
];

export function getSettings() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
  catch { return {}; }
}

export function saveSettings(s) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export async function requestPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  return await Notification.requestPermission();
}

export function shouldNotify(settings) {
  if (!settings.enabled) return false;
  if (!('Notification' in window) || Notification.permission !== 'granted') return false;
  const { frequency = 1, time = '08:00', lastShown } = settings;
  const now = new Date();
  const [h, m] = time.split(':').map(Number);
  if (now.getHours() < h || (now.getHours() === h && now.getMinutes() < m)) return false;
  if (!lastShown) return true;
  const daysSince = (now - new Date(lastShown)) / 86400000;
  return daysSince >= frequency;
}

export async function showReminder() {
  const body = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
  try {
    const reg = await navigator.serviceWorker?.ready;
    if (reg) {
      await reg.showNotification('Peso Tracker', {
        body,
        icon: '/logo.png',
        badge: '/logo.png',
        tag: 'peso-reminder',
        vibrate: [200, 100, 200],
      });
    } else {
      new Notification('Peso Tracker', { body, icon: '/logo.png' });
    }
  } catch {
    new Notification('Peso Tracker', { body, icon: '/logo.png' });
  }
  const s = getSettings();
  saveSettings({ ...s, lastShown: new Date().toISOString() });
}

export function scheduleCheck() {
  return setInterval(async () => {
    const s = getSettings();
    if (shouldNotify(s)) await showReminder();
  }, 60_000);
}
