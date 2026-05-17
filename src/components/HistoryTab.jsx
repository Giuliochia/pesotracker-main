import React, { useState } from 'react';
import AdvancedChart from './AdvancedChart';

const BODY_LABELS = { vita: 'Vita', fianchi: 'Fianchi', petto: 'Petto', braccia: 'Braccia' };

const fmtDate = d =>
  new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });

const fmtDateShort = d =>
  new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: '2-digit' });

export default function HistoryTab({ measurements, goalWeight, bodyMeasurements = [], bodyPhotos = [] }) {
  const [bodyKey, setBodyKey] = useState('vita');
  const [lightbox, setLightbox] = useState(null);
  const [showChartOptions, setShowChartOptions] = useState({ avg: true, trend: true });

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

  // Body measurements chart data for selected key
  const bodyChartData = bodyMeasurements
    .filter(b => b[bodyKey] != null)
    .map(b => ({ date: b.date, value: +b[bodyKey] }));

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

      {/* GRAFICO AVANZATO */}
      <div className="card-neon" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div className="card-label" style={{ marginBottom: 0 }}>GRAFICO PESO</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className={`chart-days-btn ${showChartOptions.avg ? 'chart-days-btn-on' : ''}`}
              onClick={() => setShowChartOptions(o => ({ ...o, avg: !o.avg }))}
            >
              Media
            </button>
            <button
              className={`chart-days-btn ${showChartOptions.trend ? 'chart-days-btn-on' : ''}`}
              onClick={() => setShowChartOptions(o => ({ ...o, trend: !o.trend }))}
            >
              Trend
            </button>
          </div>
        </div>
        <AdvancedChart
          measurements={measurements}
          goalWeight={goalWeight}
          showAvg={showChartOptions.avg}
          showTrend={showChartOptions.trend}
        />
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

      {/* MISURE CORPOREE */}
      {bodyMeasurements.length > 0 && (
        <div className="card-neon" style={{ marginBottom: 12 }}>
          <div className="card-label" style={{ marginBottom: 12 }}>MISURE CORPOREE</div>

          {/* Selector */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            {Object.entries(BODY_LABELS).map(([k, l]) => {
              const hasData = bodyMeasurements.some(b => b[k] != null);
              if (!hasData) return null;
              return (
                <button
                  key={k}
                  className={`chart-days-btn ${bodyKey === k ? 'chart-days-btn-on' : ''}`}
                  onClick={() => setBodyKey(k)}
                >
                  {l}
                </button>
              );
            })}
          </div>

          {/* Mini chart for selected body measurement */}
          {bodyChartData.length >= 2 ? (
            <div style={{ position: 'relative', height: 100, marginBottom: 12 }}>
              <svg width="100%" height="100" viewBox={`0 0 300 100`} preserveAspectRatio="none">
                {(() => {
                  const vals = bodyChartData.map(b => b.value);
                  const minV = Math.min(...vals) - 2;
                  const maxV = Math.max(...vals) + 2;
                  const range = maxV - minV || 1;
                  const points = vals.map((v, i) => {
                    const x = (i / (vals.length - 1)) * 300;
                    const y = 90 - ((v - minV) / range) * 80;
                    return `${x},${y}`;
                  }).join(' ');
                  const lastVal = vals[vals.length - 1];
                  const firstVal = vals[0];
                  const isDown = lastVal <= firstVal;
                  const lineColor = isDown ? '#00FF41' : '#FF4444';
                  return (
                    <>
                      <polyline points={points} fill="none" stroke={lineColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      {vals.map((v, i) => {
                        const x = (i / (vals.length - 1)) * 300;
                        const y = 90 - ((v - minV) / range) * 80;
                        return <circle key={i} cx={x} cy={y} r="3" fill={lineColor} />;
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>
          ) : null}

          {/* Latest values */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {Object.entries(BODY_LABELS).map(([k, l]) => {
              const latest = [...bodyMeasurements].reverse().find(b => b[k] != null);
              if (!latest) return null;
              return (
                <div key={k} className="body-meas-chip">
                  <div className="body-meas-chip-val">{latest[k]} cm</div>
                  <div className="body-meas-chip-lbl">{l}</div>
                </div>
              );
            })}
          </div>

          {/* List */}
          <div className="meas-list" style={{ marginTop: 12 }}>
            {[...bodyMeasurements].reverse().slice(0, 5).map(b => (
              <div className="meas-row" key={b.id}>
                <div className="meas-row-left">
                  <span className="meas-date">{fmtDateShort(b.date)}</span>
                </div>
                <div className="meas-row-right" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {Object.entries(BODY_LABELS).map(([k, l]) =>
                    b[k] != null ? (
                      <span key={k} style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>
                        {l}: <strong style={{ color: '#fff' }}>{b[k]}</strong>
                      </span>
                    ) : null
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FOTO CORPOREE */}
      {bodyPhotos.length > 0 && (
        <div className="section-block">
          <div className="section-title">FOTO CORPOREE</div>
          <div className="photo-grid">
            {bodyPhotos.map(p => (
              <div key={p.id} className="photo-card" onClick={() => setLightbox(p)}>
                <img src={p.photo_url} alt={fmtDateShort(p.date)} className="photo-thumb" />
                <div className="photo-date">{fmtDateShort(p.date)}</div>
              </div>
            ))}
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
                    <span className="meas-date">{fmtDate(m.date)}</span>
                  </div>
                  <div className="meas-row-right">
                    {d !== null && (
                      <span className="meas-diff" style={{ color: +d > 0 ? '#FF4444' : '#00FF41' }}>
                        {+d > 0 ? `+${d}` : d} kg
                      </span>
                    )}
                    <span className="meas-weight">{m.weight} kg</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* LIGHTBOX */}
      {lightbox && (
        <div className="overlay" onClick={() => setLightbox(null)} style={{ zIndex: 200 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }} onClick={e => e.stopPropagation()}>
            <img
              src={lightbox.photo_url}
              alt=""
              style={{ maxWidth: '90vw', maxHeight: '75vh', borderRadius: 12, objectFit: 'contain' }}
            />
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{fmtDate(lightbox.date)}</div>
            <button className="btn-outline" onClick={() => setLightbox(null)}>Chiudi</button>
          </div>
        </div>
      )}
    </div>
  );
}
