import React, { useState } from 'react';

const TABS = ['Tutorial', 'Novità', 'Consigli'];

const TUTORIAL = [
  {
    icon: '🏠',
    title: 'Home',
    items: [
      'Vedi il tuo peso attuale e l\'obiettivo in tempo reale.',
      'Il BMI si aggiorna automaticamente ad ogni misurazione.',
      'La barra progresso mostra quanto sei vicino all\'obiettivo.',
      'Premi "Genera il mio piano alimentare" per ricevere una dieta personalizzata dall\'AI.',
    ],
  },
  {
    icon: '📊',
    title: 'Storico',
    items: [
      'Il grafico avanzato mostra andamento, media mobile 7gg e trend lineare.',
      'Attiva/disattiva Media e Trend con i bottoni in alto al grafico.',
      'Nella sezione Misure corporee trovi vita, fianchi, petto e braccia con mini-grafico.',
      'Le foto corporee si visualizzano in griglia — toccale per ingrandire.',
    ],
  },
  {
    icon: '🎯',
    title: 'Obiettivi',
    items: [
      'Visualizza il tuo obiettivo di peso e il progresso percentuale.',
      'Puoi modificare l\'obiettivo in qualsiasi momento dal tab Profilo.',
    ],
  },
  {
    icon: '👤',
    title: 'Profilo',
    items: [
      'Modifica nome, altezza, peso iniziale, obiettivo, sesso e data di nascita.',
      'Il TDEE (calorie giornaliere) viene calcolato automaticamente dai tuoi dati.',
      'Tocca l\'avatar per cambiare la foto profilo.',
      'Più dati inserisci, più accurato sarà il piano alimentare AI.',
    ],
  },
  {
    icon: '➕',
    title: 'Aggiungi misurazione',
    items: [
      'Premi il pulsante + in basso al centro per aggiungere una pesata.',
      'Puoi inserire anche misure corporee (vita, fianchi, petto, braccia) nello stesso momento.',
      'Aggiungi una foto progress toccando l\'icona fotocamera — ora puoi scegliere da galleria o scattare.',
    ],
  },
];

const CHANGELOG = [
  {
    version: 'v6.0',
    date: 'Giugno 2026',
    badge: 'NUOVO',
    items: [
      '🤖 Chat AI personale — chiedile consigli su dieta, allenamento e motivazione',
      '💧 Tracciamento acqua giornaliero con contatore bicchieri',
      '✏️ Modifica peso e aggiungi note alle misurazioni dallo Storico',
      '⚡ Calorie consigliate (TDEE) mostrate nella Home',
      '🏆 Modalità mantenimento quando raggiungi l\'obiettivo',
      '🥇 Record personali: peso minimo e miglior settimana',
      '📲 Onboarding guidato per i nuovi utenti',
      '⬇️ Esporta misurazioni in CSV dallo Storico',
    ],
  },
  {
    version: 'v4.0–v5.0',
    date: 'Giugno 2026',
    items: [
      '🎖️ Badge e obiettivi sbloccabili nel tab Obiettivi',
      '📅 Analisi settimanale AI con grafico e predizione traguardo',
      '💪 Supporto obiettivo massa muscolare con surplus calorico',
      '🔵 Grafico BMI a semicerchio colorato per categoria',
      '🗑️ Elimina misurazioni direttamente dallo Storico',
      '🎉 Confetti al raggiungimento dell\'obiettivo',
    ],
  },
  {
    version: 'v3.0',
    date: 'Maggio 2026',
    items: [
      '🥗 Piano alimentare AI personalizzato (powered by Groq/Llama)',
      '💾 Piano alimentare salvato automaticamente — non devi rigenerarlo ad ogni accesso',
      '🔔 Campanella notifiche — promemoria pesata se non ti misuri da oltre 30 ore',
      '♂️♀️ Selezione genere per BMI e TDEE più accurati',
      '🖼️ Aggiungi foto da galleria, cloud o fotocamera',
      '🔁 Confronto foto PRIMA/DOPO e misure corporee nel tab Storico',
      '❓ Guida integrata con tutorial, novità e consigli',
      '🔑 Recupero password direttamente dalla schermata di login',
    ],
  },
  {
    version: 'v2.0',
    date: 'Maggio 2026',
    items: [
      '📈 Grafici avanzati con media mobile e trend lineare',
      '📏 Misure corporee (vita, fianchi, petto, braccia)',
      '📸 Foto corporee progress con lightbox',
    ],
  },
  {
    version: 'v1.0',
    date: 'Maggio 2026',
    items: [
      '⚡ Lancio ufficiale Peso Tracker',
      '⚖️ Tracking peso giornaliero',
      '🎯 Obiettivi e progresso',
      '👤 Profilo con BMI e TDEE',
      '📊 Grafico andamento peso',
    ],
  },
];

const TIPS = [
  { icon: '⏰', title: 'Pesati sempre alla stessa ora', body: 'La mattina a digiuno, dopo essere andato in bagno, è il momento più preciso. Evita variazioni dovute ai pasti.' },
  { icon: '📅', title: 'Frequenza ideale', body: 'Ogni 1-3 giorni è ottimale. Pesarsi troppo spesso può scoraggiarti per le normali fluttuazioni giornaliere (1-2 kg sono normali).' },
  { icon: '🥗', title: 'Massimizza il piano AI', body: 'Inserisci sesso, data di nascita e livello di attività nel Profilo prima di generare il piano — l\'AI userà il tuo TDEE reale per calibrare le calorie.' },
  { icon: '📏', title: 'Misura il corpo, non solo il peso', body: 'Il peso può stagnare mentre perdi centimetri. Aggiungi vita e fianchi ogni settimana per vedere i veri progressi.' },
  { icon: '📸', title: 'Foto settimanale', body: 'Scatta una foto nelle stesse condizioni ogni settimana (stessa luce, stesso orario). Il confronto visivo è spesso più motivante dei numeri.' },
  { icon: '🎯', title: 'Obiettivo realistico', body: 'Puntare a perdere 0.5–1 kg a settimana è sostenibile e sano. Deficit troppo aggressivi portano a perdita muscolare e rimbalzi.' },
];

export default function GuideModal({ onClose }) {
  const [tab, setTab] = useState(0);

  return (
    <div className="overlay" onClick={onClose} style={{ zIndex: 300, alignItems: 'flex-end' }}>
      <div className="guide-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div className="modal-title" style={{ marginBottom: 0 }}>GUIDA & NOVITÀ</div>
          <button className="guide-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Tab switcher */}
        <div className="guide-tabs">
          {TABS.map((t, i) => (
            <button
              key={t}
              className={`guide-tab-btn ${tab === i ? 'guide-tab-on' : ''}`}
              onClick={() => setTab(i)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="guide-content">

          {/* TUTORIAL */}
          {tab === 0 && (
            <div>
              {TUTORIAL.map(section => (
                <div key={section.title} className="guide-section">
                  <div className="guide-section-header">
                    <span className="guide-section-icon">{section.icon}</span>
                    <span className="guide-section-title">{section.title}</span>
                  </div>
                  <ul className="guide-list">
                    {section.items.map((item, i) => (
                      <li key={i} className="guide-list-item">{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* CHANGELOG */}
          {tab === 1 && (
            <div>
              {CHANGELOG.map(release => (
                <div key={release.version} className="guide-release">
                  <div className="guide-release-header">
                    <span className="guide-release-ver">{release.version}</span>
                    {release.badge && <span className="guide-release-badge">{release.badge}</span>}
                    <span className="guide-release-date">{release.date}</span>
                  </div>
                  <ul className="guide-list">
                    {release.items.map((item, i) => (
                      <li key={i} className="guide-list-item">{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* CONSIGLI */}
          {tab === 2 && (
            <div>
              {TIPS.map(tip => (
                <div key={tip.title} className="guide-tip">
                  <div className="guide-tip-header">
                    <span className="guide-tip-icon">{tip.icon}</span>
                    <span className="guide-tip-title">{tip.title}</span>
                  </div>
                  <p className="guide-tip-body">{tip.body}</p>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
