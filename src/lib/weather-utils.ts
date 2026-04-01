export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

export function getBaseTime(now: Date): { baseDate: string; baseTime: string } {
  const baseTimes = ['2300', '2000', '1700', '1400', '1100', '0800', '0500', '0200'];
  const hhMM = now.getHours() * 100 + now.getMinutes();
  // 발표 후 10분 지연 고려
  const adjusted = hhMM - 10;

  let selectedBase = '2300';
  let dateOffset = -1; // 전날 2300

  for (const bt of baseTimes) {
    if (adjusted >= parseInt(bt)) {
      selectedBase = bt;
      dateOffset = 0;
      break;
    }
  }

  const baseDate = new Date(now);
  baseDate.setDate(baseDate.getDate() + dateOffset);

  return {
    baseDate: formatDate(baseDate),
    baseTime: selectedBase,
  };
}

export function getForecastDate(now: Date): { forecastDate: string; isNextDay: boolean } {
  const hour = now.getHours();
  const minute = now.getMinutes();
  // 18:01 이후면 내일 예보
  const isNextDay = hour > 18 || (hour === 18 && minute >= 1);

  const target = new Date(now);
  if (isNextDay) target.setDate(target.getDate() + 1);

  return { forecastDate: formatDate(target), isNextDay };
}

export function getWeatherIcon(sky: number, pty: number): { src: string; alt: string } {
  // PTY 우선 (강수가 있으면 강수형태로 결정)
  if (pty === 1) return { src: '/icons/rain.svg', alt: '비' };
  if (pty === 2) return { src: '/icons/rain-snow.svg', alt: '비/눈' };
  if (pty === 3) return { src: '/icons/snow.svg', alt: '눈' };
  if (pty === 4) return { src: '/icons/shower.svg', alt: '소나기' };
  // PTY === 0: 하늘상태로 결정
  if (sky === 1) return { src: '/icons/sunny.svg', alt: '맑음' };
  if (sky === 3) return { src: '/icons/partly-cloudy.svg', alt: '구름많음' };
  if (sky === 4) return { src: '/icons/cloudy.svg', alt: '흐림' };
  return { src: '/icons/sunny.svg', alt: '맑음' };
}

export function formatQueryTime(date: Date, isNextDay: boolean): string {
  const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const day = DAYS[date.getDay()];
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const nextDayLabel = isNextDay ? ' [내일예보]' : '';
  return `${y}년 ${m}월 ${d}일(${day}) ${hh}:${mm} 조회${nextDayLabel}`;
}

export function parsePcp(pcp: string): string {
  if (!pcp || pcp === '강수없음') return '-';
  if (pcp.includes('미만')) {
    // '1.0mm 미만' 형태
    const match = pcp.match(/[\d.]+/);
    if (match) return `~${match[0]} mm`;
    return pcp;
  }
  if (pcp.includes('~')) {
    // '30.0~50.0mm' 형태 — 그대로 표시
    return pcp.replace('mm', ' mm');
  }
  // '1.5mm' 형태 — 숫자 추출
  const match = pcp.match(/[\d.]+/);
  if (match) return `${match[0]} mm`;
  return pcp;
}
