import { HourlyForecast } from '@/types/weather';
import WeatherIcon from './WeatherIcon';
import { parsePcp } from '@/lib/weather-utils';

interface Props {
  forecasts: HourlyForecast[];
}

function PopCell({ pop }: { pop: number }) {
  if (pop >= 70) return (
    <span className="tabular-nums text-red-500 font-bold text-xs bg-red-50 px-1.5 py-0.5 rounded-md">
      {pop}%
    </span>
  );
  if (pop >= 50) return (
    <span className="tabular-nums text-blue-600 font-bold text-xs bg-blue-50 px-1.5 py-0.5 rounded-md">
      {pop}%
    </span>
  );
  return <span className="tabular-nums text-slate-500 text-xs">{pop}%</span>;
}

function PcpCell({ pcp }: { pcp: string }) {
  const parsed = parsePcp(pcp);
  if (parsed === '-') return <span className="tabular-nums text-slate-300 text-xs">-</span>;
  return (
    <span className="tabular-nums text-blue-600 font-bold text-xs bg-blue-50 px-1 py-0.5 rounded">
      {parsed}
    </span>
  );
}

const HOURS = ['0600', '0900', '1200', '1500', '1800'];

const LABEL_STYLE = 'py-2 text-xs font-semibold text-slate-400 text-left pl-1 w-[18%]';
const CELL_STYLE = 'py-2 text-center';
const ROW_BASE = 'weather-row border-b border-slate-100/70 last:border-0';

export default function WeatherTable({ forecasts }: Props) {
  const byTime: Record<string, HourlyForecast> = {};
  for (const fc of forecasts) byTime[fc.time] = fc;

  if (forecasts.length === 0) {
    return (
      <div className="text-center text-slate-300 text-sm py-6">데이터 없음</div>
    );
  }

  return (
    <div className="w-full">
      <table className="w-full table-fixed border-collapse text-center text-sm">
        <colgroup>
          <col style={{ width: '18%' }} />
          {HOURS.map((h) => <col key={h} style={{ width: '16.4%' }} />)}
        </colgroup>
        <tbody>

          {/* 시간 행 */}
          <tr className={ROW_BASE}>
            <td className={LABEL_STYLE}></td>
            {HOURS.map((h) => (
              <td key={h} className="py-1.5 text-center">
                <span className="text-xs font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded-md">
                  {h.slice(0, 2)}시
                </span>
              </td>
            ))}
          </tr>

          {/* 날씨 행 */}
          <tr className={ROW_BASE}>
            <td className={LABEL_STYLE}>날씨</td>
            {HOURS.map((h) => (
              <td key={h} className={CELL_STYLE}>
                {byTime[h]
                  ? <WeatherIcon sky={byTime[h].sky} pty={byTime[h].pty} size={36} />
                  : <span className="text-slate-200">-</span>}
              </td>
            ))}
          </tr>

          {/* 기온 행 */}
          <tr className={ROW_BASE}>
            <td className={LABEL_STYLE}>기온</td>
            {HOURS.map((h) => (
              <td key={h} className={`${CELL_STYLE} tabular-nums font-extrabold text-slate-800`}
                style={{ fontSize: '1.05rem' }}>
                {byTime[h] ? `${byTime[h].tmp}°` : '-'}
              </td>
            ))}
          </tr>

          {/* 강수량 행 */}
          <tr className={ROW_BASE}>
            <td className={LABEL_STYLE}>강수량</td>
            {HOURS.map((h) => (
              <td key={h} className={CELL_STYLE}>
                {byTime[h] ? <PcpCell pcp={byTime[h].pcp} /> : '-'}
              </td>
            ))}
          </tr>

          {/* 강수확률 행 */}
          <tr className={ROW_BASE}>
            <td className={LABEL_STYLE}>강수확률</td>
            {HOURS.map((h) => (
              <td key={h} className={CELL_STYLE}>
                {byTime[h] ? <PopCell pop={byTime[h].pop} /> : '-'}
              </td>
            ))}
          </tr>

          {/* 습도 행 */}
          <tr className={ROW_BASE}>
            <td className={LABEL_STYLE}>습도</td>
            {HOURS.map((h) => (
              <td key={h} className={`${CELL_STYLE} tabular-nums text-xs text-slate-500`}>
                {byTime[h] ? `${byTime[h].reh}%` : '-'}
              </td>
            ))}
          </tr>

        </tbody>
      </table>
    </div>
  );
}
