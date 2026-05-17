import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Tooltip, Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const movingAvg = (weights, win) =>
  weights.map((_, i) => {
    const slice = weights.slice(Math.max(0, i - win + 1), i + 1);
    return +(slice.reduce((s, v) => s + v, 0) / slice.length).toFixed(2);
  });

const linearTrend = (weights) => {
  const n = weights.length;
  if (n < 2) return weights.slice();
  const sumX = (n * (n - 1)) / 2;
  const sumY = weights.reduce((s, v) => s + v, 0);
  const sumXY = weights.reduce((s, v, i) => s + i * v, 0);
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return weights.map((_, i) => +(intercept + slope * i).toFixed(2));
};

const getGradient = (ctx, chartArea) => {
  if (!chartArea) return 'rgba(83,82,237,0.3)';
  const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  g.addColorStop(0, 'rgba(83,82,237,0.45)');
  g.addColorStop(0.5, 'rgba(0,255,65,0.15)');
  g.addColorStop(1, 'rgba(0,255,65,0)');
  return g;
};

export default function AdvancedChart({ measurements, goalWeight, showAvg = true, showTrend = true }) {
  const weights = useMemo(() => measurements.map(m => +m.weight), [measurements]);
  const labels  = useMemo(() =>
    measurements.map(m =>
      new Date(m.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })
    ), [measurements]);

  const avg7 = useMemo(() => movingAvg(weights, 7), [weights]);
  const trend = useMemo(() => linearTrend(weights), [weights]);

  const datasets = [
    {
      label: 'Peso',
      data: weights,
      borderColor: ctx => {
        const { ctx: c, chartArea, data } = ctx.chart;
        if (!chartArea || !data.datasets[0]?.data?.length) return '#5352ED';
        const g = c.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
        g.addColorStop(0, '#5352ED');
        g.addColorStop(1, '#00FF41');
        return g;
      },
      backgroundColor: ctx => {
        const { ctx: c, chartArea } = ctx.chart;
        return getGradient(c, chartArea);
      },
      fill: true,
      tension: 0.4,
      pointRadius: weights.length > 20 ? 0 : 3,
      pointHoverRadius: 5,
      pointBackgroundColor: '#00FF41',
      pointBorderColor: '#00FF41',
      borderWidth: 2,
      order: 1,
    },
  ];

  if (showAvg && weights.length >= 3) {
    datasets.push({
      label: 'Media 7gg',
      data: avg7,
      borderColor: 'rgba(255,165,2,0.85)',
      borderDash: [5, 3],
      borderWidth: 1.5,
      pointRadius: 0,
      fill: false,
      tension: 0.4,
      order: 2,
    });
  }

  if (showTrend && weights.length >= 4) {
    datasets.push({
      label: 'Trend',
      data: trend,
      borderColor: 'rgba(83,82,237,0.6)',
      borderDash: [8, 4],
      borderWidth: 1.5,
      pointRadius: 0,
      fill: false,
      tension: 0,
      order: 3,
    });
  }

  if (goalWeight) {
    datasets.push({
      label: 'Obiettivo',
      data: Array(weights.length).fill(+goalWeight),
      borderColor: 'rgba(255,68,68,0.5)',
      borderDash: [4, 4],
      borderWidth: 1.5,
      pointRadius: 0,
      fill: false,
      tension: 0,
      order: 4,
    });
  }

  const allVals = [...weights, ...(goalWeight ? [+goalWeight] : [])];
  const minV = Math.min(...allVals) - 1;
  const maxV = Math.max(...allVals) + 1;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 600, easing: 'easeInOutQuart' },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(10,10,10,0.9)',
        borderColor: 'rgba(0,255,65,0.3)',
        borderWidth: 1,
        titleColor: 'rgba(255,255,255,0.6)',
        bodyColor: '#fff',
        padding: 10,
        callbacks: {
          label: ctx => {
            const label = ctx.dataset.label;
            return ` ${label}: ${ctx.parsed.y} kg`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.03)' },
        ticks: {
          color: 'rgba(255,255,255,0.3)',
          font: { size: 10 },
          maxTicksLimit: 6,
          maxRotation: 0,
        },
      },
      y: {
        min: minV,
        max: maxV,
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: {
          color: 'rgba(255,255,255,0.3)',
          font: { size: 10 },
          callback: v => `${v} kg`,
        },
      },
    },
  };

  if (!measurements.length) {
    return (
      <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>
        Nessun dato
      </div>
    );
  }

  return (
    <div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 20, height: 2, background: 'linear-gradient(90deg,#5352ED,#00FF41)' }} />
          <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)' }}>Peso</span>
        </div>
        {showAvg && weights.length >= 3 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 20, height: 2, background: 'rgba(255,165,2,0.85)', borderTop: '2px dashed rgba(255,165,2,0.85)' }} />
            <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)' }}>Media 7gg</span>
          </div>
        )}
        {showTrend && weights.length >= 4 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 20, height: 2, borderTop: '2px dashed rgba(83,82,237,0.6)' }} />
            <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)' }}>Trend</span>
          </div>
        )}
        {goalWeight && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 20, height: 2, borderTop: '2px dashed rgba(255,68,68,0.5)' }} />
            <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)' }}>Obiettivo</span>
          </div>
        )}
      </div>
      <div style={{ height: 200 }}>
        <Line data={{ labels, datasets }} options={options} />
      </div>
    </div>
  );
}
