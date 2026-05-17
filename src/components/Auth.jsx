import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Auth({ setUser }) {
  const [tab, setTab] = useState('login');
  const [f, setF] = useState({ email: '', password: '', nome: '', altezza: '', peso_iniziale: '', obiettivo_kg: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [ricordami, setRicordami] = useState(true);

  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  const login = async () => {
    setErr(''); setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: f.email, password: f.password });
    setBusy(false);
    if (error) return setErr(error.message);
    if (!ricordami) {
      sessionStorage.setItem('pt_no_persist', '1');
      window.addEventListener('beforeunload', () => supabase.auth.signOut(), { once: true });
    } else {
      sessionStorage.removeItem('pt_no_persist');
    }
    setUser(data.user);
  };

  const register = async () => {
    setErr('');
    if (!f.email || !f.password || !f.altezza || !f.peso_iniziale || !f.obiettivo_kg)
      return setErr('Compila tutti i campi obbligatori.');
    setBusy(true);
    const { error: e1 } = await supabase.auth.signUp({ email: f.email, password: f.password });
    if (e1) { setBusy(false); return setErr(e1.message); }
    const { data: d2, error: e2 } = await supabase.auth.signInWithPassword({ email: f.email, password: f.password });
    if (e2) { setBusy(false); return setErr(e2.message); }
    const { error: e3 } = await supabase.from('profiles').insert([{
      id: d2.user.id,
      nome: f.nome || f.email.split('@')[0],
      altezza: +f.altezza,
      peso_iniziale: +f.peso_iniziale,
      obiettivo_kg: +f.obiettivo_kg,
    }]);
    setBusy(false);
    if (e3) { await supabase.auth.signOut(); return setErr(e3.message); }
    setUser(d2.user);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-glow" />

      <div className="auth-brand">
        <img
          src="/logo.png"
          alt="Peso Tracker"
          className="auth-logo-img"
          onError={e => { e.currentTarget.style.display='none'; e.currentTarget.nextSibling.style.display='flex'; }}
        />
        <div className="auth-logo-fallback" style={{ display:'none' }}>
          <div className="auth-logo-ring" />
          <div className="auth-logo-inner">⚡</div>
        </div>
        <div className="auth-brand-sub">Il tuo percorso. I tuoi dati. Il tuo obiettivo.</div>
      </div>

      <div className="auth-box">
        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === 'login' ? 'auth-tab-on' : ''}`}
            onClick={() => { setTab('login'); setErr(''); }}
          >
            Login
          </button>
          <button
            className={`auth-tab ${tab === 'register' ? 'auth-tab-on' : ''}`}
            onClick={() => { setTab('register'); setErr(''); }}
          >
            Registrati
          </button>
        </div>

        {tab === 'login' ? (
          <div className="form-stack">
            <div className="field">
              <label className="field-lbl">Email</label>
              <input className="inp" type="email" placeholder="tuo@email.com" value={f.email} onChange={set('email')} />
            </div>
            <div className="field">
              <label className="field-lbl">Password</label>
              <input className="inp" type="password" placeholder="••••••••" value={f.password} onChange={set('password')} />
            </div>
            <label className="ricordami-row">
              <div
                className={`ricordami-toggle ${ricordami ? 'ricordami-on' : ''}`}
                onClick={() => setRicordami(v => !v)}
              >
                <div className="ricordami-thumb" />
              </div>
              <span className="ricordami-lbl">Ricordami</span>
            </label>
            {err && <p className="err">{err}</p>}
            <button className="btn-g" onClick={login} disabled={busy}>
              {busy ? 'Accesso in corso...' : 'ACCEDI'}
            </button>
          </div>
        ) : (
          <div className="form-stack">
            <div className="field">
              <label className="field-lbl">Nome</label>
              <input className="inp" type="text" placeholder="Il tuo nome" value={f.nome} onChange={set('nome')} />
            </div>
            <div className="field">
              <label className="field-lbl">Email</label>
              <input className="inp" type="email" placeholder="tuo@email.com" value={f.email} onChange={set('email')} />
            </div>
            <div className="field">
              <label className="field-lbl">Password</label>
              <input className="inp" type="password" placeholder="Minimo 6 caratteri" value={f.password} onChange={set('password')} />
            </div>
            <div className="two-inp">
              <div className="field">
                <label className="field-lbl">Altezza (cm)</label>
                <input className="inp" type="number" placeholder="175" min="100" max="250" value={f.altezza} onChange={set('altezza')} />
              </div>
              <div className="field">
                <label className="field-lbl">Peso iniziale (kg)</label>
                <input className="inp" type="number" placeholder="80" min="20" max="500" value={f.peso_iniziale} onChange={set('peso_iniziale')} />
              </div>
            </div>
            <div className="field">
              <label className="field-lbl">Obiettivo peso (kg)</label>
              <input className="inp" type="number" placeholder="70" min="20" max="500" value={f.obiettivo_kg} onChange={set('obiettivo_kg')} />
            </div>
            {err && <p className="err">{err}</p>}
            <button className="btn-g" onClick={register} disabled={busy}>
              {busy ? 'Creazione account...' : 'CREA ACCOUNT'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
