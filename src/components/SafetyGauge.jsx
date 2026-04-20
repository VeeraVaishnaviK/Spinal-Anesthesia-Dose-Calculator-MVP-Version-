/**
 * SafetyGauge — Horizontal bar showing dose safety zones with animated pointer.
 *
 * Zones:
 *   0–1.5 mL = gray "Sub-therapeutic"
 *   1.5–2.0 mL = amber "Low"
 *   2.0–3.0 mL = green "Optimal"
 *   3.0–3.5 mL = amber "High"
 *   > 3.5 mL = red "Unsafe"
 */
import { useEffect, useState } from 'react';

const ZONES = [
  { min: 0, max: 1.5, color: '#9CA3AF', label: 'Sub-therapeutic' },
  { min: 1.5, max: 2.0, color: '#F59E0B', label: 'Low' },
  { min: 2.0, max: 3.0, color: '#10B981', label: 'Optimal' },
  { min: 3.0, max: 3.5, color: '#F59E0B', label: 'High' },
  { min: 3.5, max: 4.5, color: '#EF4444', label: 'Unsafe' },
];

const GAUGE_MAX = 4.5;

export default function SafetyGauge({ dose }) {
  const [animatedPos, setAnimatedPos] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const clamped = Math.max(0, Math.min(dose, GAUGE_MAX));
      setAnimatedPos((clamped / GAUGE_MAX) * 100);
    }, 100);
    return () => clearTimeout(timer);
  }, [dose]);

  // Determine current zone
  const currentZone = ZONES.find((z) => dose >= z.min && dose < z.max) || ZONES[ZONES.length - 1];

  return (
    <div style={{ width: '100%' }}>
      {/* Zone labels */}
      <div style={{ display: 'flex', marginBottom: 6, gap: 2 }}>
        {ZONES.map((zone) => (
          <div
            key={zone.label}
            style={{
              flex: (zone.max - zone.min) / GAUGE_MAX,
              textAlign: 'center',
              fontSize: 10,
              fontWeight: 500,
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {zone.label}
          </div>
        ))}
      </div>

      {/* Gauge bar */}
      <div className="gauge-container">
        {ZONES.map((zone) => (
          <div
            key={zone.label}
            className="gauge-segment"
            style={{
              flex: (zone.max - zone.min) / GAUGE_MAX,
              background: zone.color,
              opacity: 0.85,
            }}
          />
        ))}
      </div>

      {/* Pointer */}
      <div style={{ position: 'relative', height: 20, marginTop: 2 }}>
        <div
          className="gauge-pointer"
          style={{
            left: `${animatedPos}%`,
            position: 'absolute',
            top: 0,
            transition: 'left 0.5s ease',
            transform: 'translateX(-50%)',
          }}
        >
          <svg width="16" height="12" viewBox="0 0 16 12" fill={currentZone.color}>
            <polygon points="8,0 16,12 0,12" />
          </svg>
        </div>
      </div>

      {/* Dose marker label */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: 4,
        }}
      >
        <span className={`badge badge-${currentZone.color === '#10B981' ? 'green' : currentZone.color === '#F59E0B' ? 'amber' : currentZone.color === '#EF4444' ? 'red' : 'blue'}`}>
          {currentZone.color === '#10B981' ? '🟢' : currentZone.color === '#F59E0B' ? '🟡' : currentZone.color === '#EF4444' ? '🔴' : '⚪'}{' '}
          {currentZone.label}
        </span>
      </div>
    </div>
  );
}
