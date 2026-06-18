import React, { useState, useRef } from 'react';
import { supabase } from '../supabaseClient';

const BODY_FIELDS = [
  { key: 'vita',    label: 'Vita (cm)',    placeholder: '80' },
  { key: 'fianchi', label: 'Fianchi (cm)', placeholder: '95' },
  { key: 'petto',   label: 'Petto (cm)',   placeholder: '90' },
  { key: 'braccia', label: 'Braccia (cm)', placeholder: '32' },
];

export default function AddWeight({ onClose, onSaved, userId }) {
  const [w, setW]       = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [err, setErr]   = useState('');
  const [busy, setBusy] = useState(false);

  const [note, setNote] = useState('');
  const [showBody, setShowBody] = useState(false);
  const [body, setBody] = useState({ vita: '', fianchi: '', petto: '', braccia: '' });

  const [photo, setPhoto]         = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const photoRef = useRef();

  const setB = k => e => setBody(p => ({ ...p, [k]: e.target.value }));

  const handlePhoto = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const save = async () => {
    const num = parseFloat(w);
    if (!w || isNaN(num) || num <= 0 || num > 500)
      return setErr('Inserisci un peso valido (es. 78.5).');
    setBusy(true);
    const isoDate = `${date}T12:00:00.000Z`;

    // 1. Save weight
    const { data: measData, error: measErr } = await supabase
      .from('measurements')
      .insert([{ user_id: userId, weight: num, date: isoDate, note: note.trim() || null }])
      .select()
      .single();
    if (measErr) { setBusy(false); return setErr(measErr.message); }

    // 2. Save body measurements if any field is filled
    const bodyVals = Object.fromEntries(
      Object.entries(body).filter(([, v]) => v !== '' && !isNaN(+v))
        .map(([k, v]) => [k, +v])
    );
    if (Object.keys(bodyVals).length > 0) {
      await supabase.from('body_measurements').insert([{
        user_id: userId, date: isoDate, ...bodyVals,
      }]);
    }

    // 3. Upload photo if selected
    if (photo) {
      const ext  = photo.name.split('.').pop();
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('body-photos')
        .upload(path, photo, { upsert: false });
      if (!upErr) {
        const { data: urlData } = supabase.storage.from('body-photos').getPublicUrl(path);
        await supabase.from('body_photos').insert([{
          user_id: userId, date: isoDate, photo_url: urlData.publicUrl,
        }]);
      }
    }

    setBusy(false);
    if (navigator.vibrate) navigator.vibrate(60);
    onSaved(measData);
  };

  const handleKey = e => { if (e.key === 'Enter') save(); };

  const hasBodyInput = Object.values(body).some(v => v !== '');

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">NUOVA MISURAZIONE</div>

        <div className="weight-preview">
          <span className="weight-preview-num">{w || '—'}</span>
          <span className="weight-preview-unit"> kg</span>
        </div>

        <div className="form-stack" style={{ marginTop: 16, maxHeight: '65vh', overflowY: 'auto' }}>
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

          <div className="field">
            <label className="field-lbl">Nota (opzionale)</label>
            <input
              className="inp"
              type="text"
              maxLength={120}
              placeholder="es. dopo palestra, giorno di sgarro..."
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          {/* MISURE CORPOREE */}
          <button
            type="button"
            className="add-section-toggle"
            onClick={() => setShowBody(v => !v)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {showBody
                ? <polyline points="18 15 12 9 6 15" />
                : <polyline points="6 9 12 15 18 9" />}
            </svg>
            <span>Misure corporee {hasBodyInput ? '✓' : '(opzionale)'}</span>
          </button>

          {showBody && (
            <div className="body-meas-grid">
              {BODY_FIELDS.map(({ key, label, placeholder }) => (
                <div className="field" key={key}>
                  <label className="field-lbl">{label}</label>
                  <input
                    className="inp"
                    type="number"
                    step=".5"
                    placeholder={placeholder}
                    value={body[key]}
                    onChange={setB(key)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* FOTO */}
          <div className="add-photo-row">
            <button
              type="button"
              className="add-photo-btn"
              onClick={() => photoRef.current.click()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              {photoPreview ? 'Cambia foto' : 'Aggiungi foto'}
            </button>
            {photoPreview && (
              <div className="add-photo-preview-wrap">
                <img src={photoPreview} alt="preview" className="add-photo-preview" />
                <button
                  className="add-photo-remove"
                  onClick={() => { URL.revokeObjectURL(photoPreview); setPhoto(null); setPhotoPreview(null); }}
                >×</button>
              </div>
            )}
            <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
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
