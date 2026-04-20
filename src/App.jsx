/**
 * App.jsx — Root component for SpinalDose AI.
 * Handles view routing, layout structure, and theme provider.
 */
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import Calculator from './views/Calculator';
import CaseLog from './views/CaseLog';
import GraphView from './views/GraphView';
import Settings from './views/Settings';
import About from './views/About';

function AppContent() {
  const { state } = useApp();
  const { activeView, sidebarCollapsed } = state;

  const renderView = () => {
    switch (activeView) {
      case 'calculator':
        return <Calculator />;
      case 'caselog':
        return <CaseLog />;
      case 'graphs':
        return <GraphView />;
      case 'settings':
        return <Settings />;
      case 'about':
        return <About />;
      default:
        return <Calculator />;
    }
  };

  return (
    <div className="app-layout">
      {/* Header — visible on mobile, hidden on desktop sidebar mode */}
      <div className="header-wrapper">
        <Header />
        <style>{`
          @media (min-width: 1025px) {
            .header-wrapper { display: none; }
          }
        `}</style>
      </div>

      {/* Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main
        className={`main-content${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}
        role="main"
        aria-label="Main content"
      >
        {renderView()}
      </main>

      {/* Toast notifications */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
