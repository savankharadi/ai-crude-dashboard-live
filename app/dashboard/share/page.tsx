export default function SharePage() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      background: 'radial-gradient(circle at top, #0f172a, #020817 55%)',
      color: '#edf3ff',
      padding: '32px',
      fontFamily: 'Inter, Segoe UI, sans-serif'
    }}>
      <div style={{
        maxWidth: '760px',
        width: '100%',
        background: 'rgba(15,23,42,0.82)',
        border: '1px solid rgba(148,163,184,0.2)',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: '0 20px 50px rgba(15, 23, 42, 0.38)'
      }}>
        <p style={{ margin: 0, color: '#7dd3fc', letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '12px' }}>
          Shared snapshot
        </p>
        <h1 style={{ margin: '12px 0 16px', fontSize: '2.2rem' }}>Crude Intelligence Dashboard</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginTop: '22px' }}>
          <Stat label="WTI Spot" value="$82.50" trend="+0.80" />
          <Stat label="AI Signal" value="BUY" trend="76% confidence" />
          <Stat label="Bias" value="Bullish" trend="Momentum intact" />
        </div>
        <p style={{ marginTop: '26px', color: '#cbd5e1', lineHeight: 1.7 }}>
          This page represents a shareable read-only dashboard snapshot generated for the AI crude trading intelligence view.
          The live app can be extended with real market APIs, event triggers, and authenticated Groww integration.
        </p>
      </div>
    </main>
  );
}

function Stat({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <div style={{
      background: 'rgba(15,23,42,0.65)',
      border: '1px solid rgba(148,163,184,0.15)',
      borderRadius: '14px',
      padding: '18px 14px'
    }}>
      <div style={{ color: '#a5b4fc', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '8px' }}>{value}</div>
      <div style={{ color: '#34d399', marginTop: '6px' }}>{trend}</div>
    </div>
  );
}
