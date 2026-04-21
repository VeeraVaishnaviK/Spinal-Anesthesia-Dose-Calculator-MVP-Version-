/**
 * Header — Top app bar with logo, wordmark, and theme toggle.
 */
import ThemeToggle from './ThemeToggle';
import { useApp } from '../context/AppContext';


export default function Header() {
  const { dispatch } = useApp();

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        position: 'sticky',
        top: 0,
        zIndex: 60,
        transition: 'background-color 0.3s ease',
      }}
    >
      {/* Logo + Wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Medical cross icon */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M8 2h4v6h6v4h-6v6H8v-6H2V8h6V2z" fill="#FFFFFF" />
          </svg>
        </div>
        <div>
          <h1
            style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              lineHeight: 1.2,
            }}
          >
            SpinalDose AI
          </h1>
          <p
            style={{
              fontSize: 11,
              color: 'var(--text-secondary)',
              fontWeight: 500,
              letterSpacing: '0.02em',
            }}
          >
            Dosage Calculator
          </p>
        </div>
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <ThemeToggle />

      </div>
    </header>
  );
}
