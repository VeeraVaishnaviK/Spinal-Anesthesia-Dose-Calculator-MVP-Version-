/**
 * ResultCard — Displays calculated dose result with safety gauge, block level,
 * timing estimates, alert banners, and action buttons.
 */
import { useApp } from '../context/AppContext';
import SafetyGauge from './SafetyGauge';
import {
  BookmarkIcon,
  ShareIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

export default function ResultCard({ result, onSave, onRecalculate }) {
  const { state } = useApp();
  const isDark = state.settings.theme === 'dark';

  if (!result) return null;

  const {
    adjustedDose,
    rawDose,
    bmi,
    bmiCategory,
    blockLevel,
    onset,
    duration,
    safety,
    flags,
    reductions,
    isElderly,
    isPregnant,
    usedLBW,
    lbw,
    effectiveWeight,
  } = result;

  // Generate flags for alert banners
  const alerts = [];
  if (isElderly && reductions.includes('elderly')) {
    alerts.push({ type: 'info', icon: InformationCircleIcon, text: 'Dose reduced 10% for patient age >65' });
  }
  if (isPregnant && reductions.includes('pregnancy')) {
    alerts.push({ type: 'purple', icon: InformationCircleIcon, text: 'Dose reduced 15% for obstetric patient' });
  }
  if (bmi >= 30) {
    alerts.push({ type: 'warning', icon: ExclamationTriangleIcon, text: 'Consider lean body weight dosing — review with senior' });
  }
  if (safety.warnings.length > 0) {
    safety.warnings.forEach((w) => {
      alerts.push({ type: 'danger', icon: ExclamationTriangleIcon, text: w });
    });
  }

  return (
    <div
      className="result-slide-in"
      style={{
        background: 'var(--result-bg)',
        border: '1px solid var(--result-border)',
        borderRadius: 16,
        padding: 24,
        marginTop: 16,
        transition: 'background-color 0.3s ease',
      }}
    >
      {/* Main Output */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4 }}>
          Recommended Bupivacaine Dose
        </p>
        <p className="dose-value" style={{ color: 'var(--primary)', marginBottom: 4 }}>
          {adjustedDose} mL
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 8 }}>
          Bupivacaine 0.5% Heavy
        </p>
        <span className={`badge badge-${bmiCategory.color}`}>
          BMI {bmi} — {bmiCategory.label}
        </span>
      </div>

      {/* Safety Gauge */}
      <div style={{ marginBottom: 20 }}>
        <SafetyGauge dose={adjustedDose} />
      </div>

      {/* Info Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <InfoTile label="Block Level" value={blockLevel.split(' (')[0]} sub={blockLevel.includes('(') ? blockLevel.split(' (')[1]?.replace(')', '') : ''} />
        <InfoTile label="Onset Time" value={onset} />
        <InfoTile label="Duration" value={duration} />
        <InfoTile label="Baricity" value="Hyperbaric" />
        {usedLBW && lbw && (
          <InfoTile label="Lean Body Wt" value={`${lbw} kg`} />
        )}
        <InfoTile label="Raw Dose" value={`${rawDose} mL`} />
      </div>

      {/* Alert Banners */}
      {alerts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {alerts.map((alert, i) => {
            const Icon = alert.icon;
            return (
              <div key={i} className={`alert-banner alert-${alert.type}`}>
                <Icon style={{ width: 18, height: 18, flexShrink: 0, marginTop: 1 }} />
                <span>{alert.text}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn-ghost" onClick={onSave} style={{ flex: 1 }}>
          <BookmarkIcon style={{ width: 16, height: 16 }} />
          Save to Case Log
        </button>
        <button className="btn-ghost" onClick={onRecalculate} style={{ flex: 1 }}>
          <ArrowPathIcon style={{ width: 16, height: 16 }} />
          Recalculate
        </button>
      </div>
    </div>
  );
}

function InfoTile({ label, value, sub }) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: 10,
        padding: '10px 14px',
        border: '1px solid var(--border)',
      }}
    >
      <p style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{value}</p>
      {sub && <p style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 1 }}>{sub}</p>}
    </div>
  );
}
