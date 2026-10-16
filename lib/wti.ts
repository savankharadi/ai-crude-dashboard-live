export type WtiSnapshot = {
  date: string;
  price: number;
  change: number;
  percentChange: number;
  source: string;
  history: { date: string; value: number }[];
  lastUpdated?: string;
};

export async function getWtiSnapshot(): Promise<WtiSnapshot> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/CL=F?interval=1d&range=10d', {
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        // Use a browser-like UA to avoid simple bot blocks
        'User-Agent': 'Mozilla/5.0 (CrudePulse/1.0; +https://github.com/savankharadi/ai-crude-dashboard-live)',
        Accept: 'application/json, text/plain, */*',
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('WTI fetch failed:', response.status, text);
      throw new Error(`Yahoo responded ${response.status}`);
    }

    const data = await response.json().catch((err) => {
      console.error('WTI invalid JSON', err);
      throw err;
    });

    const result = data.chart?.result?.[0];
    if (!result) {
      console.error('WTI: no result in Yahoo response', JSON.stringify(data));
      throw new Error('No data from Yahoo');
    }

    const meta = result.meta ?? {};
    const closes: (number | null)[] = result?.indicators?.quote?.[0]?.close ?? [];
    const timestamps: number[] = result.timestamp ?? [];

    // Build history using timestamps when available, otherwise fall back to index-based dates
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

    const last = Number(meta.regularMarketPrice ?? history[history.length - 1]?.value ?? 82.5);
    const prev = Number(history[history.length - 2]?.value ?? last);

    return {
      date: new Date().toISOString(),
      price: last,
      change: last - prev,
      percentChange: prev ? ((last - prev) / prev) * 100 : 0,
      source: 'Yahoo Finance / CL=F',
      history: history.length ? history : [
        { date: 'Jul 06', value: 78.6 },
        { date: 'Jul 07', value: 79.2 },
        { date: 'Jul 08', value: 79.8 },
        { date: 'Jul 09', value: 80.4 },
        { date: 'Jul 10', value: 81.1 },
        { date: 'Jul 11', value: 81.6 },
        { date: 'Jul 12', value: 82.1 },
        { date: 'Jul 13', value: 82.5 },
      ],
      lastUpdated: new Date().toISOString(),
    };
  } catch (err: any) {
    // Log the error for Vercel runtime logs
    console.error('getWtiSnapshot error:', err && err.message ? err.message : err);

    return {
      date: new Date().toISOString(),
      price: 82.5,
      change: 0.8,
      percentChange: 0.98,
      source: 'Fallback demo',
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
      lastUpdated: new Date().toISOString(),
    };
  } finally {
    clearTimeout(timeout);
  }
}
