export interface HourlyForecast {
  time: string;          // '0600', '0700', ... '1800'
  sky: number;           // 하늘상태 SKY (1맑음 3구름많음 4흐림)
  pty: number;           // 강수형태 PTY (0없음 1비 2비/눈 3눈 4소나기)
  tmp: number;           // 기온 °C
  pop: number | null;    // 강수확률 % (3시간 단위 제공, 없으면 null)
  pcp: string;           // 1시간 강수량 ('강수없음' | '1.0mm 미만' | '30.0~50.0mm' 등 문자열)
  reh: number;           // 습도 %
}

export interface DayForecast {
  date: string;          // 'YYYYMMDD'
  label: string;         // '오늘', '내일', '모레' 등
  forecasts: HourlyForecast[];
}

export interface RegionWeather {
  regionId: string;
  regionName: string;
  sections: string;
  days: DayForecast[];
}

export interface WeatherAlert {
  title: string;         // '강풍주의보', '호우경보' 등
  region: string;
  startTime: string;
  content: string;
}

export interface DashboardData {
  baseDate: string;      // 'YYYYMMDD'
  baseTime: string;      // 'HHmm'
  queryTime: string;     // '2026년 4월 1일(화) 08:00 조회'
  isNextDay: boolean;
  regions: RegionWeather[];
}

export interface AlertResponse {
  alerts: WeatherAlert[];
  hasAlert: boolean;
}
