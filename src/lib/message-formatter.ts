import { DashboardData, HourlyForecast, WeatherAlert } from '@/types/weather';
import { getWeatherIcon, parsePcp } from './weather-utils';

const MESSAGE_HOURS = ['0600', '0900', '1200', '1500', '1800'];

function formatDateHeader(baseDate: string, isNextDay: boolean): string {
  const y = parseInt(baseDate.slice(0, 4));
  const m = parseInt(baseDate.slice(4, 6));
  const d = parseInt(baseDate.slice(6, 8));
  const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
  const dateObj = new Date(y, m - 1, d);
  if (isNextDay) dateObj.setDate(dateObj.getDate() + 1);
  const day = DAYS[dateObj.getDay()];
  const fy = dateObj.getFullYear();
  const fm = dateObj.getMonth() + 1;
  const fd = dateObj.getDate();
  return `${fy}년 ${fm}월 ${fd}일(${day}) 날씨 예보 보고드립니다.`;
}

function formatRainSummary(forecasts: HourlyForecast[]): string {
  const rainy = forecasts.filter(fc => fc.pty > 0 || (fc.pcp && fc.pcp !== '강수없음'));
  if (rainy.length === 0) return '☀️ 비 예보는 없습니다.';

  const timeLabels = rainy.map(fc => `${parseInt(fc.time.slice(0, 2))}시`);
  const amounts = rainy.map(fc => parsePcp(fc.pcp)).filter(p => p !== '-');

  const timePart = timeLabels.join(', ');
  const amountPart = amounts.length > 0
    ? `(${rainy.length > 1 ? '각 ' : ''}${amounts.join(', ')})`
    : '';

  return `🌧 ${timePart}에 비 소식이 있습니다.${amountPart ? ' ' + amountPart : ''}`;
}

export function formatDailyForecast(data: DashboardData, alerts: WeatherAlert[]): string {
  const lines: string[] = [];

  lines.push(formatDateHeader(data.baseDate, data.isNextDay));

  if (alerts.length > 0) {
    lines.push('');
    for (const alert of alerts) {
      lines.push(`[기상특보] ${alert.title} - ${alert.region}`);
    }
  }

  for (const region of data.regions) {
    if (region.regionId !== 'gonjiam' && region.regionId !== 'sanbuk') continue;

    const todayForecasts = (region.days[0]?.forecasts ?? [])
      .filter(fc => MESSAGE_HOURS.includes(fc.time));

    lines.push('');
    lines.push(`[${region.regionName}]`);
    lines.push(formatRainSummary(todayForecasts));

    for (const fc of todayForecasts) {
      const { alt } = getWeatherIcon(fc.sky, fc.pty);
      const hour = `${fc.time.slice(0, 2)}:00`;
      const pcp = parsePcp(fc.pcp);
      const pcpPart = pcp !== '-' ? `  💧예상강수량 ${pcp}` : '';
      lines.push(`  ${hour}  ${alt}  기온 ${fc.tmp}°C${pcpPart}`);
    }
  }

  lines.push('');
  lines.push('※ 자세히 보기 : https://weather.exroad.life (클릭!)');

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
