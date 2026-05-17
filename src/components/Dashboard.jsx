import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import BottomNav from './BottomNav';
import HomeTab from './HomeTab';
import HistoryTab from './HistoryTab';
import GoalsTab from './GoalsTab';
import ProfileTab from './ProfileTab';
import AddWeight from './AddWeight';
import WhatsNewModal, { shouldShowWhatsNew } from './WhatsNewModal';

export default function Dashboard({ user }) {
  const [profile, setProfile]             = useState(null);
  const [measurements, setMeasurements]   = useState([]);
  const [bodyMeasurements, setBodyMeas]   = useState([]);
  const [bodyPhotos, setBodyPhotos]       = useState([]);
  const [tab, setTab]                     = useState('home');
  const [showAdd, setShowAdd]             = useState(false);
  const [loading, setLoading]             = useState(true);
  const [loadError, setLoadError]         = useState(false);
  const [showWhatsNew, setShowWhatsNew]   = useState(false);
  const touchRef = useRef(null);
  const TAB_ORDER = ['home', 'history', 'goals', 'profile'];

  const handleTouchStart = (e) => {
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e) => {
    if (!touchRef.current) return;
    const dx = e.changedTouches[0].clientX - touchRef.current.x;
    const dy = e.changedTouches[0].clientY - touchRef.current.y;
    touchRef.current = null;
    if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const idx = TAB_ORDER.indexOf(tab);
    if (dx < 0 && idx < TAB_ORDER.length - 1) setTab(TAB_ORDER[idx + 1]);
    if (dx > 0 && idx > 0) setTab(TAB_ORDER[idx - 1]);
  };

  useEffect(() => { load(); }, [user]);

  const load = async (tries = 5) => {
    try {
      const [{ data: p }, { data: m }, { data: bm }, { data: bp }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('measurements').select('*').eq('user_id', user.id).order('date', { ascending: true }),
        supabase.from('body_measurements').select('*').eq('user_id', user.id).order('date', { ascending: true }),
        supabase.from('body_photos').select('*').eq('user_id', user.id).order('date', { ascending: false }),
      ]);
      if (!p && tries > 0) {
        await new Promise(r => setTimeout(r, 800));
        return load(tries - 1);
      }
      if (!p) { setLoadError(true); setLoading(false); return; }
      setProfile(p);
      setMeasurements(m || []);
      setBodyMeas(bm || []);
      setBodyPhotos(bp || []);
      setLoading(false);
      if (shouldShowWhatsNew()) setTimeout(() => setShowWhatsNew(true), 600);
    } catch {
      if (tries > 0) {
        await new Promise(r => setTimeout(r, 800));
        return load(tries - 1);
      }
      setLoadError(true);
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="splash">
      <div className="splash-logo">
        <div className="splash-ring-outer" />
        <span className="splash-bolt">⚡</span>
      </div>
      <div className="splash-name">PESO TRACKER</div>
      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginTop: 8 }}>
        Caricamento dati...
      </div>
    </div>
  );

  if (loadError || !profile) return (
    <div className="splash">
      <div style={{ fontSize: '2rem', marginBottom: 12 }}>⚠️</div>
      <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 8, textAlign: 'center', padding: '0 32px' }}>
        Impossibile caricare il profilo. Controlla la connessione.
      </p>
      <button className="btn-g" style={{ marginBottom: 12, padding: '12px 28px' }} onClick={() => { setLoadError(false); setLoading(true); load(); }}>
        RIPROVA
      </button>
      <button className="btn-exit-sm" onClick={() => supabase.auth.signOut()}>Esci</button>
    </div>
  );

  return (
    <div className="shell" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {tab === 'home'    && <HomeTab    profile={profile} measurements={measurements} />}
      {tab === 'history' && (
        <HistoryTab
          measurements={measurements}
          goalWeight={profile.obiettivo_kg}
          altezza={+profile.altezza}
          bodyMeasurements={bodyMeasurements}
          bodyPhotos={bodyPhotos}
        />
      )}
      {tab === 'goals'   && <GoalsTab   profile={profile} measurements={measurements} />}
      {tab === 'profile' && (
        <ProfileTab
          profile={profile}
          user={user}
          measurements={measurements}
          onProfileUpdate={u => setProfile(p => ({ ...p, ...u }))}
        />
      )}

      <BottomNav active={tab} go={setTab} onAdd={() => setShowAdd(true)} />

      {showWhatsNew && <WhatsNewModal onClose={() => setShowWhatsNew(false)} />}

      {showAdd && (
        <AddWeight
          userId={user.id}
          onClose={() => setShowAdd(false)}
          onSaved={m => {
            setMeasurements(prev =>
              [...prev, m].sort((a, b) => new Date(a.date) - new Date(b.date))
            );
            setShowAdd(false);
            // Reload body data in background
            supabase.from('body_measurements').select('*').eq('user_id', user.id).order('date', { ascending: true })
              .then(({ data }) => { if (data) setBodyMeas(data); });
            supabase.from('body_photos').select('*').eq('user_id', user.id).order('date', { ascending: false })
              .then(({ data }) => { if (data) setBodyPhotos(data); });
          }}
        />
      )}
    </div>
  );
}
