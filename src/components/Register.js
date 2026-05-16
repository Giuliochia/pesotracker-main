import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

function Register({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [initialWeight, setInitialWeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [height, setHeight] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError('');
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) {
      setLoading(false);
      return setError(authError.message);
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: data.user.id,
        initial_weight: parseFloat(initialWeight),
        goal_weight: parseFloat(goalWeight),
        height: parseFloat(height),
        measurements: []
      }]);

    setLoading(false);
    if (profileError) return setError(profileError.message);
    setUser(data.user);
  };

  return (
    <div className="card">
      <h2>Registrati</h2>
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
      <input
        placeholder="Peso iniziale (kg)"
        type="number"
        value={initialWeight}
        onChange={e => setInitialWeight(e.target.value)}
      />
      <input
        placeholder="Obiettivo peso (kg)"
        type="number"
        value={goalWeight}
        onChange={e => setGoalWeight(e.target.value)}
      />
      <input
        placeholder="Altezza (cm)"
        type="number"
        value={height}
        onChange={e => setHeight(e.target.value)}
      />
      {error && <p className="error">{error}</p>}
      <button onClick={handleRegister} disabled={loading}>
        {loading ? 'Registrazione...' : 'Registrati'}
      </button>
    </div>
  );
}

export default Register;
