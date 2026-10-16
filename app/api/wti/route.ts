import { NextResponse } from 'next/server';
import { getWtiSnapshot } from '@/lib/wti';

export async function GET() {
  try {
    const snapshot = await getWtiSnapshot();
    return NextResponse.json(snapshot);
  } catch (error) {
    console.error('WTI API route error:', error);

    return NextResponse.json(
      {
        date: new Date().toISOString(),
        price: 82.5,
        change: 0.8,
        percentChange: 0.98,
        source: 'Fallback demo',
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
      },
      { status: 200 }
    );
  }
}
