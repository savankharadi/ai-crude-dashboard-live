import { NextResponse } from 'next/server';
import { getWtiSnapshot } from '@/lib/wti';

export async function GET() {
  try {
    const snapshot = await getWtiSnapshot();
    return NextResponse.json(snapshot);
  } catch (error) {
    return NextResponse.json(
      {
        date: new Date().toISOString(),
        price: 82.5,
        change: 0.8,
        percentChange: 0.98,
        source: 'Fallback Demo',
        trend: 'UP',
        lastUpdated: new Date().toISOString(),
        history: [
          { date: 'D-7', value: 78.6 },
          { date: 'D-6', value: 79.2 },
          { date: 'D-5', value: 79.6 },
          { date: 'D-4', value: 80.8 },
          { date: 'D-3', value: 81.2 },
          { date: 'D-2', value: 81.7 },
          { date: 'D-1', value: 82.1 },
          { date: 'NOW', value: 82.5 },
        ],
      },
      { status: 200 }
    );
  }
}
