import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { crashed: false }; }
  static getDerivedStateFromError() { return { crashed: true }; }
  render() {
    if (this.state.crashed) return (
      <div className="splash">
        <div style={{ fontSize: '2rem', marginBottom: 16 }}>⚠️</div>
        <div style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 20, textAlign: 'center', padding: '0 24px' }}>
          Qualcosa è andato storto. Ricarica l&apos;app.
        </div>
        <button className="btn-exit-sm" onClick={() => window.location.reload()}>RICARICA</button>
      </div>
    );
    return this.props.children;
  }
}

export default function App() {
  const [user, setUser]       = useState(null);
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

  return (
    <ErrorBoundary>
      {user ? <Dashboard user={user} /> : <Auth setUser={setUser} />}
    </ErrorBoundary>
  );
}
