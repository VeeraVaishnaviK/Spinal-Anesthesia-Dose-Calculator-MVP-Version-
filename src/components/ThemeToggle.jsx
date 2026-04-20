/**
 * ThemeToggle — Sun/Moon icon toggle for light/dark theme switching.
 */
import { useApp } from '../context/AppContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function ThemeToggle() {
  const { state, dispatch } = useApp();
  const isDark = state.settings.theme === 'dark';

  const toggle = () => {
    dispatch({
      type: 'SET_SETTINGS',
      payload: { theme: isDark ? 'light' : 'dark' },
    });
  };

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        borderRadius: 10,
        border: '1.5px solid var(--border)',
        background: 'var(--surface)',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
    >
      {isDark ? <SunIcon style={{ width: 20, height: 20 }} /> : <MoonIcon style={{ width: 20, height: 20 }} />}
    </button>
  );
}
