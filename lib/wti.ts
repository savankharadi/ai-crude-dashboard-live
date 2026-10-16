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
  const response = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/CL=F?interval=1d&range=5d', { cache: 'no-store' });
  if (!response.ok) {
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
  }

  const data = await response.json();
  const result = data.chart?.result?.[0];
  const quote = result?.meta ?? {};
  const close = result?.indicators?.quote?.[0]?.close || [];
  const history = close.filter((n: number | null) => n !== null).slice(-8).map((value: number, index: number) => ({
    date: new Date(Date.now() - (close.length - index - 1) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: Number(value),
  }));

  const last = Number(quote.regularMarketPrice ?? close[close.length - 1] ?? 82.5);
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
}
