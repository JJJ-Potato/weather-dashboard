import { NextResponse } from 'next/server';
import { fetchAlerts } from '@/lib/kma-api';

export async function GET() {
  try {
    const alerts = await fetchAlerts();
    return NextResponse.json({ alerts, hasAlert: alerts.length > 0 });
  } catch (err) {
    console.error('GET /api/alert error:', err);
    return NextResponse.json({ alerts: [], hasAlert: false }, { status: 500 });
  }
}
