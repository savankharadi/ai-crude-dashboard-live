export type SignalResult = {
  signal: 'BUY' | 'SELL' | 'NEUTRAL';
  confidence: number;
  summary: string;
  reasons: string[];
};

export function computeSignal(snapshot: { price: number; change: number; percentChange: number; history: { value: number }[] }) {
  const history = snapshot.history.map((point) => point.value);
  const avgShort = history.slice(-5).reduce((sum, value) => sum + value, 0) / 5;
  const avgLong = history.slice(-12).reduce((sum, value) => sum + value, 0) / 12;
  const trend = snapshot.price >= avgShort && avgShort >= avgLong;
  const bullish = snapshot.percentChange > 0 && trend;
  const bearish = snapshot.percentChange < 0 && avgShort < avgLong;

  if (bullish) {
    return {
      signal: 'BUY',
      confidence: 76,
      summary: 'WTI momentum remains constructive and holding above recent averages.',
      reasons: ['Price is above the 5-point moving average.', 'Short-term trend is outperforming the 12-point trend.', 'Momentum remains positive from the latest swing higher.'],
    } satisfies SignalResult;
  }

  if (bearish) {
    return {
      signal: 'SELL',
      confidence: 68,
      summary: 'Recent weakness suggests downside pressure is building.',
      reasons: ['Price is trading below the recent short-term average.', 'Momentum is deteriorating relative to the longer trend.', 'Risk remains skewed lower until a recovery trigger appears.'],
    } satisfies SignalResult;
  }

  return {
    signal: 'NEUTRAL',
    confidence: 52,
    summary: 'Market is balanced with no strong directional confirmation yet.',
    reasons: ['Price is near recent equilibrium.', 'Trend and momentum are not yet aligned for a clear move.', 'Wait for a catalyst or stronger confirmation.'],
  } satisfies SignalResult;
}
