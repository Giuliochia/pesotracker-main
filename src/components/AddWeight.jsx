import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function AddWeight({ onClose, onSaved, userId }) {
  const [w, setW]       = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [err, setErr]   = useState('');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    const num = parseFloat(w);
    if (!w || isNaN(num) || num <= 0 || num > 500)
      return setErr('Inserisci un peso valido (es. 78.5).');
    setBusy(true);
    // Use T12:00:00Z to avoid timezone day-shift issues
    const isoDate = `${date}T12:00:00.000Z`;
    const { data, error } = await supabase
      .from('measurements')
      .insert([{ user_id: userId, weight: num, date: isoDate }])
      .select()
      .single();
    setBusy(false);
    if (error) return setErr(error.message);
    onSaved(data);
  };

  const handleKey = e => { if (e.key === 'Enter') save(); };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">NUOVA MISURAZIONE</div>

        <div className="weight-preview">
          <span className="weight-preview-num">{w || '—'}</span>
          <span className="weight-preview-unit"> kg</span>
        </div>

        <div className="form-stack" style={{ marginTop: 16 }}>
          <div className="field">
            <label className="field-lbl">Peso (kg)</label>
            <input
              className="inp"
              type="number"
              step=".1"
              min="20"
              max="500"
              placeholder="es. 78.5"
              value={w}
              onChange={e => { setW(e.target.value); setErr(''); }}
              onKeyDown={handleKey}
              autoFocus
            />
          </div>
          <div className="field">
            <label className="field-lbl">Data</label>
            <input
              className="inp"
              type="date"
              value={date}
              max={new Date().toISOString().split('T')[0]}
              onChange={e => setDate(e.target.value)}
            />
          </div>
          {err && <p className="err">{err}</p>}
          <div className="modal-row">
            <button className="btn-outline" onClick={onClose}>Annulla</button>
            <button className="btn-g" style={{ flex: 2 }} onClick={save} disabled={busy}>
              {busy ? 'Salvataggio...' : 'SALVA'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
