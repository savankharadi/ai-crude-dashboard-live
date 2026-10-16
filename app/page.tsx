"use client";

import { useEffect, useState } from 'react';

type MarketTile = {
  price: number;
  change: number;
  percentChange: number;
  source: string;
  history: { date: string; value: number }[];
  lastUpdated: string;
};

type Signal = {
  signal: 'BUY' | 'SELL' | 'NEUTRAL';
  confidence: number;
  reasons: string[];
  summary: string;
};

type EventItem = {
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
};

const defaultWti: MarketTile = {
  price: 82.5,
  change: 0.8,
  percentChange: 0.98,
  source: 'Yahoo Finance / CL=F',
  lastUpdated: new Date().toISOString(),
  history: [
    { date: 'Jul 06', value: 78.6 },
    { date: 'Jul 07', value: 79.2 },
    { date: 'Jul 08', value: 79.8 },
    { date: 'Jul 09', value: 80.4 },
    { date: 'Jul 10', value: 81.1 },
    { date: 'Jul 11', value: 81.6 },
    { date: 'Jul 12', value: 82.1 },
    { date: 'Jul 13', value: 82.5 },
  ],
};

const defaultSignal: Signal = {
  signal: 'BUY',
  confidence: 76,
  summary: 'WTI momentum remains constructive and holding above recent averages.',
  reasons: [
    'Price is above the 5-day moving average.',
    'Short-term trend is outperforming the 12-day trend.',
    'Momentum remains positive from the latest breakout.',
  ],
};

const defaultEvents: EventItem[] = [
  {
    title: 'Crude inventory watch',
    severity: 'HIGH',
    description: 'WTI is showing strength and the next inventory release remains the key catalyst.',
  },
  {
    title: 'Trend confirmation',
    severity: 'MEDIUM',
    description: 'The recent move is positive with a +0.98% change in the latest snapshot.',
  },
  {
    title: 'Options flow signal',
    severity: 'MEDIUM',
    description: 'Call buying is being monitored for a continuation move if price holds above support.',
  },
];

export default function HomePage() {
  const [wti, setWti] = useState<MarketTile>(defaultWti);
  const [groww, setGroww] = useState<MarketTile | null>(null);
  const [signal, setSignal] = useState<Signal>(defaultSignal);
  const [events, setEvents] = useState<EventItem[]>(defaultEvents);
  const [token, setToken] = useState('');
  const [tokenStatus, setTokenStatus] = useState('');

  useEffect(() => {
    const load = async () => {
      const [wtiRes, growwRes, signalRes, eventsRes, statusRes] = await Promise.all([
        fetch('/api/wti', { cache: 'no-store' }),
        fetch('/api/groww/market', { cache: 'no-store' }),
        fetch('/api/signal', { cache: 'no-store' }),
        fetch('/api/events', { cache: 'no-store' }),
        fetch('/api/settings/groww', { cache: 'no-store' }),
      ]);

      if (wtiRes.ok) {
        const data = await wtiRes.json();
        setWti({ ...defaultWti, ...data });
      }

      if (growwRes.ok) {
        const data = await growwRes.json();
        setGroww({ ...defaultWti, ...data });
      }

      if (signalRes.ok) {
        const data = await signalRes.json();
        setSignal(data);
      }

      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setEvents(data);
      }

      if (statusRes.ok) {
        const data = await statusRes.json();
        setTokenStatus(data.configured ? `Groww token configured: ${data.masked ?? 'active'}` : 'No Groww token configured');
      }
    };

    load();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, []);

  const saveGrowwToken = async () => {
    const res = await fetch('/api/settings/groww', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ growwToken: token }),
    });

    const data = await res.json();
    setTokenStatus(data.message || 'Groww token saved');
    setToken('');
  };

  const selectedPrimary = groww ?? wti;
  const marketBias = signal.signal === 'BUY' ? 'Bullish' : signal.signal === 'SELL' ? 'Bearish' : 'Neutral';

  return (
    <main className="page-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Crude Intelligence</p>
          <h1>AI Crude Futures & Options Dashboard</h1>
        </div>
        <div className="header-actions">
          <button className="ghost-button" type="button">Live updates: On</button>
          <a className="primary-button" href="/dashboard/share" target="_blank" rel="noreferrer">
            Share live URL
          </a>
        </div>
      </header>

      <section className="summary-grid">
        <article className="stat-card accent-blue">
          <span className="label">WTI Spot</span>
          <strong>{`$${selectedPrimary.price.toFixed(2)}`}</strong>
          <small className={selectedPrimary.change >= 0 ? 'up' : 'down'}>
            {`${selectedPrimary.change >= 0 ? '+' : ''}${selectedPrimary.change.toFixed(2)} (${selectedPrimary.percentChange.toFixed(2)}%)`}
          </small>
        </article>

        <article className="stat-card accent-green">
          <span className="label">AI Signal</span>
          <strong>{signal.signal}</strong>
          <small>{`${signal.confidence}% confidence`}</small>
        </article>

        <article className="stat-card accent-orange">
          <span className="label">Market Bias</span>
          <strong>{marketBias}</strong>
          <small>{signal.summary}</small>
        </article>

        <article className="stat-card accent-purple">
          <span className="label">Alerts</span>
          <strong>{events.length}</strong>
          <small>{new Date(selectedPrimary.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
        </article>
      </section>

      <section className="dashboard-grid">
        <div className="panel panel-wide">
          <div className="panel-header">
            <h2>WTI Price</h2>
            <span>{selectedPrimary.source}</span>
          </div>
          <div className="chart-box">
            {selectedPrimary.history.map((point, index) => {
              const prices = selectedPrimary.history.map((p) => p.value);
              const min = Math.min(...prices);
              const max = Math.max(...prices);
              const height = Math.max(8, ((point.value - min) / Math.max(1, max - min)) * 100);
              return (
                <div key={`${point.date}-${index}`} className="bar-col" title={`${point.date}: $${point.value}`}>
                  <div className="bar" style={{ height: `${height}%`, background: 'linear-gradient(180deg,#32d583,#239d67)' }} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel panel-secondary">
          <div className="panel-header">
            <h2>AI Buy/Sell Signal</h2>
          </div>
          <div className="signal-box">
            <div className={`signal-pill ${signal.signal.toLowerCase()}`}>
              {signal.signal}
            </div>
            <p className="signal-summary">{signal.summary}</p>
            <ul>
              {signal.reasons.map((reason) => <li key={reason}>{reason}</li>)}
            </ul>
          </div>
        </div>

        <div className="panel panel-secondary">
          <div className="panel-header">
            <h2>Groww Access</h2>
          </div>
          <div className="token-box">
            <input
              type="password"
              value={token}
              placeholder="Enter Groww access token"
              onChange={(e) => setToken(e.target.value)}
            />
            <button className="primary-button" onClick={saveGrowwToken} type="button">
              Save token
            </button>
            <small>{tokenStatus || 'Secure token storage is enabled for this demo.'}</small>
          </div>
        </div>

        <div className="panel panel-wide">
          <div className="panel-header">
            <h2>Options & Event Triggers</h2>
          </div>
          <div className="event-list">
            {events.map((event) => (
              <div key={event.title} className="event-item">
                <div className={`event-severity ${event.severity.toLowerCase()}`}>{event.severity}</div>
                <div>
                  <strong>{event.title}</strong>
                  <p>{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
