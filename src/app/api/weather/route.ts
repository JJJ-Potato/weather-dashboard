import { NextResponse } from 'next/server';
import { REGIONS } from '@/lib/constants';
import { fetchForecastDays } from '@/lib/kma-api';
import { getBaseTime, getForecastDate, formatQueryTime, addDaysToDate } from '@/lib/weather-utils';
import { DashboardData } from '@/types/weather';

const DEFAULT_REGION_IDS = ['gonjiam', 'sanbuk'];

function getKstNow(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 9 * 3600000);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const regionId = searchParams.get('regionId');

    const regionsToFetch = regionId
      ? REGIONS.filter((r) => r.id === regionId)
      : REGIONS.filter((r) => DEFAULT_REGION_IDS.includes(r.id));

    if (regionsToFetch.length === 0) {
      return NextResponse.json({ error: '유효하지 않은 지역 ID입니다.' }, { status: 400 });
    }

    const now = getKstNow();
    const { baseDate, baseTime } = getBaseTime(now);
    const { forecastDate, isNextDay } = getForecastDate(now);
    const queryTime = formatQueryTime(now, isNextDay);

    // 오늘(forecastDate) + 내일 + 모레 (isNextDay 여부에 따라 레이블 결정)
    const dayLabels = isNextDay
      ? ['내일', '모레', '글피']
      : ['오늘', '내일', '모레'];

    const forecastDays = dayLabels.map((label, i) => ({
      date: addDaysToDate(forecastDate, i),
      label,
    }));

    const regionForecasts = await Promise.all(
      regionsToFetch.map(async (region) => {
        const days = await fetchForecastDays(
          region.nx,
          region.ny,
          baseDate,
          baseTime,
          forecastDays
        );
        return {
          regionId: region.id,
          regionName: region.name,
          sections: region.sections,
          days,
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
