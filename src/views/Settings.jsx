/**
 * Settings View — Advanced configuration for formula, patient modifiers,
 * clinical factors, safety limits, and UI preferences.
 */
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export default function Settings() {
  const { state, dispatch, showToast } = useApp();
  const { settings } = state;
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const updateSetting = (key, value) => {
    dispatch({ type: 'SET_SETTINGS', payload: { [key]: value } });
  };

  const handleResetAll = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    dispatch({ type: 'RESET_SETTINGS' });
    setConfirmReset(false);
    showToast('Settings reset to defaults', 'success');
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>
        Advanced Settings
      </h2>

      {/* ---- FORMULA SETTINGS ---- */}
      <SettingsSection title="Formula Settings">
        {/* Default Constant */}
        <SettingRow label="Default Constant">
          <div className="segment-group" style={{ width: 'auto' }}>
            {[8, 9, 10].map((c) => (
              <button
                key={c}
                className={`segment-btn${settings.defaultConstant === c ? ' active' : ''}`}
                onClick={() => updateSetting('defaultConstant', c)}
                style={{ padding: '6px 16px', minHeight: 36, fontSize: 13 }}
              >
                C = {c}
              </button>
            ))}
          </div>
        </SettingRow>

        {/* Dosing Basis */}
        <SettingRow label="Dosing Basis">
          <div className="segment-group" style={{ width: 'auto' }}>
            <button
              className={`segment-btn${settings.dosingBasis === 'tbw' ? ' active' : ''}`}
              onClick={() => updateSetting('dosingBasis', 'tbw')}
              style={{ padding: '6px 14px', minHeight: 36, fontSize: 13 }}
            >
              Total Body Weight
            </button>
            <button
              className={`segment-btn${settings.dosingBasis === 'lbw' ? ' active' : ''}`}
              onClick={() => updateSetting('dosingBasis', 'lbw')}
              style={{ padding: '6px 14px', minHeight: 36, fontSize: 13 }}
            >
              Lean Body Weight
            </button>
          </div>
        </SettingRow>

        {/* Drug Concentration */}
        <SettingRow label="Drug Concentration">
          <div className="segment-group" style={{ width: 'auto', flexWrap: 'wrap' }}>
            {[
              { value: '0.5heavy', label: '0.5% Heavy' },
              { value: '0.5plain', label: '0.5% Plain' },
              { value: '0.75', label: '0.75%' },
            ].map((opt) => (
              <button
                key={opt.value}
                className={`segment-btn${settings.drugConcentration === opt.value ? ' active' : ''}`}
                onClick={() => updateSetting('drugConcentration', opt.value)}
                style={{ padding: '6px 12px', minHeight: 36, fontSize: 13 }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {settings.drugConcentration === '0.75' && (
            <div className="alert-banner alert-warning" style={{ marginTop: 8 }}>
              <ExclamationTriangleIcon style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} />
              <span>0.75% concentration has higher potency — use with caution</span>
            </div>
          )}
        </SettingRow>
      </SettingsSection>

      {/* ---- PATIENT PROFILE MODIFIERS ---- */}
      <SettingsSection title="Patient Profile Modifiers">
        <ToggleRow
          label="Auto-apply elderly reduction (age &gt;65)"
          value={settings.autoElderlyReduction}
          onChange={(v) => updateSetting('autoElderlyReduction', v)}
        />
        <ToggleRow
          label="Auto-apply pregnancy reduction"
          value={settings.autoPregnancyReduction}
          onChange={(v) => updateSetting('autoPregnancyReduction', v)}
        />
      </SettingsSection>

      {/* ---- ADVANCED CLINICAL FACTORS (collapsible) ---- */}
      <div className="card" style={{ padding: 0, marginBottom: 16, overflow: 'hidden' }}>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '16px 20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Advanced Clinical Factors
          {showAdvanced ? (
            <ChevronUpIcon style={{ width: 18, height: 18, color: 'var(--text-secondary)' }} />
          ) : (
            <ChevronDownIcon style={{ width: 18, height: 18, color: 'var(--text-secondary)' }} />
          )}
        </button>

        <div className={`collapsible-content${showAdvanced ? ' open' : ''}`}>
          <div style={{ padding: '0 20px 20px' }}>
            {/* Patient Position */}
            <SettingRow label="Patient Position" noBorder>
              <div className="segment-group" style={{ width: 'auto', flexWrap: 'wrap' }}>
                {['supine', 'sitting', 'lateral'].map((pos) => (
                  <button
                    key={pos}
                    className={`segment-btn${settings.patientPosition === pos ? ' active' : ''}`}
                    onClick={() => updateSetting('patientPosition', pos)}
                    style={{ padding: '6px 14px', minHeight: 36, fontSize: 13, textTransform: 'capitalize' }}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </SettingRow>

            {/* Surgery Type */}
            <SettingRow label="Surgery Type" noBorder>
              <div className="segment-group" style={{ width: 'auto', flexWrap: 'wrap' }}>
                {[
                  { value: 'lower_limb', label: 'Lower limb' },
                  { value: 'lscs', label: 'LSCS' },
                  { value: 'abdominal', label: 'Abdominal' },
                  { value: 'perineal', label: 'Perineal' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    className={`segment-btn${settings.surgeryType === opt.value ? ' active' : ''}`}
                    onClick={() => updateSetting('surgeryType', opt.value)}
                    style={{ padding: '6px 12px', minHeight: 36, fontSize: 12 }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </SettingRow>

            {/* Baricity */}
            <SettingRow label="Baricity" noBorder>
              <div className="segment-group" style={{ width: 'auto' }}>
                {['hyperbaric', 'isobaric'].map((b) => (
                  <button
                    key={b}
                    className={`segment-btn${settings.baricity === b ? ' active' : ''}`}
                    onClick={() => updateSetting('baricity', b)}
                    style={{ padding: '6px 16px', minHeight: 36, fontSize: 13, textTransform: 'capitalize' }}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </SettingRow>
          </div>
        </div>
      </div>

      {/* ---- SAFETY LIMITS ---- */}
      <SettingsSection title="Safety Limits">
        <SettingRow label="Min dose threshold (mL)">
          <input
            type="number"
            className="input-field"
            value={settings.minDose}
            onChange={(e) => updateSetting('minDose', parseFloat(e.target.value) || 1.0)}
            step="0.1"
            min="0.5"
            max="3.0"
            aria-label="Minimum dose threshold"
            style={{ width: 100, textAlign: 'center' }}
          />
        </SettingRow>
        <SettingRow label="Max dose threshold (mL)">
          <input
            type="number"
            className="input-field"
            value={settings.maxDose}
            onChange={(e) => updateSetting('maxDose', parseFloat(e.target.value) || 4.0)}
            step="0.1"
            min="2.0"
            max="5.0"
            aria-label="Maximum dose threshold"
            style={{ width: 100, textAlign: 'center' }}
          />
        </SettingRow>
        <ToggleRow
          label="Show safety warnings"
          value={settings.showWarning}
          onChange={(v) => updateSetting('showWarning', v)}
        />
      </SettingsSection>

      {/* ---- UI PREFERENCES ---- */}
      <SettingsSection title="UI Preferences">
        <SettingRow label="Default Theme">
          <div className="segment-group" style={{ width: 'auto' }}>
            {['light', 'dark', 'system'].map((t) => (
              <button
                key={t}
                className={`segment-btn${settings.theme === t ? ' active' : ''}`}
                onClick={() => updateSetting('theme', t)}
                style={{ padding: '6px 14px', minHeight: 36, fontSize: 13, textTransform: 'capitalize' }}
              >
                {t}
              </button>
            ))}
          </div>
        </SettingRow>

        <SettingRow label="Unit Preference">
          <div className="segment-group" style={{ width: 'auto' }}>
            <button
              className={`segment-btn${settings.units === 'metric' ? ' active' : ''}`}
              onClick={() => updateSetting('units', 'metric')}
              style={{ padding: '6px 14px', minHeight: 36, fontSize: 13 }}
            >
              Metric (cm/kg)
            </button>
            <button
              className={`segment-btn${settings.units === 'imperial' ? ' active' : ''}`}
              onClick={() => updateSetting('units', 'imperial')}
              style={{ padding: '6px 14px', minHeight: 36, fontSize: 13 }}
            >
              Imperial (ft-in/lbs)
            </button>
          </div>
        </SettingRow>

        <ToggleRow
          label="Enable haptic feedback (mobile)"
          value={settings.hapticFeedback}
          onChange={(v) => updateSetting('hapticFeedback', v)}
        />
      </SettingsSection>

      {/* Reset Button */}
      <div style={{ marginTop: 8, marginBottom: 32 }}>
        <button
          className="btn-ghost"
          onClick={handleResetAll}
          style={{
            width: '100%',
            color: confirmReset ? 'var(--danger)' : 'var(--text-secondary)',
            borderColor: confirmReset ? 'var(--danger)' : 'var(--border)',
          }}
        >
          {confirmReset ? '⚠ Confirm Reset — tap again' : 'Reset All Settings'}
        </button>
        {confirmReset && (
          <button
            className="btn-ghost"
            onClick={() => setConfirmReset(false)}
            style={{ width: '100%', marginTop: 8 }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

/* ---- Reusable sub-components ---- */

function SettingsSection({ title, children }) {
  return (
    <div className="card" style={{ padding: 20, marginBottom: 16 }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', marginBottom: 16 }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function SettingRow({ label, children, noBorder = false }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        paddingBottom: noBorder ? 12 : 16,
        marginBottom: noBorder ? 0 : 16,
        borderBottom: noBorder ? 'none' : '1px solid var(--border)',
      }}
    >
      <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', flex: '1 1 200px' }}>
        {label}
      </label>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function ToggleRow({ label, value, onChange }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 16,
        marginBottom: 16,
        borderBottom: '1px solid var(--border)',
        cursor: 'pointer',
      }}
      onClick={() => onChange(!value)}
    >
      <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer' }}>
        {label}
      </label>
      <div
        className={`toggle-track${value ? ' active' : ''}`}
        role="switch"
        aria-checked={value}
        aria-label={label}
      >
        <div className="toggle-thumb" />
      </div>
    </div>
  );
}
