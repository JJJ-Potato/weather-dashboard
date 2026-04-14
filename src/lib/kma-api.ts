import { HourlyForecast, DayForecast, WeatherAlert } from '@/types/weather';
import {
  KMA_FORECAST_URL,
  KMA_ALERT_URL,
  FORECAST_HOURS,
  ALERT_REGION_KEYWORDS,
} from './constants';

interface KmaItem {
  baseDate: string;
  baseTime: string;
  category: string;
  fcstDate: string;
  fcstTime: string;
  fcstValue: string;
  nx: number;
  ny: number;
}

export async function fetchForecast(
  nx: number,
  ny: number,
  baseDate: string,
  baseTime: string
): Promise<HourlyForecast[]> {
  try {
    const apiKey = process.env.KMA_API_KEY;
    if (!apiKey) {
      console.error('KMA_API_KEY is not set');
      return [];
    }

    const params = new URLSearchParams({
      serviceKey: apiKey,
      numOfRows: '1000',
      pageNo: '1',
      dataType: 'JSON',
      base_date: baseDate,
      base_time: baseTime,
      nx: String(nx),
      ny: String(ny),
    });

    const url = `${KMA_FORECAST_URL}?${params.toString()}`;
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
      console.error(`KMA forecast API error: ${res.status}`);
      return [];
    }

    const json = await res.json();
    const items: KmaItem[] = json?.response?.body?.items?.item ?? [];

    if (!Array.isArray(items) || items.length === 0) {
      console.error('KMA forecast: empty items', JSON.stringify(json).slice(0, 200));
      return [];
    }

    // 시간대별 카테고리 값 수집
    const map: Record<string, Partial<Record<string, string>>> = {};

    for (const item of items) {
      if (!FORECAST_HOURS.includes(item.fcstTime as typeof FORECAST_HOURS[number])) continue;
      const key = `${item.fcstDate}_${item.fcstTime}`;
      if (!map[key]) map[key] = {};
      map[key][item.category] = item.fcstValue;
    }

    const forecasts: HourlyForecast[] = [];
    for (const hour of FORECAST_HOURS) {
      // forecastDate 필터링은 route.ts에서 수행하므로 여기서는 시간만 매핑
      // map에서 해당 시간대 데이터를 가져옴 (날짜 무관, 첫 번째 매칭)
      const entry = Object.entries(map).find(([key]) => key.endsWith(`_${hour}`));
      if (!entry) continue;
      const [, vals] = entry;

      forecasts.push({
        time: hour,
        sky: parseInt(vals['SKY'] ?? '1'),
        pty: parseInt(vals['PTY'] ?? '0'),
        tmp: parseInt(vals['TMP'] ?? '0'),
        pop: vals['POP'] !== undefined ? parseInt(vals['POP']) : null,
        pcp: vals['PCP'] ?? '강수없음',
        reh: parseInt(vals['REH'] ?? '0'),
      });
    }

    return forecasts;
  } catch (err) {
    console.error('fetchForecast error:', err);
    return [];
  }
}

export async function fetchForecastByDate(
  nx: number,
  ny: number,
  baseDate: string,
  baseTime: string,
  forecastDate: string
): Promise<HourlyForecast[]> {
  try {
    const apiKey = process.env.KMA_API_KEY;
    if (!apiKey) {
      console.error('KMA_API_KEY is not set');
      return [];
    }

    const params = new URLSearchParams({
      serviceKey: apiKey,
      numOfRows: '1000',
      pageNo: '1',
      dataType: 'JSON',
      base_date: baseDate,
      base_time: baseTime,
      nx: String(nx),
      ny: String(ny),
    });

    const url = `${KMA_FORECAST_URL}?${params.toString()}`;
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
      console.error(`KMA forecast API error: ${res.status}`);
      return [];
    }

    const json = await res.json();
    const items: KmaItem[] = json?.response?.body?.items?.item ?? [];

    if (!Array.isArray(items) || items.length === 0) {
      console.error('KMA forecast: empty items', JSON.stringify(json).slice(0, 200));
      return [];
    }

    // forecastDate에 해당하는 시간대별 카테고리 값 수집
    const map: Record<string, Partial<Record<string, string>>> = {};

    for (const item of items) {
      if (item.fcstDate !== forecastDate) continue;
      if (!FORECAST_HOURS.includes(item.fcstTime as typeof FORECAST_HOURS[number])) continue;
      const key = item.fcstTime;
      if (!map[key]) map[key] = {};
      map[key][item.category] = item.fcstValue;
    }

    const forecasts: HourlyForecast[] = [];
    for (const hour of FORECAST_HOURS) {
      const vals = map[hour];
      if (!vals) continue;

      forecasts.push({
        time: hour,
        sky: parseInt(vals['SKY'] ?? '1'),
        pty: parseInt(vals['PTY'] ?? '0'),
        tmp: parseInt(vals['TMP'] ?? '0'),
        pop: vals['POP'] !== undefined ? parseInt(vals['POP']) : null,
        pcp: vals['PCP'] ?? '강수없음',
        reh: parseInt(vals['REH'] ?? '0'),
      });
    }

    return forecasts;
  } catch (err) {
    console.error('fetchForecastByDate error:', err);
    return [];
  }
}

export async function fetchForecastDays(
  nx: number,
  ny: number,
  baseDate: string,
  baseTime: string,
  forecastDays: Array<{ date: string; label: string }>
): Promise<DayForecast[]> {
  try {
    const apiKey = process.env.KMA_API_KEY;
    if (!apiKey) {
      console.error('KMA_API_KEY is not set');
      return [];
    }

    const params = new URLSearchParams({
      serviceKey: apiKey,
      numOfRows: '3000',
      pageNo: '1',
      dataType: 'JSON',
      base_date: baseDate,
      base_time: baseTime,
      nx: String(nx),
      ny: String(ny),
    });

    const url = `${KMA_FORECAST_URL}?${params.toString()}`;
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
      console.error(`KMA forecast API error: ${res.status}`);
      return [];
    }

    const json = await res.json();
    const items: KmaItem[] = json?.response?.body?.items?.item ?? [];

    if (!Array.isArray(items) || items.length === 0) {
      console.error('KMA forecast: empty items', JSON.stringify(json).slice(0, 200));
      return [];
    }

    const targetDates = new Set(forecastDays.map((d) => d.date));

    // date -> time -> category -> value
    const dateMap: Record<string, Record<string, Partial<Record<string, string>>>> = {};

    for (const item of items) {
      if (!targetDates.has(item.fcstDate)) continue;
      if (!FORECAST_HOURS.includes(item.fcstTime as typeof FORECAST_HOURS[number])) continue;
      if (!dateMap[item.fcstDate]) dateMap[item.fcstDate] = {};
      if (!dateMap[item.fcstDate][item.fcstTime]) dateMap[item.fcstDate][item.fcstTime] = {};
      dateMap[item.fcstDate][item.fcstTime][item.category] = item.fcstValue;
    }

    return forecastDays.map(({ date, label }) => {
      const timeMap = dateMap[date] ?? {};
      const forecasts: HourlyForecast[] = [];

      for (const hour of FORECAST_HOURS) {
        const vals = timeMap[hour];
        if (!vals) continue;

        forecasts.push({
          time: hour,
          sky: parseInt(vals['SKY'] ?? '1'),
          pty: parseInt(vals['PTY'] ?? '0'),
          tmp: parseInt(vals['TMP'] ?? '0'),
          pop: vals['POP'] !== undefined ? parseInt(vals['POP']) : null,
          pcp: vals['PCP'] ?? '강수없음',
          reh: parseInt(vals['REH'] ?? '0'),
        });
      }

      return { date, label, forecasts };
    });
  } catch (err) {
    console.error('fetchForecastDays error:', err);
    return [];
  }
}

export async function fetchAlerts(): Promise<WeatherAlert[]> {
  try {
    const apiKey = process.env.KMA_API_KEY;
    if (!apiKey) {
      console.error('KMA_API_KEY is not set');
      return [];
    }

    const params = new URLSearchParams({
      serviceKey: apiKey,
      numOfRows: '10',
      pageNo: '1',
      dataType: 'JSON',
      stnId: '108',
    });

    const url = `${KMA_ALERT_URL}?${params.toString()}`;
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
      console.error(`KMA alert API error: ${res.status}`);
      return [];
    }

    const json = await res.json();
    const items = json?.response?.body?.items?.item ?? [];

    if (!Array.isArray(items)) return [];

    return items
      .filter((item: Record<string, string>) => {
        const text = `${item.title ?? ''} ${item.t6 ?? ''} ${item.t7 ?? ''}`;
        return ALERT_REGION_KEYWORDS.some((kw) => text.includes(kw));
      })
      .map((item: Record<string, string>) => ({
        title: item.title ?? '',
        region: item.t6 ?? item.t7 ?? '',
        startTime: item.tmFc ?? '',
        content: item.t8 ?? item.t7 ?? '',
      }));
  } catch (err) {
    console.error('fetchAlerts error:', err);
    return [];
  }
}
