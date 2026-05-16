import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const BMI_INFO = b =>
  b < 18.5 ? { lbl: 'Sottopeso', color: '#5352ED' } :
  b < 25   ? { lbl: 'Normopeso', color: '#00FF41' } :
  b < 30   ? { lbl: 'Sovrappeso', color: '#FFA502' } :
             { lbl: 'Obesita\'', color: '#FF4444' };

export default function ProfileTab({ profile, user, measurements, onProfileUpdate }) {
  const [editing, setEditing] = useState(false);
  const [f, setF] = useState({
    nome: profile.nome || '',
    altezza: profile.altezza || '',
    peso_iniziale: profile.peso_iniziale || '',
    obiettivo_kg: profile.obiettivo_kg || '',
  });
  const [saving, setSaving] = useState(false);
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  const kg     = measurements.length ? +measurements.at(-1).weight : +profile.peso_iniziale;
  const bmiVal = (kg / ((+profile.altezza / 100) ** 2)).toFixed(1);
  const bmi    = BMI_INFO(+bmiVal);
  const persi  = (+profile.peso_iniziale - kg).toFixed(1);
  const manca  = (kg - +profile.obiettivo_kg).toFixed(1);
  const giorni = measurements.length > 1
    ? Math.round((new Date(measurements.at(-1).date) - new Date(measurements[0].date)) / 86400000)
    : 0;
  const ini = (profile.nome || 'U')[0].toUpperCase();

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      nome: f.nome,
      altezza: +f.altezza,
      peso_iniziale: +f.peso_iniziale,
      obiettivo_kg: +f.obiettivo_kg,
    }).eq('id', user.id);
    setSaving(false);
    if (!error) { onProfileUpdate(f); setEditing(false); }
  };

  return (
    <div className="pg">
      {/* HERO */}
      <div className="prof-hero">
        <div className="prof-avatar">{ini}</div>
        <div className="prof-info">
          <div className="prof-name">{profile.nome}</div>
          <div className="prof-email">{user.email}</div>
          <span className="prof-badge">MEMBRO ATTIVO</span>
        </div>
      </div>

      {/* 3 SUMMARY CARD */}
      <div className="prof-summary3">
        <div className="prof-sum-card">
          <div className="prof-sum-val" style={{ color: bmi.color }}>{bmiVal}</div>
          <div className="prof-sum-lbl">BMI</div>
          <div style={{ fontSize: '0.6rem', color: bmi.color, marginTop: 2 }}>{bmi.lbl}</div>
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

      {/* I MIEI DATI */}
      <div className="section-block">
        <div className="section-title">I MIEI DATI</div>
        <div className="info-list">
          {[
            [
              <svg key="1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V12m0 0V2m0 10H2m10 0h10"/></svg>,
              'Altezza', `${profile.altezza} cm`, ''
            ],
            [
              <svg key="2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
              'Peso iniziale', `${profile.peso_iniziale} kg`, ''
            ],
            [
              <svg key="3" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00FF41" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
              'Peso attuale', `${kg} kg`, '#00FF41'
            ],
            [
              <svg key="4" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00FF41" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
              'Obiettivo', `${profile.obiettivo_kg} kg`, '#00FF41'
            ],
            [
              <svg key="5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={+manca > 0 ? '#FFA502' : '#00FF41'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
              'Kg mancanti', `${+manca > 0 ? manca : 0} kg`, +manca > 0 ? '#FFA502' : '#00FF41'
            ],
            [
              <svg key="6" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
              `BMI — ${bmi.lbl}`, bmiVal, bmi.color
            ],
            [
              <svg key="7" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
              'Giorni tracking', `${giorni}`, ''
            ],
            [
              <svg key="8" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
              'Membro dal', new Date(profile.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' }), ''
            ],
          ].map(([ico, k, v, color]) => (
            <div className="info-row" key={k}>
              <div className="info-row-left">
                <span style={{ color: 'rgba(255,255,255,0.4)', display: 'flex' }}>{ico}</span>
                <span className="info-row-key">{k}</span>
              </div>
              <span className="info-row-val" style={{ color: color || '#fff' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* BUTTONS */}
      <button className="btn-edit" onClick={() => setEditing(true)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        MODIFICA DATI
      </button>

      <div className="app-footer">
        <div className="app-footer-logo">⚡ PESO TRACKER</div>
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
            <div className="form-stack">
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
                  <label className="field-lbl">Peso iniziale</label>
                  <input className="inp" type="number" value={f.peso_iniziale} onChange={set('peso_iniziale')} />
                </div>
              </div>
              <div className="field">
                <label className="field-lbl">Obiettivo (kg)</label>
                <input className="inp" type="number" value={f.obiettivo_kg} onChange={set('obiettivo_kg')} />
              </div>
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
