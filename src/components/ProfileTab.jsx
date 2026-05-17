import React, { useState, useRef } from 'react';
import { supabase } from '../supabaseClient';

const BMI_INFO = b =>
  b < 18.5 ? { lbl: 'Sottopeso', color: '#5352ED' } :
  b < 25   ? { lbl: 'Normopeso', color: '#00FF41' } :
  b < 30   ? { lbl: 'Sovrappeso', color: '#FFA502' } :
             { lbl: 'Obesità',   color: '#FF4444' };

const ATTIVITA_LABELS = {
  sedentario: 'Sedentario',
  leggero: 'Attività leggera',
  moderato: 'Moderatamente attivo',
  attivo: 'Molto attivo',
  estremo: 'Atleta',
};

const OBIETTIVO_LABELS = {
  dimagrire: 'Perdere peso',
  mantenere: 'Mantenere peso',
  massa: 'Aumentare massa',
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

const Row = ({ ico, label, val, color }) => (
  <div className="info-row">
    <div className="info-row-left">
      <span style={{ color: 'rgba(255,255,255,0.4)', display: 'flex' }}>{ico}</span>
      <span className="info-row-key">{label}</span>
    </div>
    <span className="info-row-val" style={{ color: color || '#fff' }}>{val}</span>
  </div>
);

export default function ProfileTab({ profile, user, measurements, onProfileUpdate }) {
  const [editing, setEditing] = useState(false);
  const [f, setF] = useState({
    nome:              profile.nome || '',
    altezza:           profile.altezza || '',
    peso_iniziale:     profile.peso_iniziale || '',
    obiettivo_kg:      profile.obiettivo_kg || '',
    data_nascita:      profile.data_nascita || '',
    sesso:             profile.sesso || '',
    attivita:          profile.attivita || 'moderato',
    obiettivo_tipo:    profile.obiettivo_tipo || 'dimagrire',
    circonferenza_vita:profile.circonferenza_vita || '',
    nota:              profile.nota || '',
  });
  const [saving, setSaving]       = useState(false);
  const [saveErr, setSaveErr]     = useState('');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || null);
  const [uploading, setUploading] = useState(false);
  const [avatarErr, setAvatarErr] = useState('');
  const fileRef = useRef();

  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  const uploadAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (upErr) { setUploading(false); setAvatarErr('Errore upload. Riprova.'); return; }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    const url = `${data.publicUrl}?t=${Date.now()}`;
    await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
    setAvatarUrl(url);
    setUploading(false);
  };

  const save = async () => {
    setSaveErr('');
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      nome:               f.nome,
      altezza:            +f.altezza,
      peso_iniziale:      +f.peso_iniziale,
      obiettivo_kg:       +f.obiettivo_kg,
      data_nascita:       f.data_nascita || null,
      sesso:              f.sesso || null,
      attivita:           f.attivita || null,
      obiettivo_tipo:     f.obiettivo_tipo || null,
      circonferenza_vita: f.circonferenza_vita ? +f.circonferenza_vita : null,
      nota:               f.nota || null,
    }).eq('id', user.id);
    setSaving(false);
    if (error) { setSaveErr('Errore nel salvataggio. Riprova.'); }
    else { onProfileUpdate(f); setEditing(false); }
  };

  // Stats
  const kg     = measurements.length ? +measurements.at(-1).weight : +profile.peso_iniziale;
  const bmiVal = (kg / ((+profile.altezza / 100) ** 2)).toFixed(1);
  const bmi    = BMI_INFO(+bmiVal);
  const persi  = (+profile.peso_iniziale - kg).toFixed(1);
  const manca  = (kg - +profile.obiettivo_kg).toFixed(1);
  const giorni = measurements.length > 1
    ? Math.round((new Date(measurements.at(-1).date) - new Date(measurements[0].date)) / 86400000)
    : 0;
  const ini  = (profile.nome || 'U')[0].toUpperCase();
  const eta  = calcEta(profile.data_nascita);
  const tdee = calcTDEE(kg, +profile.altezza, eta, profile.sesso, profile.attivita);
  const pesoIdMin = (18.5 * ((+profile.altezza / 100) ** 2)).toFixed(1);
  const pesoIdMax = (24.9 * ((+profile.altezza / 100) ** 2)).toFixed(1);
  const mediaGg = giorni > 0 && measurements.length > 1
    ? (Math.abs(persi) / giorni).toFixed(3)
    : null;

  return (
    <div className="pg">
      {/* HERO */}
      <div className="prof-hero">
        <div className="prof-avatar-wrap" onClick={() => fileRef.current.click()}>
          {avatarUrl
            ? <img src={avatarUrl} alt="avatar" className="prof-avatar-img" />
            : <div className="prof-avatar">{ini}</div>}
          <div className="prof-avatar-edit">
            {uploading
              ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadAvatar} />
        </div>
        {avatarErr && <p className="err" style={{ fontSize: '0.7rem', marginTop: 4 }}>{avatarErr}</p>}
        <div className="prof-info">
          <div className="prof-name">{profile.nome}{eta ? `, ${eta} anni` : ''}</div>
          <div className="prof-email">{user.email}</div>
          <span className="prof-badge">
            {profile.obiettivo_tipo ? OBIETTIVO_LABELS[profile.obiettivo_tipo] : 'MEMBRO ATTIVO'}
          </span>
        </div>
      </div>

      {/* 3 SUMMARY CARD */}
      <div className="prof-summary3">
        <div className="prof-sum-card">
          <div className="prof-sum-val" style={{ color: bmi.color }}>{bmiVal}</div>
          <div className="prof-sum-lbl">BMI</div>
          <div style={{ fontSize: '0.55rem', color: bmi.color, marginTop: 2 }}>{bmi.lbl}</div>
        </div>
        <div className="prof-sum-card">
          <div className="prof-sum-val">{measurements.length}</div>
          <div className="prof-sum-lbl">Misurazioni</div>
        </div>
        <div className="prof-sum-card">
          <div className="prof-sum-val" style={{ color: +persi > 0 ? '#00FF41' : '#FF4444' }}>
            {+persi > 0 ? `-${persi}` : `+${Math.abs(persi)}`}
          </div>
          <div className="prof-sum-lbl">Kg totali</div>
        </div>
      </div>

      {/* SEZIONE DATI */}
      <div className="section-block">
        <div className="section-title">I MIEI DATI</div>
        <div className="info-list">
          <Row ico={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V12m0 0V2m0 10H2m10 0h10"/></svg>} label="Altezza" val={`${profile.altezza} cm`} />
          <Row ico={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>} label="Peso iniziale" val={`${profile.peso_iniziale} kg`} />
          <Row ico={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00FF41" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>} label="Peso attuale" val={`${kg} kg`} color="#00FF41" />
          <Row ico={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00FF41" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>} label="Obiettivo" val={`${profile.obiettivo_kg} kg`} color="#00FF41" />
          <Row ico={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={+manca > 0 ? '#FFA502' : '#00FF41'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>} label="Kg mancanti" val={`${+manca > 0 ? manca : 0} kg`} color={+manca > 0 ? '#FFA502' : '#00FF41'} />
          <Row ico={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>} label={`BMI — ${bmi.lbl}`} val={bmiVal} color={bmi.color} />
          {eta && <Row ico={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>} label="Età" val={`${eta} anni`} />}
          {profile.sesso && <Row ico={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M12 13v8M9 18h6"/></svg>} label="Sesso" val={profile.sesso === 'M' ? 'Maschio' : 'Femmina'} />}
          {profile.attivita && <Row ico={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} label="Attività" val={ATTIVITA_LABELS[profile.attivita] || profile.attivita} />}
          {profile.circonferenza_vita && <Row ico={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>} label="Circ. vita" val={`${profile.circonferenza_vita} cm`} />}
          {tdee && <Row ico={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFA502" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>} label="TDEE (kcal/gg)" val={`${tdee} kcal`} color="#FFA502" />}
          {mediaGg && <Row ico={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>} label="Media kg/giorno" val={`-${mediaGg} kg`} />}
          <Row ico={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>} label="Giorni tracking" val={`${giorni}`} />
          <Row ico={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} label="Membro dal" val={new Date(profile.created_at).toLocaleDateString('it-IT', { day:'2-digit', month:'short', year:'numeric' })} />
          <Row ico={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>} label="Peso ideale" val={`${pesoIdMin}–${pesoIdMax} kg`} color="rgba(255,255,255,0.5)" />
          {profile.nota && (
            <div className="info-row" style={{ flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
              <span className="info-row-key" style={{ color: 'rgba(255,255,255,0.4)' }}>📝 Note</span>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{profile.nota}</span>
            </div>
          )}
        </div>
      </div>

      <button className="btn-edit" onClick={() => setEditing(true)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        MODIFICA DATI
      </button>

      <div className="app-footer">
        <img src="/logo.png" alt="Peso Tracker" style={{ width: 56, height: 56, objectFit: 'contain' }} />
        <div className="app-footer-ver">v3.0 — Il tuo compagno di fitness</div>
      </div>

      <button className="btn-exit" onClick={() => supabase.auth.signOut()}>
        ESCI DALL&apos;ACCOUNT
      </button>

      {/* MODAL MODIFICA */}
      {editing && (
        <div className="overlay" onClick={() => setEditing(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">MODIFICA DATI</div>
            <div className="form-stack" style={{ maxHeight: '65vh', overflowY: 'auto' }}>

              {/* Base */}
              <div className="modal-section-lbl">DATI BASE</div>
              <div className="field">
                <label className="field-lbl">Nome</label>
                <input className="inp" value={f.nome} onChange={set('nome')} />
              </div>
              <div className="two-inp">
                <div className="field">
                  <label className="field-lbl">Altezza (cm)</label>
                  <input className="inp" type="number" value={f.altezza} onChange={set('altezza')} />
                </div>
                <div className="field">
                  <label className="field-lbl">Data di nascita</label>
                  <input className="inp" type="date" value={f.data_nascita} onChange={set('data_nascita')} />
                </div>
              </div>
              <div className="field">
                <label className="field-lbl">Sesso</label>
                <div className="seg-ctrl">
                  {[['M','Maschio'],['F','Femmina']].map(([v,l]) => (
                    <button key={v} className={`seg-btn ${f.sesso === v ? 'seg-on' : ''}`} onClick={() => setF(p=>({...p,sesso:v}))}>{l}</button>
                  ))}
                </div>
              </div>

              {/* Pesi */}
              <div className="modal-section-lbl">PESO & OBIETTIVO</div>
              <div className="two-inp">
                <div className="field">
                  <label className="field-lbl">Peso iniziale (kg)</label>
                  <input className="inp" type="number" value={f.peso_iniziale} onChange={set('peso_iniziale')} />
                </div>
                <div className="field">
                  <label className="field-lbl">Obiettivo (kg)</label>
                  <input className="inp" type="number" value={f.obiettivo_kg} onChange={set('obiettivo_kg')} />
                </div>
              </div>
              <div className="field">
                <label className="field-lbl">Tipo obiettivo</label>
                <div className="seg-ctrl">
                  {[['dimagrire','Dimagrire'],['mantenere','Mantenere'],['massa','Massa']].map(([v,l]) => (
                    <button key={v} className={`seg-btn ${f.obiettivo_tipo === v ? 'seg-on' : ''}`} onClick={() => setF(p=>({...p,obiettivo_tipo:v}))}>{l}</button>
                  ))}
                </div>
              </div>

              {/* Fitness */}
              <div className="modal-section-lbl">FITNESS</div>
              <div className="field">
                <label className="field-lbl">Livello attività</label>
                <select className="inp inp-select" value={f.attivita} onChange={set('attivita')}>
                  {Object.entries(ATTIVITA_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="field-lbl">Circonferenza vita (cm)</label>
                <input className="inp" type="number" placeholder="es. 85" value={f.circonferenza_vita} onChange={set('circonferenza_vita')} />
              </div>

              {/* Note */}
              <div className="modal-section-lbl">NOTE</div>
              <div className="field">
                <label className="field-lbl">Nota personale</label>
                <textarea className="inp" rows={3} placeholder="Scrivi qualcosa..." value={f.nota} onChange={set('nota')} style={{ resize: 'none' }} />
              </div>

              {saveErr && <p className="err">{saveErr}</p>}
              <div className="modal-row">
                <button className="btn-outline" onClick={() => setEditing(false)}>Annulla</button>
                <button className="btn-g" style={{ flex: 2 }} onClick={save} disabled={saving}>
                  {saving ? 'Salvataggio...' : 'SALVA'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
