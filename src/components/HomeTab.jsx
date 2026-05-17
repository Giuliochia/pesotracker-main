import React, { useState } from 'react';
import WeightChart from './WeightChart';

const BMI_INFO = b =>
  b < 18.5 ? { lbl: 'Sottopeso', color: '#5352ED' } :
  b < 25   ? { lbl: 'Normopeso', color: '#00FF41' } :
  b < 30   ? { lbl: 'Sovrappeso', color: '#FFA502' } :
             { lbl: 'Obesità',   color: '#FF4444' };

const fmtDateShort = d =>
  new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });

// Check if two dates are consecutive days
const isYesterday = (dateA, dateB) => {
  const a = new Date(dateA); a.setHours(0,0,0,0);
  const b = new Date(dateB); b.setHours(0,0,0,0);
  return Math.abs(a - b) <= 86400000 * 2; // within 2 days for flexibility
};

export default function HomeTab({ profile, measurements }) {
  const [chartDays, setChartDays] = useState(7);

  const last  = measurements.at(-1);
  const prev  = measurements.at(-2);
  const kg    = last ? +last.weight : +profile.peso_iniziale;
  const kgP   = prev ? +prev.weight : null;
  const delta = kgP !== null ? (kg - kgP).toFixed(1) : null;
  const deltaLabel = prev && last
    ? isYesterday(last.date, prev.date) ? 'rispetto a ieri' : 'dalla misura precedente'
    : null;

  // Guard: avoid BMI division by zero
  const altezza = +profile.altezza;
  const bmiVal  = altezza > 0
    ? (kg / ((altezza / 100) ** 2)).toFixed(1)
    : '—';
  const bmi = altezza > 0 ? BMI_INFO(+bmiVal) : { lbl: '—', color: '#fff' };

  const diff    = +profile.peso_iniziale - +profile.obiettivo_kg;
  const done    = +profile.peso_iniziale - kg;
  const pct     = diff > 0 ? Math.min(100, Math.max(0, (done / diff) * 100)).toFixed(0) : 0;
  const missing = (kg - +profile.obiettivo_kg).toFixed(1);

  const medio = measurements.length
    ? (measurements.reduce((s, m) => s + +m.weight, 0) / measurements.length).toFixed(1)
    : kg.toFixed(1);

  const giorni = measurements.length > 1
    ? Math.round((new Date(measurements.at(-1).date) - new Date(measurements[0].date)) / 86400000)
    : 0;

  const mediaGg = giorni > 0 && done !== 0
    ? (Math.abs(done) / giorni).toFixed(3)
    : '0.000';

  const persiTot = done > 0 ? done.toFixed(1) : 0;
  const chartData  = measurements.slice(-chartDays);
  const ultimeMis  = [...measurements].reverse().slice(0, 5);

  return (
    <div className="pg">
      {/* HEADER */}
      <div className="home-header">
        <div className="home-header-left">
          <img
            src="/logo.png"
            alt="Peso Tracker"
            className="home-logo-img"
            onError={e => { e.currentTarget.style.display='none'; e.currentTarget.nextSibling.style.display='flex'; }}
          />
          <span className="home-logo-fallback" style={{ display:'none' }}>
            <span className="home-logo-bolt">⚡</span>
            <span className="home-logo-text">PESO TRACKER</span>
          </span>
        </div>
        <div className="home-bell">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span className="home-bell-dot" />
        </div>
      </div>

      {/* GREETING */}
      <div className="home-greeting">
        <div className="home-greeting-text">
          <span style={{ color: '#fff', fontWeight: 700 }}>Ciao, </span>
          <span style={{ color: '#00FF41', fontWeight: 900 }}>{profile.nome}</span>
        </div>
        <div className="home-greeting-sub">Ecco il tuo stato attuale</div>
      </div>

      {/* DUE CARD: PESO ATTUALE + OBIETTIVO */}
      <div className="home-two-col">
        <div className="card-neon">
          <div className="card-label">PESO ATTUALE</div>
          <div className="card-big-num">{kg.toFixed(1)}<span className="card-unit"> kg</span></div>
          {delta !== null ? (
            <div className="card-delta" style={{ color: +delta > 0 ? '#FF4444' : '#00FF41' }}>
              {+delta > 0 ? `▲ +${delta}` : `▼ ${delta}`} kg {deltaLabel}
            </div>
          ) : (
            <div className="card-delta" style={{ color: 'rgba(255,255,255,0.3)' }}>Prima misurazione</div>
          )}
        </div>
        <div className="card-neon">
          <div className="card-label">OBIETTIVO</div>
          <div className="card-big-num">{(+profile.obiettivo_kg).toFixed(1)}<span className="card-unit"> kg</span></div>
          <div style={{ fontSize: '1.2rem', marginTop: 4, marginBottom: 2 }}>🎯</div>
          <div className="card-delta" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {+missing > 0 ? `-${missing} kg mancanti` : '🏆 Raggiunto!'}
          </div>
        </div>
      </div>

      {/* DUE CARD: BMI + PROGRESSO */}
      <div className="home-two-col home-two-col-asym">
        <div className="card-neon card-bmi">
          <div className="card-label">BMI</div>
          <div className="card-big-num" style={{ fontSize: '2.2rem' }}>{bmiVal}</div>
          <div style={{ color: bmi.color, fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginTop: 4 }}>
            {bmi.lbl}
          </div>
          <div className="bmi-figure">
            <svg width="36" height="60" viewBox="0 0 36 60" fill="none">
              <circle cx="18" cy="8" r="7" stroke="rgba(0,255,65,0.5)" strokeWidth="1.5"/>
              <line x1="18" y1="15" x2="18" y2="38" stroke="rgba(0,255,65,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="18" y1="22" x2="6" y2="32" stroke="rgba(0,255,65,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="18" y1="22" x2="30" y2="32" stroke="rgba(0,255,65,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="18" y1="38" x2="10" y2="55" stroke="rgba(0,255,65,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="18" y1="38" x2="26" y2="55" stroke="rgba(0,255,65,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
        <div className="card-neon card-progress">
          <div className="card-label">PROGRESSO</div>
          <div className="card-big-num" style={{ color: '#00FF41', fontSize: '2.4rem' }}>{pct}%</div>
          <div className="prog-bar-wrap">
            <div className="prog-bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginTop: 6, lineHeight: 1.6 }}>
            Persi {persiTot} kg<br />
            Mancano {+missing > 0 ? missing : 0} kg
          </div>
        </div>
      </div>

      {/* GRAFICO */}
      <div className="card-neon home-chart-card">
        <div className="chart-header-row">
          <span className="card-label" style={{ marginBottom: 0 }}>ANDAMENTO PESO</span>
          <div className="chart-days-btns">
            {[7, 14, 30].map(d => (
              <button
                key={d}
                className={`chart-days-btn ${chartDays === d ? 'chart-days-btn-on' : ''}`}
                onClick={() => setChartDays(d)}
              >
                {d} GG
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <WeightChart measurements={chartData} goalWeight={profile.obiettivo_kg} />
        </div>
      </div>

      {/* 4 MINI CARD */}
      <div className="mini-cards-grid">
        <div className="mini-card">
          <div className="mini-card-icon">📉</div>
          <div className="mini-card-val" style={{ color: done > 0 ? '#00FF41' : '#FF4444' }}>
            {done > 0 ? `-${persiTot}` : `+${Math.abs(done).toFixed(1)}`}
          </div>
          <div className="mini-card-lbl">Kg persi</div>
        </div>
        <div className="mini-card">
          <div className="mini-card-icon">📅</div>
          <div className="mini-card-val">{giorni}</div>
          <div className="mini-card-lbl">Giorni</div>
        </div>
        <div className="mini-card">
          <div className="mini-card-icon">📊</div>
          <div className="mini-card-val">{medio}</div>
          <div className="mini-card-lbl">Media kg</div>
        </div>
        <div className="mini-card">
          <div className="mini-card-icon">⚡</div>
          <div className="mini-card-val">{mediaGg}</div>
          <div className="mini-card-lbl">Kg/giorno</div>
        </div>
      </div>

      {/* ULTIME MISURAZIONI */}
      <div className="section-block">
        <div className="section-title">ULTIME MISURAZIONI</div>
        {measurements.length === 0 ? (
          <div className="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(0,255,65,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 10 }}>
              <path d="M3 3h18v18H3z"/><path d="M3 9h18M9 21V9"/>
            </svg>
            <p className="empty-txt">Nessuna misurazione. Premi + per aggiungerne una!</p>
          </div>
        ) : (
          <div className="meas-list">
            {ultimeMis.map((m, i) => {
              const next = ultimeMis[i + 1];
              const d = next ? (+m.weight - +next.weight).toFixed(1) : null;
              return (
                <div className="meas-row" key={m.id}>
                  <div className="meas-row-left">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(0,255,65,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span className="meas-date">{fmtDateShort(m.date)}</span>
                  </div>
                  <div className="meas-row-right">
                    {d !== null && (
                      <span className="meas-diff" style={{ color: +d > 0 ? '#FF4444' : '#00FF41' }}>
                        {+d > 0 ? `+${d}` : d} kg
                      </span>
                    )}
                    <span className="meas-weight">{m.weight} kg</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
