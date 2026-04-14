import { DayForecast } from '@/types/weather';
import WeatherTable from './WeatherTable';

interface Props {
  regionName: string;
  sections: string;
  days: DayForecast[];
  accentIndex?: number;
}

const ACCENT_COLORS = [
  'from-blue-400 to-sky-400',
  'from-sky-400 to-cyan-400',
  'from-indigo-400 to-blue-400',
  'from-cyan-400 to-teal-400',
];

export default function WeatherCard({ regionName, sections, days, accentIndex = 0 }: Props) {
  const accent = ACCENT_COLORS[accentIndex % ACCENT_COLORS.length];

  return (
    <div className="glass-card overflow-hidden">
      {/* 상단 컬러 액센트 바 */}
      <div className={`h-1 w-full bg-gradient-to-r ${accent}`} />

      <div className="p-4 pt-3">
        {/* 카드 헤더 */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">📍</span>
          <div>
            <h2 className="font-bold text-slate-800 text-sm leading-tight">{regionName}</h2>
            <span className="text-slate-400 text-xs">{sections}</span>
          </div>
        </div>

        {/* 구분선 */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-3" />

        <WeatherTable days={days} />
      </div>
    </div>
  );
}
