import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, LineElement, PointElement, LinearScale,
  CategoryScale, Filler, Tooltip,
} from 'chart.js';
import { BMI_INFO } from '../utils';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

/* ── helpers ── */
function calcStreak(measurements) {
  if (!measurements.length) return 0;
  const sorted = [...measurements].sort((a, b) => new Date(b.date) - new Date(a.date));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let streak = 0;
  let cursor = new Date(today);
  const set = new Set(sorted.map(m => { const d = new Date(m.date); d.setHours(0,0,0,0); return d.toDateString(); }));
  for (let i = 0; i < 3650; i++) {
    if (set.has(cursor.toDateString())) { streak++; cursor.setDate(cursor.getDate()-1); }
    else if (i === 0) cursor.setDate(cursor.getDate()-1);
    else break;
  }
  return streak;
}

function stdDev(arr) {
  if (arr.length < 2) return 0;
  const m = arr.reduce((a,b) => a+b, 0) / arr.length;
  return Math.sqrt(arr.reduce((s,x) => s+(x-m)**2, 0) / arr.length).toFixed(2);
}

/* ── badges definition ── */
const BADGES = [
  // Inizio
  { id: 'first',   label: 'Prima Misura',  icon: '🌱', desc: 'Hai iniziato il percorso',     check: (m) => m.length >= 1 },
  { id: 'meas5',   label: '5 Misurazioni', icon: '📋', desc: '5 rilevazioni completate',     check: (m) => m.length >= 5 },
  { id: 'meas10',  label: '10 Misure',     icon: '📊', desc: '10 rilevazioni completate',    check: (m) => m.length >= 10 },
  { id: 'meas25',  label: '25 Misure',     icon: '📈', desc: '25 rilevazioni completate',    check: (m) => m.length >= 25 },
  { id: 'meas50',  label: '50 Misure',     icon: '🗂️',  desc: '50 rilevazioni completate',    check: (m) => m.length >= 50 },
  { id: 'meas100', label: '100 Misure',    icon: '💯', desc: 'Cento misurazioni!',           check: (m) => m.length >= 100 },
  // Streak — check receives (measurements, profile, kg, streak) to avoid recomputing
  { id: 'str3',    label: '3 Giorni',      icon: '🔥', desc: '3 giorni consecutivi',         check: (m, p, kg, s) => s >= 3 },
  { id: 'str7',    label: '7 Giorni',      icon: '📅', desc: 'Una settimana di tracking',    check: (m, p, kg, s) => s >= 7 },
  { id: 'str14',   label: '2 Settimane',   icon: '🗓️',  desc: '14 giorni consecutivi',        check: (m, p, kg, s) => s >= 14 },
  { id: 'str30',   label: '1 Mese',        icon: '🌙', desc: '30 giorni di costanza',        check: (m, p, kg, s) => s >= 30 },
  { id: 'str60',   label: '2 Mesi',        icon: '⭐', desc: '60 giorni consecutivi',        check: (m, p, kg, s) => s >= 60 },
  { id: 'str100',  label: '100 Giorni',    icon: '💫', desc: 'Cento giorni di streak!',      check: (m, p, kg, s) => s >= 100 },
  // Peso perso
  { id: 'kg1',     label: '-1 kg',         icon: '✅', desc: 'Primo kg perso!',              check: (m, p, kg) => +p.peso_iniziale - kg >= 1 },
  { id: 'kg3',     label: '-3 kg',         icon: '💪', desc: 'Persi 3 kg in totale',         check: (m, p, kg) => +p.peso_iniziale - kg >= 3 },
  { id: 'kg5',     label: '-5 kg',         icon: '🥉', desc: 'Persi 5 kg in totale',         check: (m, p, kg) => +p.peso_iniziale - kg >= 5 },
  { id: 'kg10',    label: '-10 kg',        icon: '🥈', desc: 'Persi 10 kg in totale',        check: (m, p, kg) => +p.peso_iniziale - kg >= 10 },
  { id: 'kg15',    label: '-15 kg',        icon: '🥇', desc: 'Persi 15 kg in totale',        check: (m, p, kg) => +p.peso_iniziale - kg >= 15 },
  { id: 'kg20',    label: '-20 kg',        icon: '🏅', desc: 'Persi 20 kg in totale',        check: (m, p, kg) => +p.peso_iniziale - kg >= 20 },
  { id: 'kg25',    label: '-25 kg',        icon: '🎖️',  desc: 'Persi 25 kg in totale',        check: (m, p, kg) => +p.peso_iniziale - kg >= 25 },
  // Obiettivo %
  { id: 'pct25',   label: '25% Goal',      icon: '🚀', desc: 'Un quarto del percorso fatto', check: (m, p, kg) => { const d=+p.peso_iniziale - +p.obiettivo_kg; return d>0 && (+p.peso_iniziale-kg)/d>=0.25; } },
  { id: 'half',    label: 'Metà Strada',   icon: '⚡', desc: '50% obiettivo raggiunto',      check: (m, p, kg) => { const d=+p.peso_iniziale - +p.obiettivo_kg; return d>0 && (+p.peso_iniziale-kg)/d>=0.5; } },
  { id: 'pct75',   label: '75% Goal',      icon: '🔥', desc: 'Quasi al traguardo!',          check: (m, p, kg) => { const d=+p.peso_iniziale - +p.obiettivo_kg; return d>0 && (+p.peso_iniziale-kg)/d>=0.75; } },
  { id: 'goal',    label: 'OBIETTIVO!',    icon: '🏆', desc: 'Peso obiettivo raggiunto',     check: (m, p, kg) => kg <= +p.obiettivo_kg },
  // BMI
  { id: 'bmi_norm',label: 'BMI Normale',   icon: '💚', desc: 'BMI nel range 18.5–24.9',      check: (m, p, kg) => { const b=kg/((+p.altezza/100)**2); return b>=18.5&&b<25; } },
  { id: 'bmi_fit', label: 'BMI Ottimale',  icon: '💎', desc: 'BMI nel range 20–22',          check: (m, p, kg) => { const b=kg/((+p.altezza/100)**2); return b>=20&&b<22; } },
  // Velocità
  { id: 'fast',    label: 'Velocista',     icon: '⚡', desc: '>0.5 kg/settimana persi',      check: (m) => {
    if (m.length < 2) return false;
    const g = Math.round((new Date(m.at(-1).date)-new Date(m[0].date))/86400000);
    return g >= 7 && (Math.abs(+m[0].weight - +m.at(-1).weight)/g)*7 >= 0.5;
  }},
];

function motivationalMsg(pct, streak) {
  if (pct >= 100) return { text: 'Obiettivo raggiunto! Sei straordinario!', icon: '🏆' };
  if (pct >= 75)  return { text: 'Quasi al traguardo! Continua così!',      icon: '🔥' };
  if (pct >= 50)  return { text: 'A metà strada! Non mollare!',             icon: '💪' };
  if (pct >= 25)  return { text: 'Ottimo inizio! Stai andando alla grande!',icon: '🚀' };
  if (streak >= 7) return { text: 'Streak fantastica! La costanza è la chiave!', icon: '⚡' };
  return { text: 'Ogni passo conta. Inizia oggi!', icon: '🌱' };
}

const fmtShort = d => new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });

/* ── BMI chart ── */
function BmiChart({ measurements, altezza }) {
  if (measurements.length < 2) return (
    <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem', padding: '24px 0' }}>
      Aggiungi almeno 2 misurazioni per vedere il grafico BMI
    </div>
  );
  const slice = measurements.slice(-20);
  const labels = slice.map(m => fmtShort(m.date));
  const bmiData = slice.map(m => +(+m.weight / ((altezza/100)**2)).toFixed(2));

  const data = {
    labels,
    datasets: [{
      data: bmiData,
      borderColor: '#5352ED',
      backgroundColor: 'rgba(83,82,237,0.12)',
      pointBackgroundColor: '#5352ED',
      pointRadius: 4,
      tension: 0.4,
      fill: true,
    }],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: {
      callbacks: { label: ctx => ` BMI ${ctx.parsed.y}` },
      backgroundColor: '#111',
      bodyColor: '#fff',
      borderColor: 'rgba(83,82,237,0.4)',
      borderWidth: 1,
    }},
    scales: {
      x: { ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 9 }, maxTicksLimit: 6 }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: {
        ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 9 } },
        grid: { color: 'rgba(255,255,255,0.04)' },
        min: Math.max(10, Math.min(...bmiData) - 1),
      },
    },
  };
  return <div style={{ height: 140 }}><Line data={data} options={options} /></div>;
}

/* ── main ── */
export default function GoalsTab({ profile, measurements }) {
  const [activeSection, setActiveSection] = useState('stats');

  const kg = measurements.length ? +measurements.at(-1).weight : +profile.peso_iniziale;

  const diff = +profile.peso_iniziale - +profile.obiettivo_kg;
  const done = +profile.peso_iniziale - kg;
  const pct  = diff > 0 ? Math.min(100, Math.max(0, (done / diff) * 100)) : 0;

  const giorni = measurements.length > 1
    ? Math.round((new Date(measurements.at(-1).date) - new Date(measurements[0].date)) / 86400000)
    : 0;
  const mediaGgKg = giorni > 0 ? Math.abs(done) / giorni : 0;
  const kgMancanti = kg - +profile.obiettivo_kg;

  let dataObiettivo = null;
  if (mediaGgKg > 0 && kgMancanti > 0) {
    const giorniMancanti = Math.ceil(kgMancanti / mediaGgKg);
    const d = new Date();
    d.setDate(d.getDate() + giorniMancanti);
    dataObiettivo = d.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  const streak = useMemo(() => calcStreak(measurements), [measurements]);
  const minWeight = measurements.length ? Math.min(...measurements.map(m => +m.weight)).toFixed(1) : null;
  const minWeightDate = measurements.length
    ? measurements.reduce((best, m) => +m.weight < +best.weight ? m : best).date
    : null;
  const maxWeightLostWeek = useMemo(() => {
    if (measurements.length < 2) return null;
    let max = 0;
    for (let i = 1; i < measurements.length; i++) {
      const diffDays = Math.round((new Date(measurements[i].date) - new Date(measurements[i-1].date)) / 86400000);
      if (diffDays > 0 && diffDays <= 7) {
        const loss = +measurements[i-1].weight - +measurements[i].weight;
        if (loss > max) max = loss;
      }
    }
    return max > 0 ? max.toFixed(1) : null;
  }, [measurements]);

  const last7  = measurements.slice(-7).map(m => +m.weight);
  const prev7  = measurements.slice(-14, -7).map(m => +m.weight);
  const avg7   = last7.length  ? (last7.reduce((a,b)=>a+b,0)/last7.length).toFixed(2) : null;
  const avgP7  = prev7.length  ? (prev7.reduce((a,b)=>a+b,0)/prev7.length).toFixed(2) : null;
  const tendenza = avg7 && avgP7 ? (avg7 - avgP7).toFixed(2) : null;
  const velocita = mediaGgKg > 0 ? (mediaGgKg * 7).toFixed(2) : null;
  const dev = measurements.length > 1 ? stdDev(measurements.map(m => +m.weight)) : null;

  // Weekly avg comparison (current vs prev week)
  const avgW = measurements.length > 0 ? (measurements.reduce((s,m)=>s+ +m.weight,0)/measurements.length).toFixed(1) : null;

  const msg = motivationalMsg(pct, streak);

  // Badges
  const earnedBadges = BADGES.filter(b => b.check(measurements, profile, kg, streak));
  const lockedBadges = BADGES.filter(b => !b.check(measurements, profile, kg, streak));

  const bmiVal = (kg / ((+profile.altezza/100)**2)).toFixed(1);
  const bmiInfo = BMI_INFO(+bmiVal);

  return (
    <div className="pg">
      {/* HEADER */}
      <div className="page-header">
        <div className="page-title-row">
          <h2 className="page-title">OBIETTIVI</h2>
          <span className="page-badge">{earnedBadges.length}/{BADGES.length}</span>
        </div>
        <p className="page-subtitle">Analisi avanzata e traguardi</p>
      </div>

      {/* MOTIVATIONAL */}
      <div className="card-neon motive-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: '1.6rem' }}>{msg.icon}</span>
          <div className="motive-text">{msg.text}</div>
        </div>
        <div className="prog-bar-wrap">
          <div className="prog-bar-fill" style={{ width: `${pct.toFixed(0)}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>{profile.peso_iniziale} kg</span>
          <span style={{ fontSize: '0.65rem', color: '#00FF41', fontWeight: 700 }}>{pct.toFixed(0)}% completato</span>
          <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>{profile.obiettivo_kg} kg</span>
        </div>
      </div>

      {/* SECTION TOGGLE */}
      <div className="goals-toggle">
        {['stats', 'bmi', 'badge'].map(s => (
          <button
            key={s}
            className={`goals-toggle-btn ${activeSection === s ? 'goals-toggle-on' : ''}`}
            onClick={() => setActiveSection(s)}
          >
            {s === 'stats' ? 'STATISTICHE' : s === 'bmi' ? 'BMI' : 'BADGE'}
          </button>
        ))}
      </div>

      {/* ── STATISTICHE ── */}
      {activeSection === 'stats' && (
        <>
          {/* Data obiettivo + streak in row */}
          <div className="home-two-col">
            <div className="card-neon goals-card">
              <div className="card-label">TRAGUARDO PREVISTO</div>
              {dataObiettivo ? (
                <>
                  <div className="goals-big-val" style={{ fontSize: '0.95rem', lineHeight: 1.3 }}>{dataObiettivo}</div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
                    -{mediaGgKg.toFixed(3)} kg/gg
                  </div>
                </>
              ) : kgMancanti <= 0 ? (
                <div className="goals-big-val" style={{ fontSize: '1.2rem' }}>🏆 Raggiunto!</div>
              ) : (
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>Aggiungi misurazioni</div>
              )}
            </div>
            <div className="card-neon goals-card">
              <div className="card-label">STREAK 🔥</div>
              <div className="goals-big-val">{streak}</div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>giorni consecutivi</div>
            </div>
          </div>

          {/* 4-stat grid */}
          <div className="stat-grid4">
            <div className="stat-box">
              <div className="stat-val" style={{ color: '#00FF41' }}>{minWeight ? `${minWeight}` : '—'}</div>
              <div className="stat-lbl">Record kg</div>
            </div>
            <div className="stat-box">
              <div className="stat-val">{velocita ?? '—'}</div>
              <div className="stat-lbl">kg/settimana</div>
            </div>
            <div className="stat-box">
              <div className="stat-val">{avgW ?? '—'}</div>
              <div className="stat-lbl">Media storica</div>
            </div>
            <div className="stat-box">
              <div className="stat-val" style={{ color: dev && +dev < 1 ? '#00FF41' : '#FFA502' }}>{dev ?? '—'}</div>
              <div className="stat-lbl">Deviazione σ</div>
            </div>
          </div>

          {/* Record personali */}
          {minWeight && (
            <div className="card-neon goals-card">
              <div className="card-label" style={{ marginBottom: 12 }}>🏅 RECORD PERSONALI</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1, background: 'rgba(0,255,65,0.06)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#00FF41' }}>{minWeight} kg</div>
                  <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Peso minimo</div>
                  {minWeightDate && <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{fmtShort(minWeightDate)}</div>}
                </div>
                {maxWeightLostWeek && (
                  <div style={{ flex: 1, background: 'rgba(0,255,65,0.06)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#00FF41' }}>-{maxWeightLostWeek} kg</div>
                    <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Miglior settimana</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tendenza settimanale */}
          <div className="card-neon goals-card">
            <div className="card-label">CONFRONTO SETTIMANALE</div>
            {tendenza !== null ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10 }}>
                <div style={{ fontSize: '2rem' }}>{+tendenza > 0 ? '📈' : '📉'}</div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: +tendenza > 0 ? '#FF4444' : '#00FF41' }}>
                    {+tendenza > 0 ? `+${tendenza}` : tendenza} kg
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                    Ultimi 7 gg: {avg7} kg — Precedenti: {avgP7} kg
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>
                Servono almeno 14 misurazioni
              </div>
            )}
          </div>
        </>
      )}

      {/* ── BMI ── */}
      {activeSection === 'bmi' && (
        <>
          <div className="home-two-col">
            <div className="card-neon goals-card">
              <div className="card-label">BMI ATTUALE</div>
              <div className="goals-big-val" style={{ color: bmiInfo.color }}>{bmiVal}</div>
              <div style={{ fontSize: '0.65rem', color: bmiInfo.color, marginTop: 4, fontWeight: 700 }}>
                {bmiInfo.lbl}
              </div>
            </div>
            <div className="card-neon goals-card">
              <div className="card-label">BMI OBIETTIVO</div>
              <div className="goals-big-val" style={{ color: '#00FF41' }}>
                {(+profile.obiettivo_kg / ((+profile.altezza/100)**2)).toFixed(1)}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
                al peso obiettivo
              </div>
            </div>
          </div>

          {/* BMI scale */}
          <div className="card-neon goals-card">
            <div className="card-label" style={{ marginBottom: 12 }}>SCALA BMI</div>
            <div className="bmi-scale">
              {[
                { lbl: 'Sotto', range: '< 18.5', color: '#5352ED', from: 0, to: 22 },
                { lbl: 'Normo', range: '18.5–24.9', color: '#00FF41', from: 22, to: 50 },
                { lbl: 'Sovra', range: '25–29.9', color: '#FFA502', from: 50, to: 75 },
                { lbl: 'Obeso', range: '≥ 30', color: '#FF4444', from: 75, to: 100 },
              ].map(s => (
                <div key={s.lbl} className="bmi-scale-seg" style={{ flex: 1 }}>
                  <div className="bmi-scale-bar" style={{ background: s.color, opacity: 0.7 }} />
                  <div style={{ fontSize: '0.55rem', color: s.color, marginTop: 4, fontWeight: 700 }}>{s.lbl}</div>
                  <div style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.3)' }}>{s.range}</div>
                </div>
              ))}
            </div>
            {/* BMI pointer */}
            <div style={{ position: 'relative', height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 4, marginTop: 8 }}>
              <div style={{
                position: 'absolute',
                left: `${Math.min(98, Math.max(2, (+bmiVal - 12) / 28 * 100))}%`,
                top: -3,
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#fff',
                boxShadow: '0 0 8px rgba(255,255,255,0.6)',
                transform: 'translateX(-50%)',
                transition: '0.5s',
              }} />
            </div>
            <div style={{ textAlign: 'center', marginTop: 6, fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>
              Il tuo BMI: <strong style={{ color: '#fff' }}>{bmiVal}</strong>
            </div>
          </div>

          {/* BMI chart over time */}
          <div className="card-neon goals-card">
            <div className="card-label" style={{ marginBottom: 12 }}>BMI NEL TEMPO</div>
            <BmiChart measurements={measurements} altezza={+profile.altezza} />
          </div>
        </>
      )}

      {/* ── BADGE ── */}
      {activeSection === 'badge' && (
        <>
          {earnedBadges.length > 0 && (
            <div className="section-block">
              <div className="section-title">CONQUISTATI ({earnedBadges.length})</div>
              <div className="badge-grid">
                {earnedBadges.map(b => (
                  <div key={b.id} className="badge-card badge-earned">
                    <div className="badge-icon">{b.icon}</div>
                    <div className="badge-label">{b.label}</div>
                    <div className="badge-desc">{b.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lockedBadges.length > 0 && (
            <div className="section-block">
              <div className="section-title">DA SBLOCCARE ({lockedBadges.length})</div>
              <div className="badge-grid">
                {lockedBadges.map(b => (
                  <div key={b.id} className="badge-card badge-locked">
                    <div className="badge-icon" style={{ filter: 'grayscale(1)', opacity: 0.3 }}>{b.icon}</div>
                    <div className="badge-label" style={{ opacity: 0.3 }}>{b.label}</div>
                    <div className="badge-desc" style={{ opacity: 0.25 }}>{b.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
