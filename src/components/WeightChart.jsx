import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

export default function WeightChart({ measurements, goalWeight }) {
  if (!measurements || !measurements.length) return (
    <div className="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(0,255,65,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
      <p className="empty-txt">Aggiungi misurazioni per vedere il grafico</p>
    </div>
  );

  const data = {
    labels: measurements.map(m =>
      new Date(m.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })
    ),
    datasets: [
      {
        label: 'Peso',
        data: measurements.map(m => +m.weight),
        borderColor: '#00FF41',
        backgroundColor: ctx => {
          const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 220);
          g.addColorStop(0, 'rgba(0,255,65,0.2)');
          g.addColorStop(1, 'rgba(0,255,65,0)');
          return g;
        },
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#00FF41',
        pointBorderColor: '#000',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 7,
        borderWidth: 2,
      },
      {
        label: 'Obiettivo',
        data: measurements.map(() => goalWeight),
        borderColor: 'rgba(255,255,255,0.12)',
        borderDash: [5, 5],
        backgroundColor: 'transparent',
        pointRadius: 0,
        tension: 0,
        borderWidth: 1,
      },
    ],
  };

  const opts = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          color: 'rgba(255,255,255,0.25)',
          font: { size: 10, family: '-apple-system, SF Pro Display, Segoe UI, sans-serif' },
          boxWidth: 10,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.95)',
        borderColor: 'rgba(0,255,65,0.25)',
        borderWidth: 1,
        titleColor: '#00FF41',
        bodyColor: '#fff',
        padding: 10,
        callbacks: { label: c => ` ${c.parsed.y} kg` },
      },
    },
    scales: {
      x: {
        ticks: { color: 'rgba(255,255,255,0.25)', font: { size: 10 } },
        grid: { color: 'rgba(0,255,65,0.04)' },
        border: { color: 'rgba(0,255,65,0.1)' },
      },
      y: {
        ticks: { color: 'rgba(255,255,255,0.25)', font: { size: 10 } },
        grid: { color: 'rgba(0,255,65,0.04)' },
        border: { color: 'rgba(0,255,65,0.1)' },
      },
    },
  };

  return <Line data={data} options={opts} />;
}
