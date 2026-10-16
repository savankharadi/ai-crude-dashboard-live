import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    {
      title: 'Crude inventory watch',
      severity: 'HIGH',
      description: 'WTI is showing strength and the next inventory release remains the key catalyst.',
    },
    {
      title: 'Trend confirmation',
      severity: 'MEDIUM',
      description: 'The recent move is positive with a +0.98% change in the latest snapshot.',
    },
    {
      title: 'Options flow signal',
      severity: 'MEDIUM',
      description: 'Call buying is being monitored for a continuation move if price holds above support.',
    },
  ]);
}
