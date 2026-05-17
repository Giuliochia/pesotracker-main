import React from 'react';

export const WHATS_NEW_VERSION = '4.0';
const STORAGE_KEY = `whats_new_seen_v${WHATS_NEW_VERSION}`;

export function shouldShowWhatsNew() {
  return localStorage.getItem(STORAGE_KEY) !== '1';
}

export function markWhatsNewSeen() {
  localStorage.setItem(STORAGE_KEY, '1');
}

const FEATURES = [
  {
    icon: '🧠',
    title: 'Analisi settimanale AI',
    body: 'Ogni settimana un commento personalizzato sul tuo andamento, generato da AI. Trovi la card "Analisi settimanale" nella Home.',
  },
  {
    icon: '🎯',
    title: 'Predizione obiettivo',
    body: 'La app calcola automaticamente in quante settimane raggiungerai il tuo obiettivo al ritmo attuale.',
  },
  {
    icon: '🎉',
    title: 'Confetti al traguardo',
    body: 'Quando raggiungi il 100% del tuo obiettivo parte una pioggia di coriandoli. Meriti di festeggiare!',
  },
  {
    icon: '👆',
    title: 'Swipe tra tab',
    body: 'Scorri orizzontalmente per passare tra Home, Storico, Obiettivi e Profilo senza toccare la barra in basso.',
  },
  {
    icon: '📈',
    title: 'Grafico BMI nel tempo',
    body: 'Nel tab Storico trovi il grafico del tuo BMI con la banda verde che indica la zona normopeso (18.5–25).',
  },
  {
    icon: '⚡',
    title: 'Gauge BMI colorato',
    body: 'Il riquadro BMI in Home ora mostra un arco con le zone colorate e un indicatore che si posiziona sul tuo valore.',
  },
];

export default function WhatsNewModal({ onClose }) {
  const handleClose = () => {
    markWhatsNewSeen();
    onClose();
  };

  return (
    <div className="overlay" onClick={handleClose} style={{ zIndex: 400, alignItems: 'flex-end' }}>
      <div className="wnew-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />

        <div className="wnew-header">
          <div className="wnew-badge">NOVITÀ v{WHATS_NEW_VERSION}</div>
          <div className="wnew-title">Peso Tracker è stato aggiornato</div>
          <div className="wnew-sub">Ecco cosa c&apos;è di nuovo</div>
        </div>

        <div className="wnew-list">
          {FEATURES.map(f => (
            <div key={f.title} className="wnew-item">
              <div className="wnew-item-icon">{f.icon}</div>
              <div className="wnew-item-text">
                <div className="wnew-item-title">{f.title}</div>
                <div className="wnew-item-body">{f.body}</div>
              </div>
            </div>
          ))}
        </div>

        <button type="button" className="btn-g wnew-btn" onClick={handleClose}>
          Inizia a usarle
        </button>
      </div>
    </div>
  );
}
