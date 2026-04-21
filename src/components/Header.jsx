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
            width: 38,
            height: 38,
            borderRadius: 12,
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(216, 27, 96, 0.25)',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
            <path d="M8 2h4v6h6v4h-6v6H8v-6H2V8h6V2z" fill="#FFFFFF" />
          </svg>
        </div>
        <div>
          <h1
            style={{
              fontSize: 19,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              lineHeight: 1.1,
            }}
          >
            SpinalDose AI
          </h1>
          <p
            style={{
              fontSize: 11,
              color: 'var(--primary)',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginTop: 1,
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
