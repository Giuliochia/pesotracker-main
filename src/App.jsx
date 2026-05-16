import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div className="splash">
      <div className="splash-logo">
        <div className="splash-ring-outer" />
        <span className="splash-bolt">⚡</span>
      </div>
      <div className="splash-name">PESO TRACKER</div>
    </div>
  );

  return user ? <Dashboard user={user} /> : <Auth setUser={setUser} />;
}
