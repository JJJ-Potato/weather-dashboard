import { NextRequest, NextResponse } from 'next/server';
import { REGIONS } from '@/lib/constants';
import { fetchForecastByDate, fetchAlerts } from '@/lib/kma-api';
import { getBaseTime, getForecastDate, formatQueryTime } from '@/lib/weather-utils';
import { formatDailyForecast } from '@/lib/message-formatter';
import { sendTelegramMessage } from '@/lib/telegram';
import { DashboardData } from '@/types/weather';

function getKstNow(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 9 * 3600000);
}

export async function GET(request: NextRequest) {
  // CRON_SECRET 인증
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = getKstNow();
    const { baseDate, baseTime } = getBaseTime(now);
    const { forecastDate, isNextDay } = getForecastDate(now);
    const queryTime = formatQueryTime(now, isNextDay);

    const [regionForecasts, alerts] = await Promise.all([
      Promise.all(
        REGIONS.map(async (region) => {
          const forecasts = await fetchForecastByDate(
            region.nx,
            region.ny,
            baseDate,
            baseTime,
            forecastDate
          );
          return {
            regionId: region.id,
            regionName: region.name,
            sections: region.sections,
            forecasts,
          };
        })
      ),
      fetchAlerts(),
    ]);

    const data: DashboardData = {
      baseDate,
      baseTime,
      queryTime,
      isNextDay,
      regions: regionForecasts,
    };

    const text = formatDailyForecast(data, alerts);
    const success = await sendTelegramMessage(text);

    if (!success) {
      return NextResponse.json({ success: false, error: '텔레그램 발송 실패' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: '정기 예보 발송 완료' });
  } catch (err) {
    console.error('GET /api/cron/daily-forecast error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
