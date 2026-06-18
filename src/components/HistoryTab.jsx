import React, { useState } from 'react';
import AdvancedChart from './AdvancedChart';

const BODY_LABELS = { vita: 'Vita', fianchi: 'Fianchi', petto: 'Petto', braccia: 'Braccia' };

const fmtDate = d =>
  new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });

const fmtDateShort = d =>
  new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: '2-digit' });

function DeltaBadge({ a, b, unit = 'cm' }) {
  if (a == null || b == null) return <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>;
  const diff = (b - a).toFixed(1);
  const color = +diff < 0 ? '#00FF41' : +diff > 0 ? '#FF4444' : 'rgba(255,255,255,0.4)';
  const sign = +diff > 0 ? '+' : '';
  return <span style={{ color, fontWeight: 700, fontSize: '0.75rem' }}>{sign}{diff} {unit}</span>;
}

export default function HistoryTab({ measurements, goalWeight, altezza = 0, bodyMeasurements = [], bodyPhotos = [], onDeleteMeasurement }) {
  const [bodyKey, setBodyKey] = useState('vita');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [showChartOptions, setShowChartOptions] = useState({ avg: true, trend: true });

  // Photo compare state
  const [photoCompareMode, setPhotoCompareMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [photoCompareOpen, setPhotoCompareOpen] = useState(false);

  // Measurement compare state
  const [measCompareMode, setMeasCompareMode] = useState(false);
  const [selectedMeasDates, setSelectedMeasDates] = useState([]);

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

  const bmiHistory = altezza > 0
    ? measurements.map(m => ({ date: m.date, value: +(+m.weight / ((altezza / 100) ** 2)).toFixed(1) }))
    : [];

  const bodyChartData = bodyMeasurements
    .filter(b => b[bodyKey] != null)
    .map(b => ({ date: b.date, value: +b[bodyKey] }));

  // Photo compare helpers
  const togglePhotoSelect = (photo) => {
    setSelectedPhotos(prev => {
      const idx = prev.findIndex(p => p.id === photo.id);
      if (idx >= 0) return prev.filter(p => p.id !== photo.id);
      if (prev.length >= 2) return prev;
      return [...prev, photo];
    });
  };

  const exitPhotoCompare = () => {
    setPhotoCompareMode(false);
    setSelectedPhotos([]);
    setPhotoCompareOpen(false);
  };

  // Measurement compare helpers
  const sortedBodyMeas = [...bodyMeasurements].sort((a, b) => new Date(b.date) - new Date(a.date));
  const toggleMeasDate = (entry) => {
    setSelectedMeasDates(prev => {
      const idx = prev.findIndex(e => e.id === entry.id);
      if (idx >= 0) return prev.filter(e => e.id !== entry.id);
      if (prev.length >= 2) return prev;
      return [...prev, entry];
    });
  };

  const measA = selectedMeasDates[0];
  const measB = selectedMeasDates[1];

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

      {/* BMI HISTORY */}
      {bmiHistory.length >= 2 && (
        <div className="card-neon" style={{ marginBottom: 12 }}>
          <div className="card-label" style={{ marginBottom: 12 }}>ANDAMENTO BMI</div>
          <div style={{ position: 'relative', height: 90 }}>
            <svg width="100%" height="90" viewBox="0 0 300 90" preserveAspectRatio="none">
              {(() => {
                const vals = bmiHistory.map(b => b.value);
                const minV = Math.min(...vals, 18.5) - 1;
                const maxV = Math.max(...vals, 25) + 1;
                const range = maxV - minV;
                const toY = (v) => 82 - ((v - minV) / range) * 72;
                const toX = (i) => (i / (vals.length - 1)) * 300;

                // Zone bands
                const zoneNormTop = toY(25), zoneNormBot = toY(18.5);
                const points = vals.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
                const lastBmi = vals[vals.length - 1];
                const lineColor = lastBmi < 18.5 ? '#5352ED' : lastBmi < 25 ? '#00FF41' : lastBmi < 30 ? '#FFA502' : '#FF4444';

                return (
                  <>
                    {/* Normal zone band */}
                    <rect x="0" y={zoneNormTop} width="300" height={zoneNormBot - zoneNormTop} fill="rgba(0,255,65,0.06)" />
                    <line x1="0" y1={zoneNormTop} x2="300" y2={zoneNormTop} stroke="rgba(0,255,65,0.2)" strokeWidth="1" strokeDasharray="4,4" />
                    <line x1="0" y1={zoneNormBot} x2="300" y2={zoneNormBot} stroke="rgba(0,255,65,0.2)" strokeWidth="1" strokeDasharray="4,4" />
                    <polyline points={points} fill="none" stroke={lineColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    {vals.map((v, i) => (
                      <circle key={i} cx={toX(i)} cy={toY(v)} r="3" fill={lineColor} />
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>{fmtDateShort(bmiHistory[0].date)}</span>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>
              Zona verde = normopeso (18.5–25)
            </span>
            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>{fmtDateShort(bmiHistory[bmiHistory.length - 1].date)}</span>
          </div>
        </div>
      )}

      {/* MISURE CORPOREE */}
      {bodyMeasurements.length > 0 && (
        <div className="card-neon" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="card-label" style={{ marginBottom: 0 }}>MISURE CORPOREE</div>
            {bodyMeasurements.length >= 2 && (
              <button
                className={`chart-days-btn ${measCompareMode ? 'chart-days-btn-on' : ''}`}
                onClick={() => { setMeasCompareMode(v => !v); setSelectedMeasDates([]); }}
              >
                {measCompareMode ? 'Chiudi' : 'Confronta'}
              </button>
            )}
          </div>

          {/* Compare mode */}
          {measCompareMode ? (
            <div>
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>
                Seleziona 2 date da confrontare ({selectedMeasDates.length}/2)
              </p>
              <div className="compare-date-list">
                {sortedBodyMeas.map(entry => {
                  const sel = selectedMeasDates.findIndex(e => e.id === entry.id);
                  const selIdx = sel >= 0 ? sel + 1 : null;
                  const disabled = selectedMeasDates.length >= 2 && sel < 0;
                  return (
                    <button
                      key={entry.id}
                      className={`compare-date-btn ${selIdx ? 'compare-date-on' : ''} ${disabled ? 'compare-date-disabled' : ''}`}
                      onClick={() => !disabled && toggleMeasDate(entry)}
                    >
                      <span className="compare-date-num">{selIdx ?? '·'}</span>
                      <span>{fmtDateShort(entry.date)}</span>
                      <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>
                        {Object.entries(BODY_LABELS).filter(([k]) => entry[k] != null).map(([, l]) => l).join(' · ')}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Comparison result */}
              {measA && measB && (
                <div className="meas-compare-card">
                  <div className="meas-compare-header">
                    <span className="meas-compare-col meas-compare-a">{fmtDateShort(measA.date)}</span>
                    <span className="meas-compare-col-center">Δ</span>
                    <span className="meas-compare-col meas-compare-b">{fmtDateShort(measB.date)}</span>
                  </div>
                  {Object.entries(BODY_LABELS).map(([k, l]) => {
                    if (measA[k] == null && measB[k] == null) return null;
                    return (
                      <div key={k} className="meas-compare-row">
                        <span className="meas-compare-val">{measA[k] != null ? `${measA[k]} cm` : '—'}</span>
                        <span className="meas-compare-lbl">{l}</span>
                        <DeltaBadge a={measA[k]} b={measB[k]} />
                        <span className="meas-compare-val meas-compare-val-right">{measB[k] != null ? `${measB[k]} cm` : '—'}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <>
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

              {/* Mini chart */}
              {bodyChartData.length >= 2 && (
                <div style={{ position: 'relative', height: 100, marginBottom: 12 }}>
                  <svg width="100%" height="100" viewBox="0 0 300 100" preserveAspectRatio="none">
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
                      const isDown = vals[vals.length - 1] <= vals[0];
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
              )}

              {/* Latest chips */}
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
            </>
          )}
        </div>
      )}

      {/* FOTO CORPOREE */}
      {bodyPhotos.length > 0 && (
        <div className="section-block">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div className="section-title" style={{ marginBottom: 0 }}>FOTO CORPOREE</div>
            {bodyPhotos.length >= 2 && (
              <button
                className={`chart-days-btn ${photoCompareMode ? 'chart-days-btn-on' : ''}`}
                onClick={() => photoCompareMode ? exitPhotoCompare() : setPhotoCompareMode(true)}
              >
                {photoCompareMode ? 'Annulla' : 'Confronta'}
              </button>
            )}
          </div>

          {photoCompareMode && (
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>
              Seleziona 2 foto ({selectedPhotos.length}/2)
            </p>
          )}

          <div className="photo-grid">
            {bodyPhotos.map(p => {
              const selIdx = selectedPhotos.findIndex(s => s.id === p.id);
              const isSelected = selIdx >= 0;
              const disabled = photoCompareMode && selectedPhotos.length >= 2 && !isSelected;
              return (
                <div
                  key={p.id}
                  className={`photo-card ${isSelected ? 'photo-card-selected' : ''} ${disabled ? 'photo-card-disabled' : ''}`}
                  onClick={() => {
                    if (photoCompareMode) togglePhotoSelect(p);
                    else setLightbox(p);
                  }}
                >
                  <img src={p.photo_url} alt={fmtDateShort(p.date)} className="photo-thumb" />
                  <div className="photo-date">{fmtDateShort(p.date)}</div>
                  {isSelected && (
                    <div className="photo-sel-badge">{selIdx + 1}</div>
                  )}
                </div>
              );
            })}
          </div>

          {photoCompareMode && selectedPhotos.length === 2 && (
            <button
              className="btn-photo-compare"
              onClick={() => setPhotoCompareOpen(true)}
            >
              Confronta le 2 foto selezionate
            </button>
          )}
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
              const isConfirming = pendingDelete === m.id;
              return (
                <div className="meas-row" key={m.id} style={{ flexDirection: isConfirming ? 'column' : undefined, alignItems: isConfirming ? 'stretch' : undefined, gap: isConfirming ? 8 : undefined }}>
                  {isConfirming ? (
                    <>
                      <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>
                        Elimina la misurazione del <strong style={{ color: '#fff' }}>{fmtDate(m.date)}</strong> ({m.weight} kg)?
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn-outline" style={{ flex: 1, padding: '6px 0', fontSize: '0.78rem' }} onClick={() => setPendingDelete(null)}>Annulla</button>
                        <button className="btn-g" style={{ flex: 1, padding: '6px 0', fontSize: '0.78rem', background: 'linear-gradient(135deg,#FF4444,#cc0000)' }} onClick={() => { onDeleteMeasurement(m.id); setPendingDelete(null); }}>Elimina</button>
                      </div>
                    </>
                  ) : (
                    <>
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
                        {onDeleteMeasurement && (
                          <button
                            onClick={() => setPendingDelete(m.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', color: 'rgba(255,68,68,0.5)', lineHeight: 1 }}
                            title="Elimina"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </>
                  )}
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

      {/* PHOTO COMPARE OVERLAY */}
      {photoCompareOpen && selectedPhotos.length === 2 && (() => {
        const [photoA, photoB] = selectedPhotos[0].date <= selectedPhotos[1].date
          ? [selectedPhotos[0], selectedPhotos[1]]
          : [selectedPhotos[1], selectedPhotos[0]];
        return (
          <div className="overlay" style={{ zIndex: 200, alignItems: 'stretch', padding: 0 }} onClick={() => setPhotoCompareOpen(false)}>
            <div className="photo-compare-screen" onClick={e => e.stopPropagation()}>
              <div className="photo-compare-header">
                <span className="photo-compare-title">CONFRONTO FOTO</span>
                <button className="guide-close-btn" onClick={() => setPhotoCompareOpen(false)}>✕</button>
              </div>
              <div className="photo-compare-grid">
                {[photoA, photoB].map((p, i) => (
                  <div key={p.id} className="photo-compare-col">
                    <div className={`photo-compare-label photo-compare-label-${i + 1}`}>
                      {i === 0 ? 'PRIMA' : 'DOPO'}
                    </div>
                    <img src={p.photo_url} alt="" className="photo-compare-img" />
                    <div className="photo-compare-date">{fmtDate(p.date)}</div>
                  </div>
                ))}
              </div>
              <button className="btn-outline" style={{ margin: '0 20px 24px' }} onClick={() => setPhotoCompareOpen(false)}>
                Chiudi
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
