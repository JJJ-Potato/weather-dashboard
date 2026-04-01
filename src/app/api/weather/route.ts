import { NextResponse } from 'next/server';
import { REGIONS } from '@/lib/constants';
import { fetchForecastByDate } from '@/lib/kma-api';
import { getBaseTime, getForecastDate, formatQueryTime } from '@/lib/weather-utils';
import { DashboardData } from '@/types/weather';

function getKstNow(): Date {
  // UTC 시각을 KST(+9)로 변환
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 9 * 3600000);
}

export async function GET() {
  try {
    const now = getKstNow();
    const { baseDate, baseTime } = getBaseTime(now);
    const { forecastDate, isNextDay } = getForecastDate(now);
    const queryTime = formatQueryTime(now, isNextDay);

    const regionForecasts = await Promise.all(
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
    );

    const data: DashboardData = {
      baseDate,
      baseTime,
      queryTime,
      isNextDay,
      regions: regionForecasts,
    };

    return NextResponse.json(data);
  } catch (err) {
    console.error('GET /api/weather error:', err);
    return NextResponse.json({ error: '날씨 데이터 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
