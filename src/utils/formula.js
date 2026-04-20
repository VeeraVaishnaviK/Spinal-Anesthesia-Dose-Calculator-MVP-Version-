/**
 * SpinalDose AI — Formula Engine
 * Pure utility functions for Bupivacaine spinal anesthesia dosage calculation.
 *
 * Core Formula:
 *   RAW_DOSE = (0.06 × Height_cm) + (0.03 × Weight_kg) − Constant
 *   where Constant ∈ {8, 9, 10}, default = 9
 *
 * @module formula
 */

/**
 * Calculate BMI from weight (kg) and height (cm).
 * @param {number} weightKg - Patient weight in kilograms
 * @param {number} heightCm - Patient height in centimeters
 * @returns {number} BMI value
 */
export function calculateBMI(weightKg, heightCm) {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

/**
 * Get BMI classification and color coding.
 * @param {number} bmi - BMI value
 * @returns {{ label: string, color: 'green'|'amber'|'red' }}
 */
export function getBMICategory(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', color: 'amber' };
  if (bmi < 25) return { label: 'Normal', color: 'green' };
  if (bmi < 30) return { label: 'Overweight', color: 'amber' };
  return { label: 'Obese', color: 'red' };
}

/**
 * Calculate Lean Body Weight (LBW).
 * Male:   LBW = 50 + 2.3 × ((Height_cm / 2.54) − 60)
 * Female: LBW = 45.5 + 2.3 × ((Height_cm / 2.54) − 60)
 *
 * @param {number} heightCm - Patient height in cm
 * @param {'male'|'female'} sex - Patient sex
 * @returns {number} Lean body weight in kg
 */
export function calculateLBW(heightCm, sex) {
  const heightInches = heightCm / 2.54;
  const base = sex === 'female' ? 45.5 : 50;
  return base + 2.3 * (heightInches - 60);
}

/**
 * Calculate the raw Bupivacaine dose.
 * Formula: RAW_DOSE = (0.06 × Height_cm) + (0.03 × Weight_kg) − Constant
 *
 * @param {number} heightCm - Patient height in cm
 * @param {number} weightKg - Weight to use (total or lean body weight)
 * @param {number} constant - Formula constant (8, 9, or 10)
 * @returns {number} Raw dose in mL
 */
export function calculateRawDose(heightCm, weightKg, constant = 9) {
  return (0.06 * heightCm) + (0.03 * weightKg) - constant;
}

/**
 * Apply dose adjustments for age and pregnancy.
 *
 * @param {number} rawDose - The raw calculated dose
 * @param {object} options - Adjustment options
 * @param {boolean} [options.isElderly=false] - Age > 65
 * @param {boolean} [options.isPregnant=false] - Patient is pregnant
 * @param {boolean} [options.applyElderlyReduction=true] - Auto-apply elderly reduction
 * @param {boolean} [options.applyPregnancyReduction=true] - Auto-apply pregnancy reduction
 * @returns {{ adjustedDose: number, reductions: string[] }}
 */
export function applyAdjustments(rawDose, options = {}) {
  const {
    isElderly = false,
    isPregnant = false,
    applyElderlyReduction = true,
    applyPregnancyReduction = true,
  } = options;

  let dose = rawDose;
  const reductions = [];

  if (isElderly && applyElderlyReduction) {
    dose *= 0.90;
    reductions.push('elderly');
  }

  if (isPregnant && applyPregnancyReduction) {
    dose *= 0.85;
    reductions.push('pregnancy');
  }

  return { adjustedDose: dose, reductions };
}

/**
 * Get safety classification for a given dose.
 *
 * @param {number} dose - Adjusted dose in mL
 * @param {number} [minDose=1.5] - Minimum safe dose
 * @param {number} [maxDose=3.5] - Maximum safe dose
 * @returns {{ zone: string, color: string, label: string, warnings: string[] }}
 */
export function getSafetyClassification(dose, minDose = 1.5, maxDose = 3.5) {
  const warnings = [];
  let zone, color, label;

  if (dose < minDose) {
    zone = 'sub-therapeutic';
    color = 'gray';
    label = 'Sub-therapeutic';
    warnings.push('Sub-therapeutic dose — review patient parameters');
  } else if (dose < 2.0) {
    zone = 'low';
    color = 'amber';
    label = 'Low';
  } else if (dose <= 3.0) {
    zone = 'optimal';
    color = 'green';
    label = 'Optimal';
  } else if (dose <= maxDose) {
    zone = 'high';
    color = 'amber';
    label = 'High';
  } else {
    zone = 'unsafe';
    color = 'red';
    label = 'Unsafe — review';
    warnings.push('High dose warning — verify patient parameters');
  }

  return { zone, color, label, warnings };
}

/**
 * Get estimated block level based on dose.
 *
 * @param {number} dose - Adjusted dose in mL
 * @returns {string} Expected dermatome block level
 */
export function getBlockLevel(dose) {
  if (dose < 2.0) return 'T10–L1 (lower limb)';
  if (dose <= 2.5) return 'T8–T10 (most procedures)';
  if (dose <= 3.0) return 'T6–T8 (upper abdominal, LSCS)';
  return 'T4–T6 (review necessity)';
}

/**
 * Get onset and duration estimates based on dose.
 * @param {number} dose
 * @returns {{ onset: string, duration: string }}
 */
export function getTimingEstimate(dose) {
  if (dose < 2.0) return { onset: '5–8 min', duration: '60–90 min' };
  if (dose <= 2.5) return { onset: '5–8 min', duration: '90–120 min' };
  if (dose <= 3.0) return { onset: '3–6 min', duration: '120–150 min' };
  return { onset: '3–5 min', duration: '120–180 min' };
}

/**
 * Convert height from feet+inches to cm.
 * @param {number} feet
 * @param {number} inches
 * @returns {number} Height in cm
 */
export function feetInchesToCm(feet, inches) {
  return (feet * 12 + inches) * 2.54;
}

/**
 * Convert cm to feet and inches.
 * @param {number} cm
 * @returns {{ feet: number, inches: number }}
 */
export function cmToFeetInches(cm) {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

/**
 * Convert lbs to kg.
 * @param {number} lbs
 * @returns {number}
 */
export function lbsToKg(lbs) {
  return lbs * 0.453592;
}

/**
 * Convert kg to lbs.
 * @param {number} kg
 * @returns {number}
 */
export function kgToLbs(kg) {
  return kg / 0.453592;
}

/**
 * Perform the complete dose calculation pipeline.
 *
 * @param {object} params
 * @param {number} params.heightCm
 * @param {number} params.weightKg
 * @param {number} params.constant
 * @param {number|null} params.age
 * @param {string} params.sex
 * @param {boolean} params.isPregnant
 * @param {boolean} params.useLBW
 * @param {boolean} params.applyElderlyReduction
 * @param {boolean} params.applyPregnancyReduction
 * @param {number} params.minDose
 * @param {number} params.maxDose
 * @returns {object} Complete calculation result
 */
export function calculateDose(params) {
  const {
    heightCm,
    weightKg,
    constant = 9,
    age = null,
    sex = 'unspecified',
    isPregnant = false,
    useLBW = false,
    applyElderlyReduction = true,
    applyPregnancyReduction = true,
    minDose = 1.5,
    maxDose = 3.5,
  } = params;

  // Calculate BMI
  const bmi = calculateBMI(weightKg, heightCm);
  const bmiCategory = getBMICategory(bmi);

  // Determine effective weight
  let effectiveWeight = weightKg;
  let lbw = null;
  if (useLBW && (sex === 'male' || sex === 'female')) {
    lbw = calculateLBW(heightCm, sex);
    effectiveWeight = lbw;
  }

  // Calculate raw dose
  const rawDose = calculateRawDose(heightCm, effectiveWeight, constant);

  // Apply adjustments
  const isElderly = age !== null && age > 65;
  const { adjustedDose, reductions } = applyAdjustments(rawDose, {
    isElderly,
    isPregnant,
    applyElderlyReduction,
    applyPregnancyReduction,
  });

  // Round to 1 decimal
  const finalDose = Math.round(adjustedDose * 10) / 10;

  // Safety classification
  const safety = getSafetyClassification(finalDose, minDose, maxDose);

  // Flags
  const flags = [...safety.warnings];
  if (isElderly && applyElderlyReduction) {
    flags.push('Dose reduced 10% for patient age >65');
  }
  if (isPregnant && applyPregnancyReduction) {
    flags.push('Dose reduced 15% for obstetric patient');
  }
  if (bmi >= 30) {
    flags.push('Consider lean body weight dosing — review with senior');
  }

  // Block level
  const blockLevel = getBlockLevel(finalDose);
  const timing = getTimingEstimate(finalDose);

  return {
    rawDose: Math.round(rawDose * 100) / 100,
    adjustedDose: finalDose,
    bmi: Math.round(bmi * 10) / 10,
    bmiCategory,
    lbw: lbw ? Math.round(lbw * 10) / 10 : null,
    effectiveWeight: Math.round(effectiveWeight * 10) / 10,
    blockLevel,
    onset: timing.onset,
    duration: timing.duration,
    safety,
    flags,
    reductions,
    constant,
    isElderly,
    isPregnant,
    usedLBW: useLBW && lbw !== null,
  };
}
