import { NextRequest, NextResponse } from 'next/server';
import { formatDailyForecast } from '@/lib/message-formatter';
import { sendTelegramMessage } from '@/lib/telegram';
import { DashboardData, WeatherAlert } from '@/types/weather';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
      return NextResponse.json(
        { success: false, message: '텔레그램 설정이 필요합니다' },
        { status: 400 }
      );
    }

    const body = await request.json() as { weatherData: DashboardData; alerts: WeatherAlert[] };
    const { weatherData, alerts } = body;

    const text = formatDailyForecast(weatherData, alerts);
    const success = await sendTelegramMessage(text);

    if (!success) {
      return NextResponse.json({ success: false, message: '발송 실패' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: '텔레그램 발송 완료' });
  } catch (err) {
    console.error('POST /api/send-telegram error:', err);
    return NextResponse.json({ success: false, message: '발송 실패' }, { status: 500 });
  }
}
