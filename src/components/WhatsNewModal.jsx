import React from 'react';

export const WHATS_NEW_VERSION = '6.0';
const STORAGE_KEY = `whats_new_seen_v${WHATS_NEW_VERSION}`;

export function shouldShowWhatsNew() {
  return localStorage.getItem(STORAGE_KEY) !== '1';
}

export function markWhatsNewSeen() {
  localStorage.setItem(STORAGE_KEY, '1');
}

const FEATURES = [
  {
    icon: '🤖',
    title: 'Chat AI personale',
    body: 'Tocca il fumetto nell\'header della Home per chattare con l\'AI. Conosce i tuoi dati e risponde su dieta, fitness e motivazione.',
  },
  {
    icon: '💧',
    title: 'Tracciamento acqua',
    body: 'Nuova card in Home per contare i bicchieri d\'acqua al giorno. Si azzera automaticamente ogni giorno.',
  },
  {
    icon: '✏️',
    title: 'Modifica e note misurazioni',
    body: 'Nel tab Storico puoi ora modificare un peso errato e aggiungere una nota ad ogni misurazione (es. "dopo palestra").',
  },
  {
    icon: '⚡',
    title: 'Calorie consigliate',
    body: 'La Home mostra ora le kcal giornaliere consigliate in base al tuo TDEE e obiettivo (deficit, mantenimento o surplus).',
  },
  {
    icon: '🏆',
    title: 'Modalità mantenimento',
    body: 'Quando raggiungi il 100% del tuo obiettivo, l\'app entra in modalità mantenimento e ti mostra il range ideale.',
  },
  {
    icon: '🥇',
    title: 'Record personali',
    body: 'Nel tab Obiettivi trovi i tuoi record: peso minimo raggiunto e miglior settimana di dimagrimento.',
  },
  {
    icon: '📲',
    title: 'Onboarding guidato',
    body: 'I nuovi utenti vengono guidati in 3 step per configurare il profilo prima di iniziare a usare l\'app.',
  },
  {
    icon: '⬇️',
    title: 'Esporta i tuoi dati',
    body: 'Nel tab Storico trovi il pulsante CSV per scaricare tutte le tue misurazioni in un file.',
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
