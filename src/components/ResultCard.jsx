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
        background: 'var(--surface)',
        border: `1.5px solid var(--border)`,
        borderRadius: 20,
        padding: 24,
        marginTop: 16,
        boxShadow: '0 8px 32px rgba(216, 27, 96, 0.04)',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle decorative background element */}
      <div style={{
        position: 'absolute',
        top: -60,
        right: -60,
        width: 140,
        height: 140,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(216, 27, 96, 0.03) 0%, rgba(216, 27, 96, 0) 100%)',
        zIndex: 0
      }} />

      {/* Main Output */}
      <div style={{
        textAlign: 'center',
        marginBottom: 24,
        padding: 24,
        background: 'var(--result-bg)',
        borderRadius: 20,
        border: '1.5px solid var(--result-border)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Patient Identity */}
        {(state.currentPatient.name || state.currentPatient.pid) && (
          <div style={{ marginBottom: 16, pb: 16, borderBottom: '1px solid rgba(216, 27, 96, 0.1)' }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              {state.currentPatient.name || 'Anonymous Patient'}
            </p>
            {state.currentPatient.pid && (
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                PID: {state.currentPatient.pid}
              </p>
            )}
          </div>
        )}

        <p style={{
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--primary)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 8
        }}>
          Recommended Dose
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
          <span className="dose-value" style={{ color: 'var(--primary)', fontSize: 48, fontWeight: 800 }}>{adjustedDose}</span>
          <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)', marginLeft: 6 }}>mL</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, fontWeight: 500 }}>
          Bupivacaine 0.5% Heavy
        </p>
        <div style={{ marginTop: 12 }}>
          <span className={`badge badge-${bmiCategory.color}`} style={{ padding: '6px 12px' }}>
            BMI {bmi} — {bmiCategory.label}
          </span>
        </div>
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
