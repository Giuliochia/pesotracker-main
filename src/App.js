import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import { supabase } from './supabaseClient';
import './styles/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="app"><p>Caricamento...</p></div>;

  return (
    <div className="app">
      {!user ? (
        <>
          <h1>Peso Tracker</h1>
          <Login setUser={setUser} />
          <Register setUser={setUser} />
        </>
      ) : (
        <Profile user={user} setUser={setUser} />
      )}
    </div>
  );
}

export default App;
