/**
 * Calculator View — Core dosage calculation interface.
 * Includes patient parameter inputs, formula settings, and result display.
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import ResultCard from '../components/ResultCard';
import {
  calculateDose,
  calculateBMI,
  getBMICategory,
  feetInchesToCm,
  lbsToKg,
} from '../utils/formula';
import {
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';

export default function Calculator() {
  const { state, dispatch, showToast } = useApp();
  const { currentPatient, calculatedResult, settings } = state;
  const [isCalculating, setIsCalculating] = useState(false);
  const [errors, setErrors] = useState({});
  const [showConstant, setShowConstant] = useState(false);
  const resultRef = useRef(null);

  // BMI auto-calculation with debounce
  const [bmiDisplay, setBmiDisplay] = useState(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      const heightCm = getHeightCm();
      const weightKg = getWeightKg();
      if (heightCm > 0 && weightKg > 0) {
        const bmi = calculateBMI(weightKg, heightCm);
        setBmiDisplay({ value: Math.round(bmi * 10) / 10, category: getBMICategory(bmi) });
      } else {
        setBmiDisplay(null);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [currentPatient.height, currentPatient.weight, currentPatient.heightFeet, currentPatient.heightInches, currentPatient.heightUnit, currentPatient.weightUnit]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleCalculate();
      } else if (e.key === 'Escape') {
        handleReset();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentPatient]);

  const setField = (field, value) => {
    dispatch({ type: 'SET_PATIENT_FIELD', field, value });
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const getHeightCm = () => {
    if (currentPatient.heightUnit === 'ftin') {
      const ft = parseFloat(currentPatient.heightFeet) || 0;
      const inch = parseFloat(currentPatient.heightInches) || 0;
      return feetInchesToCm(ft, inch);
    }
    return parseFloat(currentPatient.height) || 0;
  };

  const getWeightKg = () => {
    if (currentPatient.weightUnit === 'lbs') {
      return lbsToKg(parseFloat(currentPatient.weight) || 0);
    }
    return parseFloat(currentPatient.weight) || 0;
  };

  const validate = () => {
    const errs = {};
    const heightCm = getHeightCm();
    const weightKg = getWeightKg();

    if (!heightCm || heightCm < 140 || heightCm > 200) {
      errs.height = 'Enter value between 140–200 cm';
    }
    if (!weightKg || weightKg < 30 || weightKg > 150) {
      errs.weight = 'Enter value between 30–150 kg';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCalculate = useCallback(() => {
    if (!validate()) {
      showToast('Please enter valid patient data', 'error');
      return;
    }

    setIsCalculating(true);
    dispatch({ type: 'CLEAR_RESULT' });

    // Artificial delay for loading feel
    setTimeout(() => {
      const heightCm = getHeightCm();
      const weightKg = getWeightKg();

      const result = calculateDose({
        heightCm,
        weightKg,
        constant: currentPatient.constant,
        age: currentPatient.includeAge ? currentPatient.age : null,
        sex: currentPatient.sex,
        isPregnant: currentPatient.pregnant,
        useLBW: currentPatient.useLBW || settings.dosingBasis === 'lbw',
        applyElderlyReduction: settings.autoElderlyReduction,
        applyPregnancyReduction: settings.autoPregnancyReduction,
        minDose: settings.minDose,
        maxDose: settings.maxDose,
      });

      dispatch({ type: 'SET_RESULT', payload: result });
      setIsCalculating(false);

      // Scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }, 300);
  }, [currentPatient, settings]);

  const handleReset = () => {
    dispatch({ type: 'RESET_PATIENT' });
    setErrors({});
    setBmiDisplay(null);
  };

  const handleSaveCase = () => {
    if (!calculatedResult) return;

      const nextId = state.caseLog.length + 1;
    const caseEntry = {
      id: `SDC-${String(nextId).padStart(3, '0')}`,
      name: currentPatient.name,
      pid: currentPatient.pid,
      procedure: currentPatient.procedure,
      region: currentPatient.region,
      age: currentPatient.includeAge ? currentPatient.age : null,
      sex: currentPatient.sex,
      heightCm: getHeightCm(),
      weightKg: getWeightKg(),
      bmi: calculatedResult.bmi,
      constant: calculatedResult.constant,
      dose: calculatedResult.adjustedDose,
      rawDose: calculatedResult.rawDose,
      blockLevel: calculatedResult.blockLevel,
      safety: calculatedResult.safety,
      flags: calculatedResult.flags,
      reductions: calculatedResult.reductions,
      timestamp: new Date().toISOString(),
      isPregnant: currentPatient.pregnant,
      usedLBW: calculatedResult.usedLBW,
    };

    dispatch({ type: 'ADD_CASE', payload: caseEntry });
    showToast('Case saved!', 'success');
  };

  // Ripple effect handler
  const handleRipple = (e) => {
    const btn = e.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(btn.clientWidth, btn.clientHeight);
    const radius = diameter / 2;
    const rect = btn.getBoundingClientRect();

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.className = 'ripple';

    const existing = btn.querySelector('.ripple');
    if (existing) existing.remove();
    btn.appendChild(circle);

    setTimeout(() => circle.remove(), 600);
  };

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      {/* Input Card */}
      <section className="card" style={{ padding: 24, marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Patient & Procedure Info
        </h2>

        {/* Name & PID Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Patient Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="Full Name"
              value={currentPatient.name}
              onChange={(e) => setField('name', e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>PID / MRN</label>
            <input
              type="text"
              className="input-field"
              placeholder="ID Number"
              value={currentPatient.pid}
              onChange={(e) => setField('pid', e.target.value)}
            />
          </div>
        </div>

        {/* Age & Sex Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Age (Years)</label>
            <input
              type="number"
              className="input-field"
              placeholder="40"
              value={currentPatient.age}
              onChange={(e) => setField('age', parseInt(e.target.value) || '')}
              inputMode="numeric"
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Sex</label>
            <div className="segment-group" style={{ height: 42 }}>
              {['male', 'female'].map((s) => (
                <button
                  key={s}
                  className={`segment-btn${currentPatient.sex === s ? ' active' : ''}`}
                  onClick={() => setField('sex', s)}
                  style={{ fontSize: 12 }}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Procedure & Region */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Planned Procedure</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. LSCS, Hernia, TKR"
            value={currentPatient.procedure}
            onChange={(e) => setField('procedure', e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Region / Zone of Paraesthesia</label>
          <input
            type="text"
            className="input-field"
            placeholder="Target block level"
            value={currentPatient.region}
            onChange={(e) => setField('region', e.target.value)}
          />
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: 24 }} />

        <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Physical Parameters (Required for Calc)
        </h2>

        {/* Height Input */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Height</label>
            <div className="segment-group" style={{ width: 'auto' }}>
              <button
                className={`segment-btn${currentPatient.heightUnit === 'cm' ? ' active' : ''}`}
                onClick={() => setField('heightUnit', 'cm')}
                style={{ padding: '4px 12px', minHeight: 32, fontSize: 11 }}
              >
                cm
              </button>
              <button
                className={`segment-btn${currentPatient.heightUnit === 'ftin' ? ' active' : ''}`}
                onClick={() => setField('heightUnit', 'ftin')}
                style={{ padding: '4px 12px', minHeight: 32, fontSize: 11 }}
              >
                ft+in
              </button>
            </div>
          </div>

          {currentPatient.heightUnit === 'cm' ? (
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                className={`input-field${errors.height ? ' error' : ''}`}
                placeholder="155–190"
                value={currentPatient.height}
                onChange={(e) => setField('height', e.target.value)}
                aria-label="Height in centimeters"
                inputMode="decimal"
              />
              <span
                className="badge badge-pink"
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}
              >
                cm
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="number"
                  className={`input-field${errors.height ? ' error' : ''}`}
                  placeholder="5"
                  value={currentPatient.heightFeet}
                  onChange={(e) => setField('heightFeet', e.target.value)}
                  aria-label="Height in feet"
                  inputMode="numeric"
                />
                <span className="badge badge-pink" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>ft</span>
              </div>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="number"
                  className={`input-field${errors.height ? ' error' : ''}`}
                  placeholder="6"
                  value={currentPatient.heightInches}
                  onChange={(e) => setField('heightInches', e.target.value)}
                  aria-label="Height in inches"
                  inputMode="numeric"
                />
                <span className="badge badge-pink" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>in</span>
              </div>
            </div>
          )}
          {errors.height && (
            <p id="height-error" style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4, fontWeight: 500 }}>
              {errors.height}
            </p>
          )}
        </div>

        {/* Weight Input */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Weight</label>
            <div className="segment-group" style={{ width: 'auto' }}>
              <button
                className={`segment-btn${currentPatient.weightUnit === 'kg' ? ' active' : ''}`}
                onClick={() => setField('weightUnit', 'kg')}
                style={{ padding: '4px 12px', minHeight: 32, fontSize: 11 }}
              >
                kg
              </button>
              <button
                className={`segment-btn${currentPatient.weightUnit === 'lbs' ? ' active' : ''}`}
                onClick={() => setField('weightUnit', 'lbs')}
                style={{ padding: '4px 12px', minHeight: 32, fontSize: 11 }}
              >
                lbs
              </button>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <input
              type="number"
              className={`input-field${errors.weight ? ' error' : ''}`}
              placeholder={currentPatient.weightUnit === 'kg' ? '40–120' : '88–265'}
              value={currentPatient.weight}
              onChange={(e) => setField('weight', e.target.value)}
              aria-label={`Weight in ${currentPatient.weightUnit}`}
              inputMode="decimal"
            />
            <span
              className="badge badge-pink"
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}
            >
              {currentPatient.weightUnit}
            </span>
          </div>
          {errors.weight && (
            <p id="weight-error" style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4, fontWeight: 500 }}>
              {errors.weight}
            </p>
          )}
        </div>

        {/* BMI & Constant Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>BMI:</label>
            {bmiDisplay ? (
              <span className={`badge badge-${bmiDisplay.category.color}`} style={{ fontWeight: 700 }}>
                {bmiDisplay.value}
              </span>
            ) : (
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic' }}>--</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Constant (C):</label>
            <div className="segment-group" style={{ width: 'auto' }}>
              {[8, 9, 10].map((c) => (
                <button
                  key={c}
                  className={`segment-btn${currentPatient.constant === c ? ' active' : ''}`}
                  onClick={() => setField('constant', c)}
                  style={{ padding: '4px 10px', minHeight: 32, fontSize: 11 }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pregnancy toggle (only for female) */}
        {currentPatient.sex === 'female' && (
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, padding: '12px', background: 'var(--result-bg)', borderRadius: '12px', cursor: 'pointer' }}
            onClick={() => setField('pregnant', !currentPatient.pregnant)}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>
              🤰 Pregnancy adjustment (-15%)
            </span>
            <div
              className={`toggle-track${currentPatient.pregnant ? ' active' : ''}`}
              role="switch"
              aria-checked={currentPatient.pregnant}
            >
              <div className="toggle-thumb" />
            </div>
          </div>
        )}
      </section>

      {/* Calculate Button */}
      <button
        className="btn-primary"
        onClick={(e) => {
          handleRipple(e);
          handleCalculate();
        }}
        disabled={isCalculating}
        aria-label="Calculate dose"
        style={{ marginBottom: 8 }}
      >
        {isCalculating ? (
          <>
            <div className="spinner" />
            CALCULATING...
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6m-6 4h6m-3-2v4" />
            </svg>
            CALCULATE DOSE
          </>
        )}
      </button>

      <button className="btn-ghost" onClick={handleReset} style={{ width: '100%', marginBottom: 16 }}>
        Reset
      </button>

      {/* Result Card */}
      <div ref={resultRef}>
        {calculatedResult && (
          <ResultCard
            result={calculatedResult}
            onSave={handleSaveCase}
            onRecalculate={handleCalculate}
          />
        )}
      </div>
    </div>
  );
}
