import { HourlyForecast } from '@/types/weather';
import WeatherIcon from './WeatherIcon';
import { parsePcp } from '@/lib/weather-utils';

interface Props {
  forecasts: HourlyForecast[];
}

function PopCell({ pop }: { pop: number }) {
  if (pop >= 70) return <span className="tabular-nums text-red-600 font-bold">{pop}%</span>;
  if (pop >= 50) return <span className="tabular-nums text-blue-600 font-bold">{pop}%</span>;
  return <span className="tabular-nums text-slate-700">{pop}%</span>;
}

function PcpCell({ pcp }: { pcp: string }) {
  const parsed = parsePcp(pcp);
  if (parsed === '-') return <span className="tabular-nums text-slate-400">-</span>;
  return <span className="tabular-nums text-blue-700 font-bold">{parsed}</span>;
}

const HOURS = ['0600', '0900', '1200', '1500', '1800'];

export default function WeatherTable({ forecasts }: Props) {
  // 시간 순서대로 정렬하여 빈 슬롯도 표시
  const byTime: Record<string, HourlyForecast> = {};
  for (const fc of forecasts) byTime[fc.time] = fc;

  if (forecasts.length === 0) {
    return (
      <div className="text-center text-slate-400 text-sm py-4">데이터 없음</div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden">
      <table className="w-full table-fixed border-collapse text-center text-sm">
        <colgroup>
          <col className="w-[18%]" />
          {HOURS.map((h) => (
            <col key={h} className="w-[16.4%]" />
          ))}
        </colgroup>
        <tbody>
          {/* 시간 행 */}
          <tr className="border-b border-slate-100">
            <td className="py-1.5 text-xs font-medium text-slate-500 bg-slate-50/60 rounded-tl-lg"></td>
            {HOURS.map((h) => (
              <td key={h} className="py-1.5 text-xs font-semibold text-slate-600">
                {h.slice(0, 2)}시
              </td>
            ))}
          </tr>
          {/* 날씨 행 */}
          <tr className="border-b border-slate-100">
            <td className="py-1.5 text-xs font-medium text-slate-500 bg-slate-50/60">날씨</td>
            {HOURS.map((h) => (
              <td key={h} className="py-1.5">
                {byTime[h] ? (
                  <WeatherIcon sky={byTime[h].sky} pty={byTime[h].pty} size={36} />
                ) : (
                  <span className="text-slate-300">-</span>
                )}
              </td>
            ))}
          </tr>
          {/* 기온 행 */}
          <tr className="border-b border-slate-100">
            <td className="py-1.5 text-xs font-medium text-slate-500 bg-slate-50/60">기온</td>
            {HOURS.map((h) => (
              <td key={h} className="py-1.5 text-slate-900 font-bold text-lg tabular-nums">
                {byTime[h] ? `${byTime[h].tmp}°` : '-'}
              </td>
            ))}
          </tr>
          {/* 예상강수량 행 */}
          <tr className="border-b border-slate-100">
            <td className="py-1.5 text-xs font-medium text-slate-500 bg-slate-50/60 leading-tight">
              강수량
            </td>
            {HOURS.map((h) => (
              <td key={h} className="py-1.5 text-xs">
                {byTime[h] ? <PcpCell pcp={byTime[h].pcp} /> : '-'}
              </td>
            ))}
          </tr>
          {/* 강수확률 행 */}
          <tr className="border-b border-slate-100">
            <td className="py-1.5 text-xs font-medium text-slate-500 bg-slate-50/60 leading-tight">
              강수확률
            </td>
            {HOURS.map((h) => (
              <td key={h} className="py-1.5 text-xs">
                {byTime[h] ? <PopCell pop={byTime[h].pop} /> : '-'}
              </td>
            ))}
          </tr>
          {/* 습도 행 */}
          <tr>
            <td className="py-1.5 text-xs font-medium text-slate-500 bg-slate-50/60 rounded-bl-lg">
              습도
            </td>
            {HOURS.map((h) => (
              <td key={h} className="py-1.5 text-xs tabular-nums text-slate-600">
                {byTime[h] ? `${byTime[h].reh}%` : '-'}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
