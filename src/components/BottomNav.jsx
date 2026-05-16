import React, { useState } from 'react';

const HomeIco = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const HistoryIco = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);
const GoalsIco = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);
const ProfileIco = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const TABS = [
  { id: 'home',    label: 'HOME',      Ico: HomeIco },
  { id: 'history', label: 'STORICO',   Ico: HistoryIco },
  { id: 'goals',   label: 'OBIETTIVI', Ico: GoalsIco },
  { id: 'profile', label: 'PROFILO',   Ico: ProfileIco },
];

export default function BottomNav({ active, go, onAdd }) {
  const [ripple, setRipple] = useState(null);

  const handleTab = (id) => {
    setRipple(id);
    setTimeout(() => setRipple(null), 400);
    go(id);
  };

  const handlePlus = () => {
    setRipple('plus');
    setTimeout(() => setRipple(null), 400);
    onAdd();
  };

  // Split tabs around center
  const left  = TABS.slice(0, 2);
  const right = TABS.slice(2);

  return (
    <nav className="nav">
      {/* Left tabs */}
      {left.map(({ id, label, Ico }) => (
        <button
          key={id}
          className={`nav-btn ${active === id ? 'on' : ''}`}
          onClick={() => handleTab(id)}
        >
          <div className="nav-ico-wrap">
            <Ico />
            {ripple === id && <span className="nav-ripple" />}
          </div>
          <span className={`nav-lbl ${active === id ? 'nav-lbl-on' : ''}`}>{label}</span>
          {active === id && <span className="nav-active-dot" />}
        </button>
      ))}

      {/* Center + button */}
      <div className="nav-plus-wrap">
        <button className="nav-plus" onClick={handlePlus} aria-label="Aggiungi misurazione">
          {ripple === 'plus' && <span className="nav-plus-ripple" />}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      {/* Right tabs */}
      {right.map(({ id, label, Ico }) => (
        <button
          key={id}
          className={`nav-btn ${active === id ? 'on' : ''}`}
          onClick={() => handleTab(id)}
        >
          <div className="nav-ico-wrap">
            <Ico />
            {ripple === id && <span className="nav-ripple" />}
          </div>
          <span className={`nav-lbl ${active === id ? 'nav-lbl-on' : ''}`}>{label}</span>
          {active === id && <span className="nav-active-dot" />}
        </button>
      ))}
    </nav>
  );
}
