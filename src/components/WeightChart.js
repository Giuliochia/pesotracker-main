import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

function WeightChart({ data, goalWeight }) {
  if (data.length === 0) return <p className="empty-chart">Nessun peso inserito ancora.</p>;

  const goalLine = goalWeight
    ? data.map(() => parseFloat(goalWeight))
    : null;

  const chartData = {
    labels: data.map(d => new Date(d.date).toLocaleDateString('it-IT')),
    datasets: [
      {
        label: 'Peso (kg)',
        data: data.map(d => d.weight),
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.15)',
        tension: 0.4,
        pointBackgroundColor: '#FFD700',
        pointRadius: 4,
      },
      ...(goalLine ? [{
        label: 'Obiettivo',
        data: goalLine,
        borderColor: '#4caf50',
        borderDash: [6, 4],
        backgroundColor: 'transparent',
        pointRadius: 0,
        tension: 0,
      }] : []),
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#fff' } },
    },
    scales: {
      x: { ticks: { color: '#aaa' }, grid: { color: '#333' } },
      y: { ticks: { color: '#aaa' }, grid: { color: '#333' } },
    },
  };

  return <div className="chart"><Line data={chartData} options={options} /></div>;
}

export default WeightChart;
