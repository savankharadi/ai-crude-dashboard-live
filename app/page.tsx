"use client";

import { useEffect, useState } from 'react';

type WtiSnapshot = {
  date: string;
  price: number;
  change: number;
  percentChange: number;
  trend: 'UP' | 'DOWN' | 'SIDEWAYS';
  source: string;
  history: { date: string; value: number }[];
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

export default function HomePage() {
  const [wti, setWti] = useState<WtiSnapshot | null>(null);
  const [signal, setSignal] = useState<Signal | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [token, setToken] = useState('');
  const [tokenStatus, setTokenStatus] = useState('');

  useEffect(() => {
    const load = async () => {
      const [wtiRes, signalRes, eventsRes, growwRes] = await Promise.all([
        fetch('/api/wti', { cache: 'no-store' }),
        fetch('/api/signal', { cache: 'no-store' }),
        fetch('/api/events', { cache: 'no-store' }),
        fetch('/api/settings/groww', { cache: 'no-store' }),
      ]);

      if (wtiRes.ok) setWti(await wtiRes.json());
      if (signalRes.ok) setSignal(await signalRes.json());
      if (eventsRes.ok) setEvents(await eventsRes.json());
      if (growwRes.ok) {
        const config = await growwRes.json();
        setTokenStatus(config.configured ? 'Groww access token configured' : 'No token configured');
      }
    };

    load();
  }, []);

  const saveGrowwToken = async () => {
    const res = await fetch('/api/settings/groww', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ growwToken: token }),
    });

    const data = await res.json();
    setTokenStatus(data.message || 'Token saved');
    setToken('');
  };

  const marketBias = signal?.signal === 'BUY' ? 'Bullish' : signal?.signal === 'SELL' ? 'Bearish' : 'Neutral';

  return (
    <main className="page-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Crude Intelligence</p>
          <h1>AI Crude Futures & Options Dashboard</h1>
        </div>
        <div className="header-actions">
          <button className="ghost-button" type="button">Auto-refresh: On</button>
          <a className="primary-button" href="/dashboard/share" target="_blank" rel="noreferrer">
            Share live URL
          </a>
        </div>
      </header>

      <section className="summary-grid">
        <article className="stat-card accent-blue">
          <span className="label">WTI Spot</span>
          <strong>{wti ? `$${wti.price.toFixed(2)}` : '--'}</strong>
          <small className={wti && wti.change >= 0 ? 'up' : 'down'}>
            {wti ? `${wti.change >= 0 ? '+' : ''}${wti.change.toFixed(2)} (${wti.percentChange.toFixed(2)}%)` : '--'}
          </small>
        </article>

        <article className="stat-card accent-green">
          <span className="label">AI Signal</span>
          <strong>{signal?.signal ?? 'WAITING'}</strong>
          <small>{signal ? `${signal.confidence}% confidence` : 'Loading'}</small>
        </article>

        <article className="stat-card accent-orange">
          <span className="label">Market Bias</span>
          <strong>{marketBias}</strong>
          <small>{signal?.summary ?? 'Monitoring'}</small>
        </article>

        <article className="stat-card accent-purple">
          <span className="label">Alerts</span>
          <strong>{events.length}</strong>
          <small>Active triggers</small>
        </article>
      </section>

      <section className="dashboard-grid">
        <div className="panel panel-wide">
          <div className="panel-header">
            <h2>WTI Price</h2>
            <span>{wti?.source ?? 'FRED'}</span>
          </div>
          <div className="chart-box">
            {wti?.history.map((point, index) => {
              const prices = wti.history.map((p) => p.value);
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
            <div className={`signal-pill ${signal?.signal.toLowerCase() ?? 'neutral'}`}>
              {signal?.signal ?? 'WAITING'}
            </div>
            <p className="signal-summary">{signal?.summary ?? 'Loading recommendations...'}</p>
            <ul>
              {signal?.reasons.map((reason) => <li key={reason}>{reason}</li>) ?? <li>Waiting for latest tick</li>}
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
