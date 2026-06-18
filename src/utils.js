export const BMI_INFO = b =>
  b < 18.5 ? { lbl: 'Sottopeso', color: '#5352ED' } :
  b < 25   ? { lbl: 'Normopeso', color: '#00FF41' } :
  b < 30   ? { lbl: 'Sovrappeso', color: '#FFA502' } :
             { lbl: 'Obesità',   color: '#FF4444' };

export function calcEta(dataNascita) {
  if (!dataNascita) return null;
  const oggi = new Date();
  const nasc = new Date(dataNascita);
  let eta = oggi.getFullYear() - nasc.getFullYear();
  const m = oggi.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && oggi.getDate() < nasc.getDate())) eta--;
  return eta;
}

export function calcTDEE(peso, altezza, eta, sesso, attivita) {
  if (!eta || !sesso || !peso || !altezza) return null;
  const bmr = sesso === 'F'
    ? 10 * peso + 6.25 * altezza - 5 * eta - 161
    : 10 * peso + 6.25 * altezza - 5 * eta + 5;
  const mult = { sedentario: 1.2, leggero: 1.375, moderato: 1.55, attivo: 1.725, estremo: 1.9 };
  return Math.round(bmr * (mult[attivita] || 1.55));
}
