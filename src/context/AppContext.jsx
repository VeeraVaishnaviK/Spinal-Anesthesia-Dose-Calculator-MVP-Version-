/**
 * SpinalDose AI — Global Application Context
 * Manages patient data, calculation results, settings, and case log.
 * Uses React Context + useReducer pattern with localStorage persistence.
 */
import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

const AppContext = createContext(null);

// ---------- Default State ----------
const defaultSettings = {
  theme: 'light',
  units: 'metric',        // 'metric' | 'imperial'
  defaultConstant: 8,
  dosingBasis: 'tbw',     // 'tbw' | 'lbw'
  drugConcentration: '0.5heavy', // '0.5heavy' | '0.5plain' | '0.75'
  autoElderlyReduction: true,
  autoPregnancyReduction: true,
  patientPosition: 'supine',
  surgeryType: 'lower_limb',
  baricity: 'hyperbaric',
  minDose: 1.5,
  maxDose: 3.5,
  showWarning: true,
  hapticFeedback: true,
};

const defaultPatient = {
  name: '',
  pid: '',
  procedure: '',
  region: '',
  height: '',
  weight: '',
  heightUnit: 'cm',
  weightUnit: 'kg',
  heightFeet: '',
  heightInches: '',
  age: 40,
  includeAge: true,
  sex: 'unspecified',
  pregnant: false,
  constant: 8,
  useLBW: false,
};

const initialState = {
  currentPatient: { ...defaultPatient },
  calculatedResult: null,
  settings: { ...defaultSettings },
  caseLog: [],
  activeView: 'calculator',
  toast: null,
  sidebarCollapsed: false,
};

// ---------- Load persisted state ----------
function loadPersistedState() {
  try {
    const settings = localStorage.getItem('spinaldose_settings');
    const caseLog = localStorage.getItem('spinaldose_caselog');
    const lastPatient = localStorage.getItem('spinaldose_lastpatient');
    return {
      ...initialState,
      settings: settings ? { ...defaultSettings, ...JSON.parse(settings) } : { ...defaultSettings },
      caseLog: caseLog ? JSON.parse(caseLog) : [],
      currentPatient: lastPatient
        ? { ...defaultPatient, ...JSON.parse(lastPatient) }
        : { ...defaultPatient },
    };
  } catch {
    return { ...initialState };
  }
}

// ---------- Reducer ----------
function appReducer(state, action) {
  switch (action.type) {
    case 'SET_PATIENT_FIELD':
      return {
        ...state,
        currentPatient: { ...state.currentPatient, [action.field]: action.value },
      };

    case 'SET_PATIENT':
      return {
        ...state,
        currentPatient: { ...state.currentPatient, ...action.payload },
      };

    case 'RESET_PATIENT':
      return {
        ...state,
        currentPatient: { ...defaultPatient, constant: state.settings.defaultConstant },
        calculatedResult: null,
      };

    case 'SET_RESULT':
      return { ...state, calculatedResult: action.payload };

    case 'CLEAR_RESULT':
      return { ...state, calculatedResult: null };

    case 'ADD_CASE': {
      const newLog = [action.payload, ...state.caseLog];
      return { ...state, caseLog: newLog };
    }

    case 'DELETE_CASE': {
      const filtered = state.caseLog.filter((c) => c.id !== action.id);
      return { ...state, caseLog: filtered };
    }

    case 'CLEAR_ALL_CASES':
      return { ...state, caseLog: [] };

    case 'SET_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case 'RESET_SETTINGS':
      return { ...state, settings: { ...defaultSettings } };

    case 'SET_VIEW':
      return { ...state, activeView: action.view };

    case 'SHOW_TOAST':
      return { ...state, toast: action.payload };

    case 'HIDE_TOAST':
      return { ...state, toast: null };

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };

    default:
      return state;
  }
}

// ---------- Provider Component ----------
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, null, loadPersistedState);

  // Persist settings to localStorage
  useEffect(() => {
    localStorage.setItem('spinaldose_settings', JSON.stringify(state.settings));
  }, [state.settings]);

  // Persist case log to localStorage
  useEffect(() => {
    localStorage.setItem('spinaldose_caselog', JSON.stringify(state.caseLog));
  }, [state.caseLog]);

  // Persist last patient for quick re-entry
  useEffect(() => {
    localStorage.setItem('spinaldose_lastpatient', JSON.stringify(state.currentPatient));
  }, [state.currentPatient]);

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    if (state.settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (state.settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }, [state.settings.theme]);

  // Toast auto-dismiss
  useEffect(() => {
    if (state.toast) {
      const timer = setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [state.toast]);

  const showToast = useCallback((message, type = 'success') => {
    dispatch({ type: 'SHOW_TOAST', payload: { message, type } });
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, showToast }}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * Hook to access app state and dispatch.
 * @returns {{ state: object, dispatch: function, showToast: function }}
 */
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
}

export { defaultPatient, defaultSettings };
