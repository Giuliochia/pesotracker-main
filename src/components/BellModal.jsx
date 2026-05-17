import React, { useState } from 'react';

const DIET_TYPES = [
  { value: '', label: 'Nessuna restrizione' },
  { value: 'vegetariana', label: 'Vegetariana' },
  { value: 'vegana', label: 'Vegana' },
  { value: 'senza glutine', label: 'Senza glutine' },
  { value: 'senza latticini', label: 'Senza latticini' },
  { value: 'mediterranea', label: 'Mediterranea' },
];

function loadPrefs() {
  try { return JSON.parse(localStorage.getItem('food_prefs') || '{}'); }
  catch { return {}; }
}

export default function BellModal({ onClose, notifGranted, onRequestNotif }) {
  const [tab, setTab] = useState(0);
  const [prefs, setPrefs] = useState(() => loadPrefs());
  const [saved, setSaved] = useState(false);

  const savePrefs = () => {
    localStorage.setItem('food_prefs', JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="overlay" onClick={onClose} style={{ zIndex: 300, alignItems: 'flex-end' }}>
      <div className="guide-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div className="modal-title" style={{ marginBottom: 0 }}>IMPOSTAZIONI</div>
          <button className="guide-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="guide-tabs">
          {['Notifiche', 'Piano AI'].map((t, i) => (
            <button
              key={t}
              className={`guide-tab-btn ${tab === i ? 'guide-tab-on' : ''}`}
              onClick={() => setTab(i)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="guide-content">

          {tab === 0 && (
            <div className="bell-notif-section">
              <div style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: 12 }}>🔔</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', textAlign: 'center', marginBottom: 8 }}>
                Promemoria pesata
              </div>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 1.6, marginBottom: 20 }}>
                Ricevi una notifica se non ti misuri da oltre 30 ore. Funziona solo con l&apos;app installata sulla schermata Home.
              </div>
              {notifGranted ? (
                <div style={{ textAlign: 'center', padding: '12px 20px', background: 'rgba(0,255,65,0.08)', border: '1px solid rgba(0,255,65,0.2)', borderRadius: 10, color: '#00FF41', fontWeight: 700, fontSize: '0.85rem' }}>
                  Notifiche attive
                </div>
              ) : (
                <button
                  type="button"
                  className="btn-g"
                  onClick={() => { onRequestNotif(); }}
                >
                  Attiva notifiche
                </button>
              )}
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: 16, lineHeight: 1.5 }}>
                iOS: richiede iOS 16.4+ e app installata
              </div>
            </div>
          )}

          {tab === 1 && (
            <div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginBottom: 18, lineHeight: 1.6 }}>
                Personalizza il tuo piano alimentare AI. Le preferenze vengono usate ad ogni nuova generazione.
              </div>

              <div className="field" style={{ marginBottom: 14 }}>
                <label className="field-lbl">Alimenti preferiti</label>
                <input
                  className="inp"
                  type="text"
                  placeholder="es. pollo, pasta, verdure, pesce, riso..."
                  value={prefs.preferiti || ''}
                  onChange={e => setPrefs(p => ({ ...p, preferiti: e.target.value }))}
                />
              </div>

              <div className="field" style={{ marginBottom: 14 }}>
                <label className="field-lbl">Alimenti da evitare</label>
                <input
                  className="inp"
                  type="text"
                  placeholder="es. latticini, glutine, carne rossa, frutta secca..."
                  value={prefs.evitare || ''}
                  onChange={e => setPrefs(p => ({ ...p, evitare: e.target.value }))}
                />
              </div>

              <div className="field" style={{ marginBottom: 20 }}>
                <label className="field-lbl">Tipo di dieta</label>
                <select
                  className="inp inp-select"
                  value={prefs.tipo || ''}
                  onChange={e => setPrefs(p => ({ ...p, tipo: e.target.value }))}
                >
                  {DIET_TYPES.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              <button type="button" className="btn-g" onClick={savePrefs}>
                {saved ? '✓ Salvato!' : 'Salva preferenze'}
              </button>

              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: 10 }}>
                Salvate sul dispositivo · usate al prossimo piano
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
