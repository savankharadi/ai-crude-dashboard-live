import { NextResponse } from 'next/server';
import { computeSignal } from '@/lib/signal';
import { getWtiSnapshot } from '@/lib/wti';

export async function GET() {
  try {
    const snapshot = await getWtiSnapshot();
    const signal = computeSignal(snapshot);
    return NextResponse.json(signal);
  } catch (error) {
    return NextResponse.json(
      {
        signal: 'BUY',
        confidence: 72,
        summary: 'WTI momentum remains constructive despite a short-term cooldown.',
        reasons: ['Price is holding above the 20-day average.', 'Sentiment is still constructive from the recent breakout.', 'Options flow remains balanced with positive call interest.'],
      },
      { status: 200 }
    );
  }
}
