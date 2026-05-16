import React, { useState, useEffect } from 'react';
import WeightForm from './WeightForm';
import WeightChart from './WeightChart';
import { supabase } from '../supabaseClient';

function Profile({ user, setUser }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setProfile(data);
        setLoading(false);
      });
  }, [user]);

  const addWeight = async (weight) => {
    const newMeasurements = [
      ...(profile.measurements || []),
      { weight: parseFloat(weight), date: new Date().toISOString() }
    ];
    setProfile(prev => ({ ...prev, measurements: newMeasurements }));
    await supabase
      .from('profiles')
      .update({ measurements: newMeasurements })
      .eq('id', user.id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) return <div className="app"><p>Caricamento profilo...</p></div>;
  if (!profile) return <div className="app"><p>Profilo non trovato.</p></div>;

  const measurements = profile.measurements || [];
  const lastWeight = measurements.length > 0
    ? parseFloat(measurements[measurements.length - 1].weight)
    : parseFloat(profile.initial_weight);
  const bmi = profile.height
    ? (lastWeight / ((parseFloat(profile.height) / 100) ** 2)).toFixed(1)
    : '-';
  const kgRemaining = profile.goal_weight
    ? (parseFloat(profile.goal_weight) - lastWeight).toFixed(1)
    : '-';

  return (
    <div className="profile">
      <h2>Ciao {user.email}</h2>

      <div className="stats-grid">
        <div className="stat-box">
          <span className="stat-label">Peso iniziale</span>
          <span className="stat-value">{profile.initial_weight} kg</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Obiettivo</span>
          <span className="stat-value">{profile.goal_weight} kg</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Ultimo peso</span>
          <span className="stat-value">{lastWeight} kg</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">BMI</span>
          <span className="stat-value">{bmi}</span>
        </div>
        <div className="stat-box wide">
          <span className="stat-label">Kg mancanti all'obiettivo</span>
          <span className="stat-value highlight">{kgRemaining} kg</span>
        </div>
      </div>

      <WeightForm addWeight={addWeight} />
      <WeightChart data={measurements} goalWeight={profile.goal_weight} />

      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Profile;
