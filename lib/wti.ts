export type WtiSnapshot = {
  date: string;
  price: number;
  change: number;
  percentChange: number;
  trend: 'UP' | 'DOWN' | 'SIDEWAYS';
  source: string;
  history: { date: string; value: number }[];
};

export async function getWtiSnapshot(): Promise<WtiSnapshot> {
  const key = process.env.FRED_API_KEY || 'demo';
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=DCOILWTICO&api_key=${key}&file_type=json&sort_order=desc&limit=12`;

  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch WTI data');
    const data = await response.json();
    const observations = (data.observations || []).filter((item: any) => item.value && item.value !== '.') || [];

    const history = observations.slice(0, 8).reverse().map((obs: any) => ({
      date: new Date(obs.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Number(obs.value),
    }));

    const newest = history[history.length - 1]?.value ?? 82.5;
    const previous = history[Math.max(0, history.length - 2)]?.value ?? newest;
    const change = newest - previous;
    const percentChange = (change / previous) * 100;

    return {
      date: new Date().toISOString(),
      price: newest,
      change,
      percentChange,
      trend: change >= 0 ? 'UP' : 'DOWN',
      source: 'FRED / DCOILWTICO',
      history,
    };
  } catch (error) {
    return {
      date: new Date().toISOString(),
      price: 82.5,
      change: 0.8,
      percentChange: 0.98,
      trend: 'UP',
      source: 'Fallback Demo',
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
  }
}
