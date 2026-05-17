import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import WeightChart from './WeightChart';
import { supabase } from '../supabaseClient';
import GuideModal from './GuideModal';
import BellModal from './BellModal';

const BMI_INFO = b =>
  b < 18.5 ? { lbl: 'Sottopeso', color: '#5352ED' } :
  b < 25   ? { lbl: 'Normopeso', color: '#00FF41' } :
  b < 30   ? { lbl: 'Sovrappeso', color: '#FFA502' } :
             { lbl: 'Obesità',   color: '#FF4444' };

const fmtDateShort = d =>
  new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });

const isYesterday = (dateA, dateB) => {
  const a = new Date(dateA); a.setHours(0,0,0,0);
  const b = new Date(dateB); b.setHours(0,0,0,0);
  return Math.abs(a - b) <= 86400000 * 2;
};

function calcEta(dataNascita) {
  if (!dataNascita) return null;
  const oggi = new Date();
  const nasc = new Date(dataNascita);
  let eta = oggi.getFullYear() - nasc.getFullYear();
  const m = oggi.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && oggi.getDate() < nasc.getDate())) eta--;
  return eta;
}

function calcTDEE(peso, altezza, eta, sesso, attivita) {
  if (!eta || !sesso || !peso || !altezza) return null;
  const bmr = sesso === 'F'
    ? 10 * peso + 6.25 * altezza - 5 * eta - 161
    : 10 * peso + 6.25 * altezza - 5 * eta + 5;
  const mult = { sedentario: 1.2, leggero: 1.375, moderato: 1.55, attivo: 1.725, estremo: 1.9 };
  return Math.round(bmr * (mult[attivita] || 1.55));
}

const MEAL_ICONS = {
  'Colazione': '☀️',
  'Spuntino mattina': '🍎',
  'Spuntino': '🍎',
  'Pranzo': '🍽️',
  'Merenda': '🥜',
  'Spuntino pomeriggio': '🍊',
  'Cena': '🌙',
  'Totale': '⚡',
};
const DAY_SHORT = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

function parseDietPlan(plan) {
  const days = [];
  const tips = [];
  let currentDay = null;
  let inTips = false;
  plan.split('\n').forEach(line => {
    const t = line.trim();
    if (!t) return;
    if (t.startsWith('## Consigli')) {
      if (currentDay) { days.push(currentDay); currentDay = null; }
      inTips = true; return;
    }
    if (t.startsWith('## ')) {
      if (currentDay) days.push(currentDay);
      currentDay = { name: t.slice(3), meals: [] };
      inTips = false; return;
    }
    if (inTips && t.startsWith('- ')) { tips.push(t.slice(2)); return; }
    const m = t.match(/^\*\*(.+?):\*\*\s*(.+)$/);
    if (m && currentDay) currentDay.meals.push({ label: m[1], content: m[2] });
  });
  if (currentDay) days.push(currentDay);
  return { days, tips };
}

function BmiGauge({ bmiVal, color }) {
  const bmi = parseFloat(bmiVal);
  if (isNaN(bmi)) return null;
  const cx = 36, cy = 34, r = 26, thick = 7;
  const MIN = 15, MAX = 40;

  const toXY = (a) => ({
    x: cx + r * Math.cos(a),
    y: cy - r * Math.sin(a),
  });

  const seg = (a1, a2) => {
    const p1 = toXY(a1), p2 = toXY(a2);
    const large = Math.abs(a1 - a2) > Math.PI ? 1 : 0;
    return `M${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A${r} ${r} 0 ${large} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  };

  const ang = (b) => Math.PI * (1 - (Math.min(MAX, Math.max(MIN, b)) - MIN) / (MAX - MIN));
  const a185 = ang(18.5), a25 = ang(25), a30 = ang(30);
  const needle = toXY(ang(bmi));

  return (
    <svg width="72" height="44" viewBox="0 0 72 44" style={{ display: 'block', margin: '4px auto 0' }}>
      <path d={seg(Math.PI, 0)} stroke="rgba(255,255,255,0.06)" strokeWidth={thick} fill="none" />
      <path d={seg(Math.PI, a185)} stroke="#5352ED" strokeWidth={thick} fill="none" opacity="0.75" />
      <path d={seg(a185, a25)} stroke="#00FF41" strokeWidth={thick} fill="none" opacity="0.75" />
      <path d={seg(a25, a30)} stroke="#FFA502" strokeWidth={thick} fill="none" opacity="0.75" />
      <path d={seg(a30, 0)} stroke="#FF4444" strokeWidth={thick} fill="none" opacity="0.75" />
      <circle cx={needle.x.toFixed(2)} cy={needle.y.toFixed(2)} r="5" fill={color} stroke="#0d0d0d" strokeWidth="2" />
    </svg>
  );
}

function DietPlanView({ plan }) {
  const [dayIdx, setDayIdx] = React.useState(0);
  const { days, tips } = parseDietPlan(plan);

  if (!days.length) {
    return <div className="diet-plan-text" style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>{plan}</div>;
  }

  const day = days[Math.min(dayIdx, days.length - 1)];

  return (
    <div>
      {/* Day tabs */}
      <div className="diet-day-tabs">
        {days.map((d, i) => (
          <button
            key={i}
            type="button"
            className={`diet-day-tab ${dayIdx === i ? 'diet-day-tab-on' : ''}`}
            onClick={() => setDayIdx(i)}
          >
            {DAY_SHORT[i] || d.name.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Day name */}
      <div className="diet-day-name">{day.name}</div>

      {/* Meals */}
      {day.meals.map((meal, i) => {
        const isTotal = meal.label === 'Totale';
        return (
          <div key={i} className={`diet-meal-row${isTotal ? ' diet-meal-total' : ''}`}>
            <span className="diet-meal-icon">{MEAL_ICONS[meal.label] || (isTotal ? '⚡' : '•')}</span>
            <div className="diet-meal-content">
              <span className="diet-meal-label">{meal.label}</span>
              <span className="diet-meal-text">{meal.content}</span>
            </div>
          </div>
        );
      })}

      {/* Tips */}
      {tips.length > 0 && (
        <div className="diet-tips-box">
          <div className="diet-tips-title">💡 Consigli</div>
          {tips.map((tip, i) => (
            <div key={i} className="diet-tip-item">{tip}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HomeTab({ profile, measurements }) {
  const [chartDays, setChartDays] = useState(7);
  const [showGuide, setShowGuide] = useState(false);
  const [dietPlan, setDietPlan] = useState(null);
  const [loadingDiet, setLoadingDiet] = useState(false);
  const [dietErr, setDietErr] = useState('');
  const [notifGranted, setNotifGranted] = useState(
    typeof Notification !== 'undefined' ? Notification.permission === 'granted' : false
  );
  const [showBell, setShowBell] = useState(false);
  const [weeklyAnalysis, setWeeklyAnalysis] = useState('');
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const confettiFired = useRef(false);

  // Load cached weekly analysis
  useEffect(() => {
    const weekKey = `weekly_analysis_${getWeekKey()}`;
    const cached = localStorage.getItem(weekKey);
    if (cached) setWeeklyAnalysis(cached);
  }, [profile.id]);

  // Load last saved diet plan
  useEffect(() => {
    supabase
      .from('diet_plans')
      .select('plan')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => { if (data?.plan) setDietPlan(data.plan); });
  }, [profile.id]);

  // Show local notification if measurement overdue
  useEffect(() => {
    if (!measurements.length || Notification.permission !== 'granted') return;
    const last = measurements.at(-1);
    const diffH = (Date.now() - new Date(last.date)) / 3600000;
    if (diffH < 30) return;
    const todayKey = `notif_shown_${new Date().toDateString()}`;
    if (localStorage.getItem(todayKey)) return;
    localStorage.setItem(todayKey, '1');
    navigator.serviceWorker?.ready.then(sw => {
      sw.showNotification('Peso Tracker 💪', {
        body: 'Non ti sei pesato di recente! Aggiungi la tua misurazione di oggi.',
        icon: '/logo.png',
        badge: '/logo.png',
        tag: 'peso-reminder',
      });
    });
  }, [measurements]);

  const getWeekKey = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const week = Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
    return `${now.getFullYear()}_w${week}`;
  };

  const generateAnalysis = async () => {
    setLoadingAnalysis(true);
    try {
      const { data, error } = await supabase.functions.invoke('weekly-analysis', {
        body: { measurements, profile },
      });
      if (error) throw error;
      const text = data?.analysis || '';
      setWeeklyAnalysis(text);
      localStorage.setItem(`weekly_analysis_${getWeekKey()}`, text);
    } catch {
      setWeeklyAnalysis('Errore nella generazione. Riprova più tardi.');
    }
    setLoadingAnalysis(false);
  };

  const requestNotif = async () => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'granted') {
      setNotifGranted(true);
      return;
    }
    const perm = await Notification.requestPermission();
    setNotifGranted(perm === 'granted');
  };

  const last  = measurements.at(-1);
  const prev  = measurements.at(-2);
  const kg    = last ? +last.weight : +profile.peso_iniziale;
  const kgP   = prev ? +prev.weight : null;
  const delta = kgP !== null ? (kg - kgP).toFixed(1) : null;
  const deltaLabel = prev && last
    ? isYesterday(last.date, prev.date) ? 'rispetto a ieri' : 'dalla misura precedente'
    : null;

  const altezza = +profile.altezza;
  const bmiVal  = altezza > 0 ? (kg / ((altezza / 100) ** 2)).toFixed(1) : '—';
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

  const eta  = calcEta(profile.data_nascita);
  const tdee = calcTDEE(kg, altezza, eta, profile.sesso, profile.attivita);

  // Goal prediction
  const dailyRate = mediaGg > 0 ? +mediaGg : null;
  const missingKg = kg - +profile.obiettivo_kg;
  const daysToGoal = (dailyRate && missingKg > 0 && giorni > 2) ? Math.round(missingKg / dailyRate) : null;
  const weeksToGoal = daysToGoal ? Math.ceil(daysToGoal / 7) : null;

  // Confetti when goal reached
  if (+pct >= 100 && !confettiFired.current) {
    confettiFired.current = true;
    setTimeout(() => {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors: ['#00FF41', '#ffffff', '#FFD700'] });
    }, 400);
  }

  const generateDiet = async (random = false) => {
    setLoadingDiet(true);
    setDietErr('');
    try {
      let foodPrefs = {};
      if (!random) {
        try { foodPrefs = JSON.parse(localStorage.getItem('food_prefs') || '{}'); } catch {}
      }
      const { data, error } = await supabase.functions.invoke('diet-advice', {
        body: {
          peso: kg,
          peso_obiettivo: +profile.obiettivo_kg,
          altezza,
          sesso: profile.sesso || null,
          eta,
          obiettivo: profile.obiettivo_tipo || 'dimagrire',
          attivita: profile.attivita || 'moderato',
          tdee,
          food_prefs: foodPrefs,
          random,
        },
      });
      if (error) throw new Error(error.message || JSON.stringify(error));
      if (data?.error) throw new Error(data.error);
      setDietPlan(data.plan);
      supabase.from('diet_plans').insert([{ user_id: profile.id, plan: data.plan }]);
    } catch (e) {
      setDietErr(e?.message || 'Errore nella generazione. Controlla la connessione e riprova.');
    }
    setLoadingDiet(false);
  };

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
        <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="home-bell" onClick={() => setShowBell(true)} title="Impostazioni notifiche e piano AI">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {!notifGranted && <span className="home-bell-dot" />}
        </button>
        <button className="home-guide-btn" onClick={() => setShowGuide(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </button>
        </div>
      </div>

      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
      {showBell && (
        <BellModal
          onClose={() => setShowBell(false)}
          notifGranted={notifGranted}
          onRequestNotif={async () => {
            await requestNotif();
            setShowBell(false);
          }}
        />
      )}

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
          <div className="card-label">BMI{profile.sesso ? ` · ${profile.sesso === 'M' ? '♂' : '♀'}` : ''}</div>
          <div className="card-big-num" style={{ fontSize: '2.2rem' }}>{bmiVal}</div>
          <div style={{ color: bmi.color, fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginTop: 4 }}>
            {bmi.lbl}
          </div>
          <div className="bmi-figure">
            <BmiGauge bmiVal={bmiVal} color={bmi.color} />
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

      {/* PREDIZIONE OBIETTIVO */}
      {daysToGoal && (
        <div className="card-neon predict-card">
          <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>🎯</div>
          <div className="predict-title">
            {weeksToGoal <= 1
              ? 'Sei vicinissimo al tuo obiettivo!'
              : `Obiettivo raggiungibile in ~${weeksToGoal} settimane`}
          </div>
          <div className="predict-sub">
            Al ritmo attuale di <strong>{mediaGg} kg/gg</strong> — ancora <strong>{missingKg.toFixed(1)} kg</strong> da perdere
          </div>
        </div>
      )}

      {/* ANALISI SETTIMANALE AI */}
      <div className="card-neon weekly-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ fontSize: '1.2rem' }}>🧠</div>
          <div>
            <div className="card-label" style={{ marginBottom: 0 }}>ANALISI SETTIMANALE</div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Generata da AI · si aggiorna ogni settimana</div>
          </div>
        </div>
        {loadingAnalysis && (
          <div className="diet-loading"><div className="diet-spinner" /><span>Analisi in corso...</span></div>
        )}
        {!loadingAnalysis && weeklyAnalysis && (
          <p className="weekly-text">{weeklyAnalysis}</p>
        )}
        {!loadingAnalysis && (
          <button
            className="btn-diet-regen"
            onClick={generateAnalysis}
            style={{ marginTop: weeklyAnalysis ? 12 : 0 }}
          >
            {weeklyAnalysis ? '↻ Rigenera analisi' : '✨ Genera analisi settimana'}
          </button>
        )}
      </div>

      {/* PIANO ALIMENTARE AI */}
      <div className="card-neon diet-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ fontSize: '1.3rem' }}>🥗</div>
          <div>
            <div className="card-label" style={{ marginBottom: 0 }}>PIANO ALIMENTARE</div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
              Personalizzato da AI · {profile.sesso === 'M' ? 'Uomo' : profile.sesso === 'F' ? 'Donna' : 'Profilo'}{tdee ? ` · ${tdee} kcal/gg` : ''}
            </div>
          </div>
        </div>

        {!dietPlan && !loadingDiet && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn-diet-generate" onClick={() => generateDiet(false)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 8v4l3 3"/><path d="M18 2v4h4"/>
              </svg>
              Genera il mio piano alimentare
            </button>
            <button className="btn-diet-regen" onClick={() => generateDiet(true)}>
              🎲 Piano casuale (ignora preferenze)
            </button>
          </div>
        )}

        {loadingDiet && (
          <div className="diet-loading">
            <div className="diet-spinner" />
            <span>L&apos;AI sta preparando il tuo piano...</span>
          </div>
        )}

        {dietErr && (
          <div style={{ color: '#FF4444', fontSize: '0.78rem', marginBottom: 10 }}>{dietErr}</div>
        )}

        {dietPlan && !loadingDiet && (
          <>
            <DietPlanView plan={dietPlan} />
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button
                className="btn-diet-regen"
                onClick={() => { setDietPlan(null); setDietErr(''); generateDiet(false); }}
                style={{ flex: 1 }}
              >
                Rigenera piano
              </button>
              <button
                className="btn-diet-regen"
                onClick={() => { setDietPlan(null); setDietErr(''); generateDiet(true); }}
                style={{ flex: 1 }}
              >
                🎲 Casuale
              </button>
            </div>
          </>
        )}
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
