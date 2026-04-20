/**
 * GraphView — Interactive charts for Dose vs Height and BMI vs Risk.
 * Uses Chart.js via react-chartjs-2.
 */
import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Title, Tooltip, Legend);

export default function GraphView() {
  const { state } = useApp();
  const isDark = state.settings.theme === 'dark';
  const textColor = isDark ? '#94A3B8' : '#6B7280';
  const gridColor = isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(229, 231, 235, 0.8)';

  // Current patient values for markers
  const currentHeight = parseFloat(state.currentPatient.height) || null;
  const currentWeight = parseFloat(state.currentPatient.weight) || 70;
  const currentBMI = state.calculatedResult?.bmi || null;

  // ---- Chart 1: Dose vs Height ----
  const doseVsHeightData = useMemo(() => {
    const heights = [];
    for (let h = 140; h <= 200; h += 5) heights.push(h);

    const makeSeries = (constant) =>
      heights.map((h) => {
        const dose = 0.06 * h + 0.03 * currentWeight - constant;
        return Math.round(dose * 10) / 10;
      });

    return {
      labels: heights.map(String),
      datasets: [
        {
          label: 'C = 8',
          data: makeSeries(8),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 6,
        },
        {
          label: 'C = 9 (default)',
          data: makeSeries(9),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2.5,
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 6,
        },
        {
          label: 'C = 10',
          data: makeSeries(10),
          borderColor: '#F59E0B',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [currentWeight]);

  const doseVsHeightOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: typeof window !== 'undefined' && window.innerWidth < 640 ? 1.2 : 1.8,
    plugins: {
      title: {
        display: true,
        text: `Dose vs Height (Weight fixed at ${currentWeight} kg)`,
        color: textColor,
        font: { family: 'Inter', size: 14, weight: '600' },
        padding: { bottom: 16 },
      },
      legend: {
        position: 'bottom',
        labels: { color: textColor, font: { family: 'Inter', size: 12 }, padding: 16 },
      },
      tooltip: {
        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        titleColor: isDark ? '#F1F5F9' : '#111928',
        bodyColor: isDark ? '#94A3B8' : '#6B7280',
        borderColor: isDark ? '#334155' : '#E5E7EB',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        titleFont: { family: 'Inter', weight: '600' },
        bodyFont: { family: 'JetBrains Mono', size: 13 },
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} mL`,
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Height (cm)', color: textColor, font: { family: 'Inter', size: 12 } },
        ticks: { color: textColor, font: { family: 'Inter', size: 11 } },
        grid: { color: gridColor },
      },
      y: {
        title: { display: true, text: 'Dose (mL)', color: textColor, font: { family: 'Inter', size: 12 } },
        min: 0.5,
        max: 4.5,
        ticks: { color: textColor, font: { family: 'Inter', size: 11 }, stepSize: 0.5 },
        grid: { color: gridColor },
      },
    },
  }), [textColor, gridColor, currentWeight, isDark]);

  // ---- Chart 2: BMI vs Risk ----
  const bmiRiskData = useMemo(() => {
    const bmis = [];
    for (let b = 15; b <= 45; b += 1) bmis.push(b);

    const adjustments = bmis.map((b) => {
      if (b < 18.5) return 0.95;
      if (b < 25) return 1.0;
      if (b < 30) return 0.95;
      return 0.85;
    });

    return {
      labels: bmis.map(String),
      datasets: [
        {
          label: 'Adjustment Factor',
          data: adjustments,
          borderColor: '#8B5CF6',
          backgroundColor: 'rgba(139, 92, 246, 0.15)',
          borderWidth: 2,
          tension: 0.1,
          pointRadius: bmis.map((b) =>
            currentBMI && Math.round(b) === Math.round(currentBMI) ? 8 : 2
          ),
          pointBackgroundColor: bmis.map((b) =>
            currentBMI && Math.round(b) === Math.round(currentBMI) ? '#EF4444' : '#8B5CF6'
          ),
          fill: true,
        },
      ],
    };
  }, [currentBMI]);

  const bmiRiskOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: typeof window !== 'undefined' && window.innerWidth < 640 ? 1.2 : 1.8,
    plugins: {
      title: {
        display: true,
        text: 'BMI Classification and Dose Adjustment Reference',
        color: textColor,
        font: { family: 'Inter', size: 14, weight: '600' },
        padding: { bottom: 16 },
      },
      legend: {
        position: 'bottom',
        labels: { color: textColor, font: { family: 'Inter', size: 12 }, padding: 16 },
      },
      tooltip: {
        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        titleColor: isDark ? '#F1F5F9' : '#111928',
        bodyColor: isDark ? '#94A3B8' : '#6B7280',
        borderColor: isDark ? '#334155' : '#E5E7EB',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        titleFont: { family: 'Inter', weight: '600' },
        bodyFont: { family: 'JetBrains Mono', size: 13 },
        callbacks: {
          title: (items) => `BMI: ${items[0].label}`,
          label: (ctx) => `Factor: ${ctx.parsed.y}×`,
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'BMI', color: textColor, font: { family: 'Inter', size: 12 } },
        ticks: { color: textColor, font: { family: 'Inter', size: 11 }, maxTicksLimit: 15 },
        grid: { color: gridColor },
      },
      y: {
        title: { display: true, text: 'Adjustment Factor', color: textColor, font: { family: 'Inter', size: 12 } },
        min: 0.7,
        max: 1.2,
        ticks: { color: textColor, font: { family: 'Inter', size: 11 }, stepSize: 0.1 },
        grid: { color: gridColor },
      },
    },
  }), [textColor, gridColor, isDark]);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
        Graph View
      </h2>

      {/* Chart 1 — Dose vs Height */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div className="chart-container">
          <Line data={doseVsHeightData} options={doseVsHeightOptions} />
        </div>
      </div>

      {/* Chart 2 — BMI vs Risk */}
      <div className="card" style={{ padding: 20 }}>
        <div className="chart-container">
          <Line data={bmiRiskData} options={bmiRiskOptions} />
        </div>
      </div>

      {currentHeight && (
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 12, textAlign: 'center' }}>
          Current patient: Height = {currentHeight} cm, Weight = {currentWeight} kg
          {currentBMI ? `, BMI = ${currentBMI}` : ''}
        </p>
      )}
    </div>
  );
}
