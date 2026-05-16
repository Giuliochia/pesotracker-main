import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import BottomNav from './BottomNav';
import HomeTab from './HomeTab';
import HistoryTab from './HistoryTab';
import GoalsTab from './GoalsTab';
import ProfileTab from './ProfileTab';
import AddWeight from './AddWeight';

export default function Dashboard({ user }) {
  const [profile, setProfile] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [tab, setTab] = useState('home');
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [user]);

  const load = async (tries = 5) => {
    const [{ data: p }, { data: m }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('measurements').select('*').eq('user_id', user.id).order('date', { ascending: true }),
    ]);
    if (!p && tries > 0) {
      await new Promise(r => setTimeout(r, 800));
      return load(tries - 1);
    }
    setProfile(p);
    setMeasurements(m || []);
    setLoading(false);
  };

  if (loading) return (
    <div className="splash">
      <div className="splash-logo">
        <div className="splash-ring-outer" />
        <span className="splash-bolt">⚡</span>
      </div>
      <div className="splash-name">PESO TRACKER</div>
    </div>
  );

  if (!profile) return (
    <div className="splash">
      <p style={{ color: 'rgba(255,255,255,.4)', marginBottom: 20 }}>Profilo non trovato.</p>
      <button className="btn-exit-sm" onClick={() => supabase.auth.signOut()}>Esci</button>
    </div>
  );

  return (
    <div className="shell">
      {tab === 'home' && (
        <HomeTab profile={profile} measurements={measurements} />
      )}
      {tab === 'history' && (
        <HistoryTab measurements={measurements} goalWeight={profile.obiettivo_kg} />
      )}
      {tab === 'goals' && (
        <GoalsTab profile={profile} measurements={measurements} />
      )}
      {tab === 'profile' && (
        <ProfileTab
          profile={profile}
          user={user}
          measurements={measurements}
          onProfileUpdate={u => setProfile(p => ({ ...p, ...u }))}
        />
      )}

      <BottomNav active={tab} go={setTab} onAdd={() => setShowAdd(true)} />

      {showAdd && (
        <AddWeight
          userId={user.id}
          onClose={() => setShowAdd(false)}
          onSaved={m => {
            setMeasurements(prev =>
              [...prev, m].sort((a, b) => new Date(a.date) - new Date(b.date))
            );
            setShowAdd(false);
          }}
        />
      )}
    </div>
  );
}
