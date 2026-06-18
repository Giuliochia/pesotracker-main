import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const ATTIVITA = [
  { value: 'sedentario', label: 'Sedentario', sub: 'Poco o nessun esercizio' },
  { value: 'leggero',   label: 'Leggero',    sub: '1-3 volte a settimana' },
  { value: 'moderato',  label: 'Moderato',   sub: '3-5 volte a settimana' },
  { value: 'attivo',    label: 'Molto attivo', sub: '6-7 volte a settimana' },
  { value: 'estremo',   label: 'Atleta',     sub: 'Allenamento intenso quotidiano' },
];

const OBIETTIVO = [
  { value: 'dimagrire', label: 'Perdere peso', icon: '📉' },
  { value: 'mantenere', label: 'Mantenere',    icon: '⚖️' },
  { value: 'massa',     label: 'Aumentare massa', icon: '💪' },
];

export default function OnboardingWizard({ userId, onComplete }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState({
    nome: '', sesso: '', data_nascita: '',
    altezza: '', peso_iniziale: '', obiettivo_kg: '',
    attivita: 'moderato', obiettivo_tipo: 'dimagrire',
  });

  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  const canNext = [
    f.nome.trim() && f.sesso,
    f.altezza && f.peso_iniziale && f.obiettivo_kg,
    true,
  ][step];

  const save = async () => {
    setSaving(true);
    const { data } = await supabase.from('profiles').update({
      nome:           f.nome.trim(),
      sesso:          f.sesso,
      data_nascita:   f.data_nascita || null,
      altezza:        +f.altezza,
      peso_iniziale:  +f.peso_iniziale,
      obiettivo_kg:   +f.obiettivo_kg,
      attivita:       f.attivita,
      obiettivo_tipo: f.obiettivo_tipo,
    }).eq('id', userId).select().single();
    setSaving(false);
    if (data) onComplete(data);
  };

  const steps = ['Chi sei?', 'I tuoi dati', 'Il tuo obiettivo'];

  return (
    <div className="overlay" style={{ zIndex: 500, alignItems: 'center', background: 'rgba(0,0,0,0.95)' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '0 20px' }}>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? '#00FF41' : 'rgba(255,255,255,0.1)', transition: '0.3s' }} />
          ))}
        </div>

        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginBottom: 6, letterSpacing: '1px' }}>
          STEP {step + 1} / {steps.length}
        </div>
        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', marginBottom: 24 }}>{steps[step]}</div>

        {/* Step 0 */}
        {step === 0 && (
          <div className="form-stack">
            <div className="field">
              <label className="field-lbl">Come ti chiami?</label>
              <input className="inp" placeholder="Il tuo nome" value={f.nome} onChange={set('nome')} autoFocus />
            </div>
            <div className="field">
              <label className="field-lbl">Sesso</label>
              <div className="seg-ctrl">
                {[['M','Maschio'],['F','Femmina']].map(([v,l]) => (
                  <button key={v} className={`seg-btn ${f.sesso === v ? 'seg-on' : ''}`} onClick={() => setF(p=>({...p,sesso:v}))}>{l}</button>
                ))}
              </div>
            </div>
            <div className="field">
              <label className="field-lbl">Data di nascita (opzionale)</label>
              <input className="inp" type="date" value={f.data_nascita} onChange={set('data_nascita')} />
            </div>
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <div className="form-stack">
            <div className="field">
              <label className="field-lbl">Altezza (cm)</label>
              <input className="inp" type="number" placeholder="es. 175" value={f.altezza} onChange={set('altezza')} autoFocus />
            </div>
            <div className="two-inp">
              <div className="field">
                <label className="field-lbl">Peso attuale (kg)</label>
                <input className="inp" type="number" step=".1" placeholder="es. 80" value={f.peso_iniziale} onChange={set('peso_iniziale')} />
              </div>
              <div className="field">
                <label className="field-lbl">Peso obiettivo (kg)</label>
                <input className="inp" type="number" step=".1" placeholder="es. 70" value={f.obiettivo_kg} onChange={set('obiettivo_kg')} />
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="form-stack">
            <div className="field">
              <label className="field-lbl">Obiettivo</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {OBIETTIVO.map(o => (
                  <button
                    key={o.value}
                    className={`seg-btn ${f.obiettivo_tipo === o.value ? 'seg-on' : ''}`}
                    style={{ flex: 1, flexDirection: 'column', gap: 4, padding: '10px 4px' }}
                    onClick={() => setF(p=>({...p,obiettivo_tipo:o.value}))}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{o.icon}</span>
                    <span style={{ fontSize: '0.68rem' }}>{o.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label className="field-lbl">Livello di attività</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ATTIVITA.map(a => (
                  <button
                    key={a.value}
                    onClick={() => setF(p=>({...p,attivita:a.value}))}
                    style={{
                      background: f.attivita === a.value ? 'rgba(0,255,65,0.1)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${f.attivita === a.value ? 'rgba(0,255,65,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 10, padding: '10px 14px', cursor: 'pointer',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}
                  >
                    <span style={{ color: f.attivita === a.value ? '#00FF41' : '#fff', fontWeight: 700, fontSize: '0.82rem' }}>{a.label}</span>
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem' }}>{a.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
          {step > 0 && (
            <button className="btn-outline" style={{ flex: 1 }} onClick={() => setStep(s => s - 1)}>← Indietro</button>
          )}
          {step < steps.length - 1 ? (
            <button className="btn-g" style={{ flex: 2 }} onClick={() => setStep(s => s + 1)} disabled={!canNext}>
              Avanti →
            </button>
          ) : (
            <button className="btn-g" style={{ flex: 2 }} onClick={save} disabled={saving}>
              {saving ? 'Salvataggio...' : '🚀 Inizia!'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
