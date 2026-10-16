export type WtiSnapshot = {
  date: string;
  price: number;
  change: number;
  percentChange: number;
  source: string;
  history: { date: string; value: number }[];
  lastUpdated?: string;
};

const FALLBACK_HISTORY = [
  { date: 'Jul 06', value: 78.6 },
  { date: 'Jul 07', value: 79.2 },
  { date: 'Jul 08', value: 79.8 },
  { date: 'Jul 09', value: 80.4 },
  { date: 'Jul 10', value: 81.1 },
  { date: 'Jul 11', value: 81.6 },
  { date: 'Jul 12', value: 82.1 },
  { date: 'Jul 13', value: 82.5 },
];

function fallbackSnapshot(): WtiSnapshot {
  return {
    date: new Date().toISOString(),
    price: 82.5,
    change: 0.8,
    percentChange: 0.98,
    source: 'Fallback demo',
    history: FALLBACK_HISTORY,
    lastUpdated: new Date().toISOString(),
  };
}

async function fetchYahooWti(): Promise<WtiSnapshot | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/CL=F?interval=1d&range=10d',
      {
        cache: 'no-store',
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (CrudePulse/1.0; +https://github.com/savankharadi/ai-crude-dashboard-live)',
          Accept: 'application/json, text/plain, */*',
        },
      }
    );

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('WTI yahoo fetch failed:', response.status, text);
      return null;
    }

    const data = await response.json();
    const result = data.chart?.result?.[0];
    if (!result) {
      console.error('WTI yahoo payload missing result:', JSON.stringify(data).slice(0, 500));
      return null;
    }

    const meta = result.meta ?? {};
    const closes: (number | null)[] = result?.indicators?.quote?.[0]?.close ?? [];
    const timestamps: number[] = result.timestamp ?? [];

    const history = closes
      .map((value: number | null, i: number) => ({ ts: timestamps[i], value }))
      .filter((p) => p.value !== null && p.value !== undefined)
      .slice(-8)
      .map((p) => {
        const date = p.ts ? new Date(p.ts * 1000) : new Date();
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: Number(p.value),
        };
      });

    if (!history.length) {
      console.error('WTI yahoo history empty');
      return null;
    }

    const last = Number(meta.regularMarketPrice ?? history[history.length - 1]?.value ?? 82.5);
    const prev = Number(history[history.length - 2]?.value ?? last);

    return {
      date: new Date().toISOString(),
      price: last,
      change: last - prev,
      percentChange: prev ? ((last - prev) / prev) * 100 : 0,
      source: 'Yahoo Finance / CL=F',
      history,
      lastUpdated: new Date().toISOString(),
    };
  } catch (err) {
    console.error('WTI yahoo fetch error:', err && (err as Error).message ? (err as Error).message : err);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchAlphaVantageWti(): Promise<WtiSnapshot | null> {
  const key = process.env.ALPHA_VANTAGE_KEY;
  if (!key) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=CL=F&apikey=${encodeURIComponent(key)}`;
    const response = await fetch(url, {
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      console.error('WTI AlphaVantage failed:', response.status);
      return null;
    }

    const data = await response.json();
    const quote = data['Global Quote'];
    if (!quote || !quote['05. price']) {
      console.error('WTI AlphaVantage no quote:', JSON.stringify(data).slice(0, 500));
      return null;
    }

    const price = Number(quote['05. price']);
    const change = Number(quote['10. change percent']?.replace('%', '') ?? 0);

    return {
      date: new Date().toISOString(),
      price,
      change: Number(quote['10. change current'] ?? 0),
      percentChange: Number.isFinite(change) ? change : 0,
      source: 'Alpha Vantage / CL=F',
      history: FALLBACK_HISTORY,
      lastUpdated: new Date().toISOString(),
    };
  } catch (err) {
    console.error('WTI AlphaVantage error:', err && (err as Error).message ? (err as Error).message : err);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getWtiSnapshot(): Promise<WtiSnapshot> {
  const yahoo = await fetchYahooWti();
  if (yahoo) return yahoo;

  const alpha = await fetchAlphaVantageWti();
  if (alpha) return alpha;

  return fallbackSnapshot();
}
