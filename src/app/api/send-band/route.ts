import { NextRequest, NextResponse } from 'next/server';
import { formatDailyForecast } from '@/lib/message-formatter';
import { DashboardData, WeatherAlert } from '@/types/weather';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { weatherData: DashboardData; alerts: WeatherAlert[] };
    const { weatherData, alerts } = body;

    const text = formatDailyForecast(weatherData, alerts);
    const shareUrl = `https://band.us/plugin/share?body=${encodeURIComponent(text)}`;

    return NextResponse.json({ shareUrl, text });
  } catch (err) {
    console.error('POST /api/send-band error:', err);
    return NextResponse.json({ error: '밴드 공유 URL 생성 실패' }, { status: 500 });
  }
}
