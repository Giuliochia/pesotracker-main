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

  const labels = measurements.map(m =>
    new Date(m.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })
  );
  const weights = measurements.map(m => +m.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const pad  = Math.max(1, (maxW - minW) * 0.3);

  const gradientPlugin = {
    id: 'customGradient',
    beforeDraw(chart) {
      const { ctx, chartArea } = chart;
      if (!chartArea) return;
      const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
      gradient.addColorStop(0,   'rgba(83,82,237,0.55)');
      gradient.addColorStop(0.5, 'rgba(0,255,65,0.25)');
      gradient.addColorStop(1,   'rgba(0,255,65,0)');
      chart.data.datasets[0].backgroundColor = gradient;
      chart.update('none');
    },
  };

  const data = {
    labels,
    datasets: [
      {
        label: 'Peso',
        data: weights,
        borderColor: ctx => {
          const chart = ctx.chart;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return '#00FF41';
          const g = c.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
          g.addColorStop(0, '#5352ED');
          g.addColorStop(1, '#00FF41');
          return g;
        },
        backgroundColor: 'rgba(83,82,237,0.3)',
        tension: 0.45,
        fill: true,
        pointBackgroundColor: ctx => {
          const i = ctx.dataIndex;
          const n = weights.length;
          if (i === n - 1) return '#00FF41';
          if (i === 0)     return '#5352ED';
          return '#7B7AFF';
        },
        pointBorderColor: '#000',
        pointBorderWidth: 2,
        pointRadius: ctx => ctx.dataIndex === weights.length - 1 ? 6 : 4,
        pointHoverRadius: 8,
        pointShadowBlur: 10,
        borderWidth: 2.5,
      },
      {
        label: 'Obiettivo',
        data: measurements.map(() => +goalWeight),
        borderColor: 'rgba(255,165,0,0.35)',
        borderDash: [6, 4],
        backgroundColor: 'transparent',
        pointRadius: 0,
        tension: 0,
        borderWidth: 1.5,
      },
    ],
  };

  const opts = {
    responsive: true,
    maintainAspectRatio: true,
    animation: { duration: 800, easing: 'easeInOutQuart' },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(5,5,5,0.96)',
        borderColor: 'rgba(83,82,237,0.5)',
        borderWidth: 1,
        titleColor: '#7B7AFF',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          title: items => items[0].label,
          label: c => c.datasetIndex === 0
            ? ` ⚖️  ${c.parsed.y} kg`
            : ` 🎯  Obiettivo: ${c.parsed.y} kg`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'rgba(255,255,255,0.3)',
          font: { size: 10 },
          maxTicksLimit: 6,
          maxRotation: 0,
        },
        grid: { color: 'rgba(255,255,255,0.03)' },
        border: { color: 'rgba(255,255,255,0.06)' },
      },
      y: {
        min: Math.max(0, minW - pad),
        max: maxW + pad,
        ticks: {
          color: 'rgba(255,255,255,0.3)',
          font: { size: 10 },
          callback: v => `${v} kg`,
        },
        grid: { color: 'rgba(255,255,255,0.03)' },
        border: { color: 'rgba(255,255,255,0.06)' },
      },
    },
  };

  return <Line data={data} options={opts} plugins={[gradientPlugin]} />;
}
