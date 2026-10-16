import { NextResponse } from 'next/server';
import { getGrowwToken } from '@/lib/token-store';

const FALLBACK = {
  price: 82.5,
  change: 0.8,
  percentChange: 0.98,
  source: 'Groww fallback demo',
  trend: 'UP',
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

let cache: any = null;
let cacheTime = 0;

const parseValue = (obj: any, paths: string[]) => {
  for (const path of paths) {
    const parts = path.split('.');
    let current = obj;
    let found = true;
    for (const part of parts) {
      if (!current || typeof current !== 'object' || !(part in current)) {
        found = false;
        break;
      }
      current = current[part];
    }
    if (found && current !== undefined && current !== null && current !== '') return current;
  }
  return undefined;
};

export async function GET() {
  const now = Date.now();
  if (cache && now - cacheTime < 30000) return NextResponse.json(cache);

  const token = await getGrowwToken();
  const endpoint = process.env.GROWW_MARKET_ENDPOINT || process.env.GROWW_API_BASE_URL;

  if (!token || !endpoint) {
    cache = FALLBACK;
    cacheTime = now;
    return NextResponse.json(FALLBACK, { status: 200 });
  }

  try {
    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) throw new Error(`Groww endpoint rejected request: ${response.status}`);
    const payload = await response.json();
    const data = payload.data ?? payload;

    const price = Number(parseValue(data, ['price', 'lastPrice', 'ltp', 'last_traded_price']) ?? 82.5);
    const prevPrice = Number(parseValue(data, ['previousClose', 'prevClose', 'previous_close', 'close']) ?? price);
    const change = price - prevPrice;
    const percentChange = prevPrice ? (change / prevPrice) * 100 : 0;

    const history = Array.isArray(parseValue(data, ['history', 'candles', 'ohlc']))
      ? (parseValue(data, ['history', 'candles', 'ohlc']) as any[]).slice(-8).map((item: any, index: number) => ({
          date: new Date(item.timestamp ?? item.date ?? Date.now() - index * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: Number(item.close ?? item.price ?? item.value ?? price),
        }))
      : FALLBACK.history;

    const normalized = {
      price,
      change,
      percentChange,
      source: 'Groww / token-backed market data',
      trend: change >= 0 ? 'UP' : 'DOWN',
      lastUpdated: new Date().toISOString(),
      history,
    };

    cache = normalized;
    cacheTime = now;
    return NextResponse.json(normalized);
  } catch (error) {
    cache = FALLBACK;
    cacheTime = now;
    return NextResponse.json(FALLBACK, { status: 200 });
  }
}
