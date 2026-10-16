import { NextResponse } from 'next/server';
import { getGrowwTokenStatus, saveGrowwToken } from '@/lib/token-store';

export async function GET() {
  const status = await getGrowwTokenStatus();
  return NextResponse.json(status);
}

export async function POST(request: Request) {
  const body = await request.json();
  const growwToken = String(body.growwToken || '').trim();

  if (!growwToken || growwToken.length < 10) {
    return NextResponse.json({ message: 'Token appears invalid' }, { status: 400 });
  }

  await saveGrowwToken(growwToken);
  return NextResponse.json({ message: 'Groww token saved securely.' }, { status: 200 });
}
