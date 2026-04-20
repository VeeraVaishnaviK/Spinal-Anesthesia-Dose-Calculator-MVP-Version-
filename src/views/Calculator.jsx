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
      name: '',
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
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--primary)', marginBottom: 20 }}>
          Patient Parameters
        </h2>

        {/* Height Input */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Height</label>
            <div className="segment-group" style={{ width: 'auto' }}>
              <button
                className={`segment-btn${currentPatient.heightUnit === 'cm' ? ' active' : ''}`}
                onClick={() => setField('heightUnit', 'cm')}
                style={{ padding: '4px 12px', minHeight: 32, fontSize: 12 }}
              >
                cm
              </button>
              <button
                className={`segment-btn${currentPatient.heightUnit === 'ftin' ? ' active' : ''}`}
                onClick={() => setField('heightUnit', 'ftin')}
                style={{ padding: '4px 12px', minHeight: 32, fontSize: 12 }}
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
                aria-describedby={errors.height ? 'height-error' : undefined}
                inputMode="decimal"
              />
              <span
                className="badge badge-blue"
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
                <span className="badge badge-blue" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>ft</span>
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
                <span className="badge badge-blue" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>in</span>
              </div>
            </div>
          )}
          {errors.height && (
            <p id="height-error" style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4, fontWeight: 500 }}>
              {errors.height}
            </p>
          )}
        </div>

        {/* Weight Input */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Weight</label>
            <div className="segment-group" style={{ width: 'auto' }}>
              <button
                className={`segment-btn${currentPatient.weightUnit === 'kg' ? ' active' : ''}`}
                onClick={() => setField('weightUnit', 'kg')}
                style={{ padding: '4px 12px', minHeight: 32, fontSize: 12 }}
              >
                kg
              </button>
              <button
                className={`segment-btn${currentPatient.weightUnit === 'lbs' ? ' active' : ''}`}
                onClick={() => setField('weightUnit', 'lbs')}
                style={{ padding: '4px 12px', minHeight: 32, fontSize: 12 }}
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
              aria-describedby={errors.weight ? 'weight-error' : undefined}
              inputMode="decimal"
            />
            <span
              className="badge badge-blue"
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}
            >
              {currentPatient.weightUnit}
            </span>
          </div>
          {errors.weight && (
            <p id="weight-error" style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4, fontWeight: 500 }}>
              {errors.weight}
            </p>
          )}
        </div>

        {/* BMI (auto) */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6, display: 'block' }}>
            BMI (auto)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {bmiDisplay ? (
              <>
                <span
                  className={`badge badge-${bmiDisplay.category.color}`}
                  style={{ fontSize: 14, fontWeight: 700, padding: '6px 16px', transition: 'all 0.2s ease' }}
                >
                  {bmiDisplay.value}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {bmiDisplay.category.label}
                </span>
              </>
            ) : (
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                Enter height & weight
              </span>
            )}
          </div>
        </div>

        {/* Age (optional, collapsed by default) */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
            onClick={() => setField('includeAge', !currentPatient.includeAge)}
          >
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              Include Age Adjustment
            </label>
            <div
              className={`toggle-track${currentPatient.includeAge ? ' active' : ''}`}
              role="switch"
              aria-checked={currentPatient.includeAge}
              aria-label="Include age adjustment toggle"
            >
              <div className="toggle-thumb" />
            </div>
          </div>

          <div className={`collapsible-content${currentPatient.includeAge ? ' open' : ''}`}>
            <div style={{ paddingTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Age</span>
                <span
                  className="badge badge-blue"
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 14 }}
                >
                  {currentPatient.age} years
                </span>
              </div>
              <input
                type="range"
                min="18"
                max="90"
                value={currentPatient.age}
                onChange={(e) => setField('age', parseInt(e.target.value))}
                aria-label="Patient age"
                style={{ width: '100%' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)' }}>
                <span>18</span>
                <span>90</span>
              </div>
              {currentPatient.age > 65 && (
                <p style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 500, marginTop: 6 }}>
                  ℹ️ Age &gt;65 — 10% dose reduction will be applied
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sex */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6, display: 'block' }}>
            Sex
          </label>
          <div className="segment-group">
            {['male', 'female', 'unspecified'].map((s) => (
              <button
                key={s}
                className={`segment-btn${currentPatient.sex === s ? ' active' : ''}`}
                onClick={() => {
                  setField('sex', s);
                  if (s !== 'female') setField('pregnant', false);
                }}
              >
                {s === 'unspecified' ? 'Not specified' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* Pregnancy toggle (only for female) */}
          {currentPatient.sex === 'female' && (
            <div
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, cursor: 'pointer' }}
              onClick={() => setField('pregnant', !currentPatient.pregnant)}
            >
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                🤰 Pregnancy adjustment
              </span>
              <div
                className={`toggle-track${currentPatient.pregnant ? ' active' : ''}`}
                role="switch"
                aria-checked={currentPatient.pregnant}
                aria-label="Pregnancy adjustment toggle"
              >
                <div className="toggle-thumb" />
              </div>
            </div>
          )}
        </div>

        {/* Constant Selector (collapsible) */}
        <div style={{ marginBottom: 4 }}>
          <button
            onClick={() => setShowConstant(!showConstant)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Adjust Formula Constant
            {showConstant ? (
              <ChevronUpIcon style={{ width: 16, height: 16 }} />
            ) : (
              <ChevronDownIcon style={{ width: 16, height: 16 }} />
            )}
          </button>

          <div className={`collapsible-content${showConstant ? ' open' : ''}`}>
            <div style={{ paddingTop: 12 }}>
              <div className="segment-group">
                {[8, 9, 10].map((c) => (
                  <button
                    key={c}
                    className={`segment-btn${currentPatient.constant === c ? ' active' : ''}`}
                    onClick={() => setField('constant', c)}
                  >
                    C = {c}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.5 }}>
                C=8 for taller patients, C=9 standard (default), C=10 for shorter stature
              </p>
            </div>
          </div>
        </div>
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
