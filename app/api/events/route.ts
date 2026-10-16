import { NextResponse } from 'next/server';
import { getWtiSnapshot } from '@/lib/wti';

export async function GET() {
  try {
    const snapshot = await getWtiSnapshot();
    const events = [
      {
        title: 'Crude inventory watch',
        severity: 'HIGH',
        description: `WTI is ${snapshot.percentChange >= 0 ? 'showing strength' : 'under pressure'} at $${snapshot.price.toFixed(2)}, making the next inventory release a key catalyst.`,
      },
      {
        title: 'Trend confirmation',
        severity: snapshot.change >= 0 ? 'MEDIUM' : 'LOW',
        description: `The recent move is ${snapshot.change >= 0 ? 'positive' : 'negative'} with a ${snapshot.percentChange.toFixed(2)}% change.`,
      },
      {
        title: 'Options flow signal',
        severity: 'MEDIUM',
        description: 'Call buying is being monitored for a continuation move if price holds above support.',
      },
    ];
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json(
      [
        {
          title: 'Crude inventory watch',
          severity: 'HIGH',
          description: 'EIA inventory data remains the primary macro trigger this session.',
        },
        {
          title: 'Momentum breakout',
          severity: 'MEDIUM',
          description: 'WTI price is holding above recent support and in a constructive trend.',
        },
      ],
      { status: 200 }
    );
  }
}
