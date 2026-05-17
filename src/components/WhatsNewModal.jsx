import React from 'react';

export const WHATS_NEW_VERSION = '3.0';
const STORAGE_KEY = `whats_new_seen_v${WHATS_NEW_VERSION}`;

export function shouldShowWhatsNew() {
  return localStorage.getItem(STORAGE_KEY) !== '1';
}

export function markWhatsNewSeen() {
  localStorage.setItem(STORAGE_KEY, '1');
}

const FEATURES = [
  {
    icon: '🥗',
    title: 'Piano alimentare AI',
    body: 'Generato da Groq/Llama — 7 giorni completi con macros per ogni pasto. Personalizzabile con le tue preferenze alimentari.',
  },
  {
    icon: '🎯',
    title: 'Preferenze alimentari',
    body: 'Tocca la campanella → "Piano AI" per impostare alimenti preferiti, da evitare e tipo di dieta. Il piano si adatta a te.',
  },
  {
    icon: '🔔',
    title: 'Promemoria pesata',
    body: 'Tocca la campanella per attivare le notifiche. Riceverai un promemoria se non ti misuri da oltre 30 ore.',
  },
  {
    icon: '📊',
    title: 'Grafico avanzato',
    body: 'Media mobile 7 giorni e trend lineare nel tab Storico. Attivali con i bottoni in alto al grafico.',
  },
  {
    icon: '📏',
    title: 'Misure corporee & foto',
    body: 'Aggiungi vita, fianchi, petto e braccia ad ogni pesata. Le foto progress si confrontano prima/dopo nel tab Storico.',
  },
  {
    icon: '♂️',
    title: 'Sesso & dati precisi',
    body: 'Imposta sesso e data di nascita nel Profilo per BMI e TDEE più accurati — il piano AI usa il tuo fabbisogno reale.',
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

        {/* Header */}
        <div className="wnew-header">
          <div className="wnew-badge">NOVITÀ v{WHATS_NEW_VERSION}</div>
          <div className="wnew-title">Peso Tracker è stato aggiornato</div>
          <div className="wnew-sub">Ecco cosa c&apos;è di nuovo</div>
        </div>

        {/* Features list */}
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
