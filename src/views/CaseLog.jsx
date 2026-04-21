/**
 * CaseLog View — Scrollable log of saved patient cases.
 * Supports search, sort, delete, and CSV export.
 */
import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  MagnifyingGlassIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

export default function CaseLog() {
  const { state, dispatch, showToast } = useApp();
  const { caseLog } = state;
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [expandedCase, setExpandedCase] = useState(null);

  // Filter and sort
  const filteredCases = useMemo(() => {
    let cases = [...caseLog];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      cases = cases.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.pid && c.pid.toLowerCase().includes(q)) ||
          (c.procedure && c.procedure.toLowerCase().includes(q))
      );
    }

    // Sort
    switch (sortBy) {
      case 'dose':
        cases.sort((a, b) => b.dose - a.dose);
        break;
      case 'bmi':
        cases.sort((a, b) => b.bmi - a.bmi);
        break;
      case 'date':
      default:
        cases.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    return cases;
  }, [caseLog, search, sortBy]);

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_CASE', id });
    showToast('Case deleted', 'success');
  };

  const handleExportCSV = () => {
    if (caseLog.length === 0) {
      showToast('No cases to export', 'error');
      return;
    }

    const headers = [
      'ID', 'Name', 'PID', 'Procedure', 'Region', 'Age', 'Sex', 'Height(cm)', 'Weight(kg)', 'BMI',
      'Constant', 'Dose(mL)', 'BlockLevel', 'AgeAdj', 'PregnancyAdj',
      'Timestamp', 'SafetyFlag',
    ];

    const rows = caseLog.map((c) => [
      c.id,
      c.name || '',
      c.pid || '',
      c.procedure || '',
      c.region || '',
      c.age || '',
      c.sex,
      Math.round(c.heightCm),
      Math.round(c.weightKg * 10) / 10,
      c.bmi,
      c.constant,
      c.dose,
      c.blockLevel,
      c.reductions?.includes('elderly') ? 'Yes' : 'No',
      c.reductions?.includes('pregnancy') ? 'Yes' : 'No',
      c.timestamp,
      c.safety?.label || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.map((v) => `"${v}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `spinaldose_caselog_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('CSV exported!', 'success');
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSafetyBadgeClass = (safety) => {
    if (!safety) return 'badge-green';
    switch (safety.color) {
      case 'green': return 'badge-green';
      case 'amber': return 'badge-amber';
      case 'red': return 'badge-red';
      default: return 'badge-pink';
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
        Case Log
      </h2>

      {/* Search + Sort + Export */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <MagnifyingGlassIcon
            style={{
              width: 18,
              height: 18,
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-secondary)',
            }}
          />
          <input
            type="text"
            className="input-field"
            placeholder="Search by ID or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search cases"
            style={{ paddingLeft: 38 }}
          />
        </div>

        <div style={{ position: 'relative' }}>
          <select
            className="input-field"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort cases"
            style={{ paddingRight: 36, fontSize: 13, minWidth: 120 }}
          >
            <option value="date">Sort: Date</option>
            <option value="dose">Sort: Dose</option>
            <option value="bmi">Sort: BMI</option>
          </select>
        </div>

        <button className="btn-ghost" onClick={handleExportCSV}>
          <ArrowDownTrayIcon style={{ width: 16, height: 16 }} />
          Export CSV
        </button>
      </div>

      {/* Case Cards */}
      {filteredCases.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="30" y="10" width="40" height="65" rx="3" />
            <line x1="50" y1="72" x2="50" y2="85" />
            <circle cx="50" cy="88" r="3" />
            <line x1="38" y1="25" x2="62" y2="25" />
            <line x1="38" y1="35" x2="55" y2="35" />
            <line x1="38" y1="45" x2="58" y2="45" />
          </svg>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No cases saved yet</p>
          <p style={{ fontSize: 13 }}>Calculate a dose to begin.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredCases.map((c) => (
            <div key={c.id} className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 15,
                        color: 'var(--text-primary)',
                      }}
                    >
                      {c.name || 'Anonymous'}
                    </span>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 600,
                        fontSize: 12,
                        color: 'var(--primary)',
                        background: 'var(--result-bg)',
                        padding: '2px 6px',
                        borderRadius: 4
                      }}
                    >
                      {c.pid || c.id}
                    </span>
                    <span className={`badge ${getSafetyBadgeClass(c.safety)}`}>
                      {c.safety?.label || 'Safe'}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{formatDate(c.timestamp)}</p>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={() => setExpandedCase(expandedCase === c.id ? null : c.id)}
                    className="btn-ghost"
                    style={{ padding: '6px 8px', minHeight: 36 }}
                    aria-label="View details"
                  >
                    <EyeIcon style={{ width: 16, height: 16 }} />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="btn-ghost"
                    style={{ padding: '6px 8px', minHeight: 36, color: 'var(--danger)' }}
                    aria-label="Delete case"
                  >
                    <TrashIcon style={{ width: 16, height: 16 }} />
                  </button>
                </div>
              </div>

              {/* Quick info row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 13, color: 'var(--text-primary)' }}>
                <span><strong>Dose:</strong> <span className="font-mono">{c.dose} mL</span></span>
                <span><strong>H:</strong> {Math.round(c.heightCm)} cm</span>
                <span><strong>W:</strong> {Math.round(c.weightKg * 10) / 10} kg</span>
                <span><strong>BMI:</strong> {c.bmi}</span>
                <span><strong>C:</strong> {c.constant}</span>
                {c.sex !== 'unspecified' && <span><strong>Sex:</strong> {c.sex}</span>}
                {c.age && <span><strong>Age:</strong> {c.age}</span>}
              </div>

              {/* Expanded details */}
              {expandedCase === c.id && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                    <div><span style={{ color: 'var(--text-secondary)' }}>Procedure:</span> {c.procedure || '--'}</div>
                    <div><span style={{ color: 'var(--text-secondary)' }}>Target Region:</span> {c.region || '--'}</div>
                    <div><span style={{ color: 'var(--text-secondary)' }}>Block Level:</span> {c.blockLevel}</div>
                    <div><span style={{ color: 'var(--text-secondary)' }}>Raw Dose:</span> {c.rawDose} mL</div>
                    <div><span style={{ color: 'var(--text-secondary)' }}>Pregnant:</span> {c.isPregnant ? 'Yes' : 'No'}</div>
                    <div><span style={{ color: 'var(--text-secondary)' }}>LBW Used:</span> {c.usedLBW ? 'Yes' : 'No'}</div>
                  </div>
                  {c.flags && c.flags.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      {c.flags.map((f, i) => (
                        <p key={i} style={{ fontSize: 12, color: 'var(--warning)', marginTop: 4 }}>⚠ {f}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 16, textAlign: 'center' }}>
        {caseLog.length} case{caseLog.length !== 1 ? 's' : ''} saved
      </p>
    </div>
  );
}
