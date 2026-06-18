import React from 'react';

export const WHATS_NEW_VERSION = '5.0';
const STORAGE_KEY = `whats_new_seen_v${WHATS_NEW_VERSION}`;

export function shouldShowWhatsNew() {
  return localStorage.getItem(STORAGE_KEY) !== '1';
}

export function markWhatsNewSeen() {
  localStorage.setItem(STORAGE_KEY, '1');
}

const FEATURES = [
  {
    icon: '🗑️',
    title: 'Elimina misurazioni',
    body: 'Nel tab Storico puoi ora eliminare una misurazione sbagliata: tocca il cestino sulla riga e conferma.',
  },
  {
    icon: '📅',
    title: 'Data del piano alimentare',
    body: 'La card Piano Alimentare mostra ora la data in cui è stato generato, così sai sempre quanto è recente.',
  },
  {
    icon: '🎯',
    title: 'Predizione anche per massa',
    body: 'La card di predizione obiettivo funziona ora anche per chi vuole aumentare di peso, non solo dimagrire.',
  },
  {
    icon: '🐛',
    title: 'Fix: colore BMI e "ieri"',
    body: 'Il colore BMI nel tab Obiettivi ora segue le stesse categorie della Home. Corretto anche il messaggio "rispetto a ieri".',
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
