import React, { useState } from 'react';

function WeightForm({ addWeight }) {
  const [weight, setWeight] = useState('');

  return (
    <div className="weight-form">
      <input placeholder="Inserisci peso" value={weight} onChange={e => setWeight(e.target.value)} />
      <button onClick={() => { addWeight(weight); setWeight(''); }}>Aggiungi</button>
    </div>
  );
}

export default WeightForm;