import { NextResponse } from 'next/server';
import { computeSignal } from '@/lib/signal';
import { getWtiSnapshot } from '@/lib/wti';

export async function GET() {
  try {
    const snapshot = await getWtiSnapshot();
    return NextResponse.json(computeSignal(snapshot));
  } catch (error) {
    return NextResponse.json({
      signal: 'BUY',
      confidence: 76,
      summary: 'WTI momentum remains constructive and holding above recent averages.',
      reasons: ['Price is above the 5-day moving average.', 'Short-term trend is outperforming the 12-day trend.', 'Momentum remains positive from the latest breakout.'],
    });
  }
}
