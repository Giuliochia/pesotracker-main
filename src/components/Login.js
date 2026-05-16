import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    setUser(data.user);
  };

  return (
    <div className="card">
      <h2>Accedi</h2>
      <input
        placeholder="Email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      {error && <p className="error">{error}</p>}
      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Accesso...' : 'Login'}
      </button>
    </div>
  );
}

export default Login;
