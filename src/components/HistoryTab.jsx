import React from 'react';
import WeightChart from './WeightChart';

export default function HistoryTab({ measurements, goalWeight }) {
  const rev = [...measurements].reverse();

  const kgPersi = measurements.length > 1
    ? (+measurements[0].weight - +measurements.at(-1).weight).toFixed(1)
    : 0;

  const giorni = measurements.length > 1
    ? Math.round((new Date(measurements.at(-1).date) - new Date(measurements[0].date)) / 86400000)
    : 0;

  const medio = measurements.length
    ? (measurements.reduce((s, m) => s + +m.weight, 0) / measurements.length).toFixed(1)
    : 0;

  const mediaGg = giorni > 0 ? (Math.abs(kgPersi) / giorni).toFixed(3) : 0;

  return (
    <div className="pg">
      {/* HEADER */}
      <div className="page-header">
        <div className="page-title-row">
          <h2 className="page-title">STORICO</h2>
          <span className="page-badge">{measurements.length}</span>
        </div>
        <p className="page-subtitle">Tutte le tue misurazioni</p>
      </div>

      {/* GRAFICO */}
      <div className="card-neon" style={{ marginBottom: 12 }}>
        <div className="card-label" style={{ marginBottom: 14 }}>GRAFICO PESO</div>
        <WeightChart measurements={measurements} goalWeight={goalWeight} />
      </div>

      {/* 4 STAT */}
      {measurements.length > 0 && (
        <div className="stat-grid4">
          <div className="stat-box">
            <div className="stat-val" style={{ color: +kgPersi >= 0 ? '#00FF41' : '#FF4444' }}>
              {+kgPersi >= 0 ? `-${kgPersi}` : `+${Math.abs(kgPersi)}`} kg
            </div>
            <div className="stat-lbl">Peso perso</div>
          </div>
          <div className="stat-box">
            <div className="stat-val">{giorni}</div>
            <div className="stat-lbl">Giorni tracking</div>
          </div>
          <div className="stat-box">
            <div className="stat-val">{medio} kg</div>
            <div className="stat-lbl">Peso medio</div>
          </div>
          <div className="stat-box">
            <div className="stat-val">{mediaGg} kg</div>
            <div className="stat-lbl">Media/giorno</div>
          </div>
        </div>
      )}

      {/* LISTA COMPLETA */}
      <div className="section-block">
        <div className="section-title">TUTTE LE MISURAZIONI</div>
        {measurements.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(0,255,65,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}>
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <p className="empty-txt">Nessuna misurazione ancora.<br />Premi + per aggiungerne una!</p>
          </div>
        ) : (
          <div className="meas-list">
            {rev.map((m, i) => {
              const p = rev[i + 1];
              const d = p ? (+m.weight - +p.weight).toFixed(1) : null;
              return (
                <div className="meas-row" key={m.id}>
                  <div className="meas-row-left">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(0,255,65,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span className="meas-date">
                      {new Date(m.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
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
