import { DashboardData, WeatherAlert } from '@/types/weather';
import { getWeatherIcon, parsePcp } from './weather-utils';

function formatDateLabel(baseDate: string, isNextDay: boolean): string {
  const y = baseDate.slice(0, 4);
  const m = parseInt(baseDate.slice(4, 6));
  const d = parseInt(baseDate.slice(6, 8));
  const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
  const dateObj = new Date(parseInt(y), m - 1, d);
  const day = DAYS[dateObj.getDay()];
  const label = isNextDay ? '내일' : '당일';
  return `${y}년 ${m}월 ${d}일(${day}) ${label} 예보`;
}

export function formatDailyForecast(data: DashboardData, alerts: WeatherAlert[]): string {
  const lines: string[] = [];

  lines.push('📋 수도권 제2순환선(양평-이천) 현장 날씨');
  lines.push(`📅 ${formatDateLabel(data.baseDate, data.isNextDay)}`);

  if (alerts.length > 0) {
    lines.push('');
    for (const alert of alerts) {
      lines.push(`⚠️ [기상특보] ${alert.title} - ${alert.region}`);
    }
  }

  for (const region of data.regions) {
    lines.push('');
    lines.push(`📍 ${region.regionName} (${region.sections})`);

    for (const fc of region.forecasts) {
      const { alt } = getWeatherIcon(fc.sky, fc.pty);
      const hour = `${fc.time.slice(0, 2)}시`;
      const pcp = parsePcp(fc.pcp);
      const pcpPart = pcp !== '-' ? ` 🌧${pcp}` : '';
      lines.push(
        `  ${hour} ${alt} ${fc.tmp}°C 💧${fc.pop}%${pcpPart} 습도${fc.reh}%`
      );
    }
  }

  return lines.join('\n');
}

export function formatAlertNotification(
  alert: WeatherAlert,
  type: 'new' | 'upgrade' | 'cancel'
): string {
  const lines: string[] = [];

  if (type === 'cancel') {
    lines.push('✅ 기상특보 해제 알림');
    lines.push('');
    lines.push(`[해제] ${alert.title}`);
    lines.push(`📍 해제 지역: ${alert.region}`);
    lines.push(`🕐 해제 시각: ${alert.startTime}`);
  } else {
    lines.push('🚨 기상특보 알림');
    lines.push('');
    const label = type === 'upgrade' ? '[상향 조정]' : '[신규 발표]';
    lines.push(`⚠️ ${label} ${alert.title}`);
    lines.push(`📍 발효 지역: ${alert.region}`);
    lines.push(`🕐 발표 시각: ${alert.startTime}`);
    if (alert.content) lines.push(`📝 내용: ${alert.content}`);
    lines.push('');
    lines.push('현장 안전에 유의하시기 바랍니다.');
  }

  return lines.join('\n');
}
