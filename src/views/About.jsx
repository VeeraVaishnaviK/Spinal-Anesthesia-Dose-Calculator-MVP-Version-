/**
 * About View — Clinical reference document with formula details,
 * dose ranges, viva notes, and app information.
 * Uses KaTeX for formula rendering.
 */
import { useEffect, useRef } from 'react';

export default function About() {
  const formulaRef = useRef(null);
  const formula2Ref = useRef(null);
  const formula3Ref = useRef(null);

  useEffect(() => {
    // Dynamically render KaTeX formulas
    const renderKatex = async () => {
      try {
        const katex = await import('katex');

        if (formulaRef.current) {
          katex.default.render(
            '\\text{Dose (mL)} = 0.06 \\times H_{cm} + 0.03 \\times W_{kg} - C',
            formulaRef.current,
            { throwOnError: false, displayMode: true }
          );
        }
        if (formula2Ref.current) {
          katex.default.render(
            '\\text{BMI} = \\frac{W_{kg}}{(H_m)^2}',
            formula2Ref.current,
            { throwOnError: false, displayMode: true }
          );
        }
        if (formula3Ref.current) {
          katex.default.render(
            '\\text{LBW}_{male} = 50 + 2.3 \\times \\left(\\frac{H_{cm}}{2.54} - 60\\right)',
            formula3Ref.current,
            { throwOnError: false, displayMode: true }
          );
        }
      } catch {
        // KaTeX not available — show fallback
        if (formulaRef.current) {
          formulaRef.current.textContent = 'Dose = 0.06 × H(cm) + 0.03 × W(kg) − C';
        }
      }
    };

    renderKatex();
  }, []);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>
        About & Viva Notes
      </h2>

      {/* ---- Section A: Formula Reference ---- */}
      <section className="card" style={{ padding: 24, marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--primary)', marginBottom: 16 }}>
          A — Formula Reference
        </h3>

        <div
          ref={formulaRef}
          style={{
            padding: 20,
            background: 'var(--input-bg)',
            borderRadius: 12,
            textAlign: 'center',
            fontSize: 18,
            marginBottom: 16,
            border: '1px solid var(--border)',
            overflow: 'auto',
          }}
        />

        <div
          ref={formula2Ref}
          style={{
            padding: 16,
            background: 'var(--input-bg)',
            borderRadius: 12,
            textAlign: 'center',
            marginBottom: 16,
            border: '1px solid var(--border)',
            overflow: 'auto',
          }}
        />

        <div
          ref={formula3Ref}
          style={{
            padding: 16,
            background: 'var(--input-bg)',
            borderRadius: 12,
            textAlign: 'center',
            marginBottom: 16,
            border: '1px solid var(--border)',
            overflow: 'auto',
          }}
        />

        {/* Coefficient table */}
        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>
          Coefficient Explanations
        </h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={thStyle}>Parameter</th>
                <th style={thStyle}>Coefficient</th>
                <th style={thStyle}>Rationale</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={tdStyle}>Height (cm)</td>
                <td style={tdStyle}>0.06</td>
                <td style={tdStyle}>Accounts for spinal column length and CSF volume</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={tdStyle}>Weight (kg)</td>
                <td style={tdStyle}>0.03</td>
                <td style={tdStyle}>Adjusts for body mass and drug distribution</td>
              </tr>
              <tr>
                <td style={tdStyle}>Constant (C)</td>
                <td style={tdStyle}>8 / 9 / 10</td>
                <td style={tdStyle}>Calibration constant — C=9 standard, C=8 for taller, C=10 for shorter patients</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ---- Section B: Clinical Reference ---- */}
      <section className="card" style={{ padding: 24, marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--primary)', marginBottom: 16 }}>
          B — Clinical Reference Table
        </h3>

        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>
          Standard Dose Ranges by Procedure
        </h4>
        <div style={{ overflowX: 'auto', marginBottom: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={thStyle}>Procedure</th>
                <th style={thStyle}>Dose Range</th>
                <th style={thStyle}>Target Level</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={tdStyle}>Lower limb orthopedic</td>
                <td style={tdStyle}>1.5 – 2.0 mL</td>
                <td style={tdStyle}>T10 – L1</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={tdStyle}>Inguinal / perineal</td>
                <td style={tdStyle}>2.0 – 2.5 mL</td>
                <td style={tdStyle}>T8 – T10</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={tdStyle}>LSCS (Caesarean)</td>
                <td style={tdStyle}>2.2 – 2.8 mL</td>
                <td style={tdStyle}>T6 – T8</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={tdStyle}>Upper abdominal</td>
                <td style={tdStyle}>2.5 – 3.0 mL</td>
                <td style={tdStyle}>T4 – T6</td>
              </tr>
              <tr>
                <td style={tdStyle}>Elderly (&gt;65 years)</td>
                <td style={tdStyle}>Reduce 10 – 15%</td>
                <td style={tdStyle}>As per surgery</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>
          Block Level Reference
        </h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={thStyle}>Dose (mL)</th>
                <th style={thStyle}>Expected Level</th>
                <th style={thStyle}>Coverage</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={tdStyle}>&lt;2.0</td>
                <td style={tdStyle}>T10 – L1</td>
                <td style={tdStyle}>Lower limb only</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={tdStyle}>2.0 – 2.5</td>
                <td style={tdStyle}>T8 – T10</td>
                <td style={tdStyle}>Most procedures</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={tdStyle}>2.5 – 3.0</td>
                <td style={tdStyle}>T6 – T8</td>
                <td style={tdStyle}>Upper abdominal / LSCS</td>
              </tr>
              <tr>
                <td style={tdStyle}>&gt;3.0</td>
                <td style={tdStyle}>T4 – T6</td>
                <td style={tdStyle}>Review necessity — high sympathectomy risk</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="alert-banner alert-warning" style={{ marginTop: 16 }}>
          <span>⚠</span>
          <span><strong>Hypotension Risk Factors:</strong> High block level (≥T6), elderly, pregnancy, hypovolemia, pre-existing cardiovascular disease. Have vasopressors ready.</span>
        </div>
      </section>

      {/* ---- Section C: Viva One-liner ---- */}
      <section className="card" style={{ padding: 24, marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--primary)', marginBottom: 16 }}>
          C — Viva One-liner
        </h3>
        <blockquote
          style={{
            padding: 20,
            borderRadius: 12,
            background: 'rgba(59, 130, 246, 0.08)',
            borderLeft: '4px solid var(--primary)',
            fontSize: 15,
            fontWeight: 500,
            lineHeight: 1.7,
            color: 'var(--text-primary)',
            fontStyle: 'italic',
          }}
        >
          "This study focuses on developing a height- and weight-based individualized
          dosing model for spinal anesthesia to improve block precision and reduce complications."
        </blockquote>
      </section>

      {/* ---- Section D: Endpoints Reference ---- */}
      <section className="card" style={{ padding: 24, marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--primary)', marginBottom: 16 }}>
          D — Study Endpoints Reference
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          <EndpointCard title="Primary" items={['Sensory level achievement (T4, T6, T8, T10)', 'Time to peak block']} />
          <EndpointCard title="Secondary" items={['Hypotension incidence', 'Vasopressor requirement', 'Patient satisfaction']} />
          <EndpointCard title="Safety" items={['Bradycardia incidence', 'Total ephedrine dose', 'PDPH occurrence']} />
        </div>
      </section>

      {/* ---- Section E: App Info ---- */}
      <section className="card" style={{ padding: 24, marginBottom: 32 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--primary)', marginBottom: 16 }}>
          E — App Information
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, marginBottom: 16 }}>
          <InfoRow label="App Version" value="1.0.0" />
          <InfoRow label="Formula Version" value="v1.0 (H+W-C Model)" />
          <InfoRow label="Drug" value="Bupivacaine 0.5% Heavy (Hyperbaric)" />
          <InfoRow label="Framework" value="React 18 + Vite" />
          <InfoRow label="Charts" value="Chart.js 4" />
          <InfoRow label="Math Rendering" value="KaTeX" />
        </div>

        {/* Disclaimer */}
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            fontSize: 13,
            lineHeight: 1.6,
            color: 'var(--danger)',
            fontWeight: 500,
          }}
        >
          <p style={{ fontWeight: 700, marginBottom: 4 }}>⚠ DISCLAIMER</p>
          <p>
            For educational and research use only. Clinical decisions must be made by a qualified
            anaesthesiologist. Do not use as sole clinical guide. Always verify doses against
            institutional protocols and patient-specific factors.
          </p>
        </div>
      </section>
    </div>
  );
}

/* ---- Style constants ---- */
const thStyle = {
  textAlign: 'left',
  padding: '10px 12px',
  fontWeight: 600,
  color: 'var(--text-primary)',
  whiteSpace: 'nowrap',
};

const tdStyle = {
  padding: '10px 12px',
  color: 'var(--text-primary)',
};

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

function EndpointCard({ title, items }) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 10,
        background: 'var(--input-bg)',
        border: '1px solid var(--border)',
      }}
    >
      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {title}
      </p>
      <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.8 }}>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
