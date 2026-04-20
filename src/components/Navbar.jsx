/**
 * Navbar — Bottom navigation (mobile) and left sidebar (desktop).
 */
import { useApp } from '../context/AppContext';
import {
  CalculatorIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import {
  CalculatorIcon as CalculatorSolid,
  ClipboardDocumentListIcon as ClipboardSolid,
  ChartBarIcon as ChartBarSolid,
  Cog6ToothIcon as CogSolid,
  BookOpenIcon as BookSolid,
} from '@heroicons/react/24/solid';

const NAV_ITEMS = [
  { id: 'calculator', label: 'Calculator', Icon: CalculatorIcon, SolidIcon: CalculatorSolid },
  { id: 'caselog', label: 'Case Log', Icon: ClipboardDocumentListIcon, SolidIcon: ClipboardSolid },
  { id: 'graphs', label: 'Graphs', Icon: ChartBarIcon, SolidIcon: ChartBarSolid },
  { id: 'settings', label: 'Settings', Icon: Cog6ToothIcon, SolidIcon: CogSolid },
  { id: 'about', label: 'About', Icon: BookOpenIcon, SolidIcon: BookSolid },
];

export default function Navbar() {
  const { state, dispatch } = useApp();
  const { activeView, sidebarCollapsed } = state;

  const navigate = (view) => {
    dispatch({ type: 'SET_VIEW', view });
  };

  return (
    <>
      {/* Desktop Sidebar — hidden on mobile */}
      <nav
        className="sidebar"
        style={{
          display: 'none',
          width: sidebarCollapsed ? 72 : 240,
        }}
        aria-label="Main navigation"
      >
        {/* Logo area in sidebar */}
        <div
          style={{
            padding: sidebarCollapsed ? '12px 8px' : '12px 20px',
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
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
          {!sidebarCollapsed && (
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
              SpinalDose AI
            </span>
          )}
        </div>

        <div style={{ flex: 1 }}>
          {NAV_ITEMS.map(({ id, label, Icon, SolidIcon }) => {
            const isActive = activeView === id;
            const IconComp = isActive ? SolidIcon : Icon;
            return (
              <button
                key={id}
                className={`sidebar-item${isActive ? ' active' : ''}`}
                onClick={() => navigate(id)}
                aria-label={label}
                style={sidebarCollapsed ? { justifyContent: 'center', paddingLeft: 0, paddingRight: 0 } : {}}
              >
                <IconComp style={{ width: 22, height: 22, flexShrink: 0 }} />
                {!sidebarCollapsed && <span>{label}</span>}
              </button>
            );
          })}
        </div>

        {/* Collapse toggle */}
        <button
          className="sidebar-item"
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            marginBottom: 16,
            ...(sidebarCollapsed ? { justifyContent: 'center', paddingLeft: 0, paddingRight: 0 } : {}),
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="currentColor"
            style={{
              transform: sidebarCollapsed ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.3s ease',
              flexShrink: 0,
            }}
          >
            <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
          </svg>
          {!sidebarCollapsed && <span>Collapse</span>}
        </button>

        {/* CSS to show sidebar only on desktop */}
        <style>{`
          @media (min-width: 1025px) {
            .sidebar { display: flex !important; }
          }
        `}</style>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav" aria-label="Main navigation" style={{}}>
        {NAV_ITEMS.map(({ id, label, Icon, SolidIcon }) => {
          const isActive = activeView === id;
          const IconComp = isActive ? SolidIcon : Icon;
          return (
            <button
              key={id}
              className={`nav-item${isActive ? ' active' : ''}`}
              onClick={() => navigate(id)}
              aria-label={label}
            >
              <IconComp style={{ width: 22, height: 22 }} />
              <span>{label}</span>
            </button>
          );
        })}

        {/* CSS to hide bottom nav on desktop */}
        <style>{`
          @media (min-width: 1025px) {
            .bottom-nav { display: none !important; }
          }
        `}</style>
      </nav>
    </>
  );
}
