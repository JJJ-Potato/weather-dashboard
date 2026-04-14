import { DayForecast, HourlyForecast } from '@/types/weather';
import WeatherIcon from './WeatherIcon';
import { parsePcp } from '@/lib/weather-utils';
import { FORECAST_HOURS } from '@/lib/constants';

interface Props {
  days: DayForecast[];
}

// 오늘: 06~18시 전체, 내일/모레: 06·12·18 대표 시간
const TODAY_HOURS = FORECAST_HOURS; // 13개
const FUTURE_HOURS = ['0600', '1200', '1800'] as const;

function PopCell({ pop }: { pop: number | null }) {
  if (pop === null) return <span className="text-slate-300 text-xs">-</span>;
  if (pop >= 70) return (
    <span className="tabular-nums text-red-500 font-bold text-xs bg-red-50 px-1 py-0.5 rounded-md">
      {pop}%
    </span>
  );
  if (pop >= 50) return (
    <span className="tabular-nums text-blue-600 font-bold text-xs bg-blue-50 px-1 py-0.5 rounded-md">
      {pop}%
    </span>
  );
  return <span className="tabular-nums text-slate-500 text-xs">{pop}%</span>;
}

function PcpCell({ pcp }: { pcp: string }) {
  const parsed = parsePcp(pcp);
  if (parsed === '-') return <span className="text-slate-300 text-xs">-</span>;
  return (
    <span className="tabular-nums text-blue-600 font-bold text-xs bg-blue-50 px-1 py-0.5 rounded">
      {parsed}
    </span>
  );
}

function formatDateLabel(dateStr: string): string {
  const y = parseInt(dateStr.slice(0, 4));
  const m = parseInt(dateStr.slice(4, 6));
  const d = parseInt(dateStr.slice(6, 8));
  const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
  const day = DAYS[new Date(y, m - 1, d).getDay()];
  return `${m}/${d}(${day})`;
}

const LABEL_STYLE = 'py-2 text-xs font-semibold text-slate-400 text-left pl-2 sticky left-0 bg-white z-10';
const CELL_TODAY = 'py-2 text-center bg-white';
const CELL_FUTURE = 'py-2 text-center bg-slate-50';
const ROW_BASE = 'border-b border-slate-100/70 last:border-0';

// 날짜 구분 divider 셀
function Divider({ rowSpan }: { rowSpan?: number }) {
  return (
    <td
      rowSpan={rowSpan}
      className="p-0 border-l-2 border-slate-200"
      style={{ width: '2px', minWidth: '2px' }}
    />
  );
}

export default function WeatherTable({ days }: Props) {
  if (!days || days.length === 0) {
    return <div className="text-center text-slate-300 text-sm py-6">데이터 없음</div>;
  }

  const [today, ...futureDays] = days;
  const todayMap: Record<string, HourlyForecast> = {};
  for (const fc of today.forecasts) todayMap[fc.time] = fc;

  const futureMaps = futureDays.map((day) => {
    const m: Record<string, HourlyForecast> = {};
    for (const fc of day.forecasts) m[fc.time] = fc;
    return m;
  });

  const totalDataRows = 6; // 날짜헤더 + 시간 = 구분자 rowSpan에 포함

  return (
    <div className="overflow-x-auto -mx-2">
      <table className="border-collapse text-sm" style={{ minWidth: '900px', width: '100%' }}>
        <tbody>

          {/* ── 날짜 그룹 헤더 ── */}
          <tr className="border-b-2 border-slate-200">
            <td
              className={`${LABEL_STYLE} text-center pl-0`}
              style={{ width: '52px', minWidth: '52px' }}
            >
              일자
            </td>
            {/* 오늘 */}
            <td
              colSpan={TODAY_HOURS.length}
              className="text-center py-1.5 bg-sky-50"
            >
              <span className="text-xs font-bold text-sky-600">
                {today.label} {formatDateLabel(today.date)}
              </span>
            </td>
            {futureDays.map((day, i) => [
              <Divider key={`div-${i}`} />,
              <td
                key={day.date}
                colSpan={FUTURE_HOURS.length}
                className="text-center py-1.5 bg-indigo-50"
              >
                <span className="text-xs font-bold text-indigo-500">
                  {day.label} {formatDateLabel(day.date)}
                </span>
              </td>,
            ])}
          </tr>

          {/* ── 시간 헤더 ── */}
          <tr className={ROW_BASE}>
            <td className={LABEL_STYLE} style={{ width: '52px', minWidth: '52px' }}>시간</td>
            {TODAY_HOURS.map((h) => (
              <td key={h} className="py-1.5 text-center" style={{ minWidth: '40px' }}>
                <span className="text-xs font-bold text-sky-600 bg-sky-50 px-1 py-0.5 rounded-md">
                  {h.slice(0, 2)}시
                </span>
              </td>
            ))}
            {futureDays.map((day, i) => [
              <Divider key={`tdiv-${i}`} />,
              ...FUTURE_HOURS.map((h) => (
                <td key={`${day.date}-${h}`} className="py-1.5 text-center bg-slate-50" style={{ minWidth: '56px' }}>
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                    {h.slice(0, 2)}시
                  </span>
                </td>
              )),
            ])}
          </tr>

          {/* ── 날씨 ── */}
          <tr className={ROW_BASE}>
            <td className={LABEL_STYLE}>날씨</td>
            {TODAY_HOURS.map((h) => (
              <td key={h} className={CELL_TODAY}>
                {todayMap[h]
                  ? <WeatherIcon sky={todayMap[h].sky} pty={todayMap[h].pty} size={28} />
                  : <span className="text-slate-200">-</span>}
              </td>
            ))}
            {futureMaps.map((fm, i) => [
              <Divider key={`wdiv-${i}`} />,
              ...FUTURE_HOURS.map((h) => (
                <td key={`${i}-${h}`} className={CELL_FUTURE}>
                  {fm[h]
                    ? <WeatherIcon sky={fm[h].sky} pty={fm[h].pty} size={28} />
                    : <span className="text-slate-200">-</span>}
                </td>
              )),
            ])}
          </tr>

          {/* ── 기온 ── */}
          <tr className={ROW_BASE}>
            <td className={LABEL_STYLE}>기온</td>
            {TODAY_HOURS.map((h) => (
              <td key={h} className={`${CELL_TODAY} tabular-nums font-extrabold text-slate-800`} style={{ fontSize: '0.9rem' }}>
                {todayMap[h] ? `${todayMap[h].tmp}°` : '-'}
              </td>
            ))}
            {futureMaps.map((fm, i) => [
              <Divider key={`tdiv2-${i}`} />,
              ...FUTURE_HOURS.map((h) => (
                <td key={`${i}-${h}`} className={`${CELL_FUTURE} tabular-nums font-extrabold text-slate-700`} style={{ fontSize: '0.9rem' }}>
                  {fm[h] ? `${fm[h].tmp}°` : '-'}
                </td>
              )),
            ])}
          </tr>

          {/* ── 강수량 ── */}
          <tr className={ROW_BASE}>
            <td className={LABEL_STYLE}>강수량</td>
            {TODAY_HOURS.map((h) => (
              <td key={h} className={CELL_TODAY}>
                {todayMap[h] ? <PcpCell pcp={todayMap[h].pcp} /> : '-'}
              </td>
            ))}
            {futureMaps.map((fm, i) => [
              <Divider key={`pdiv-${i}`} />,
              ...FUTURE_HOURS.map((h) => (
                <td key={`${i}-${h}`} className={CELL_FUTURE}>
                  {fm[h] ? <PcpCell pcp={fm[h].pcp} /> : '-'}
                </td>
              )),
            ])}
          </tr>

          {/* ── 강수확률 ── */}
          <tr className={ROW_BASE}>
            <td className={LABEL_STYLE}>강수%</td>
            {TODAY_HOURS.map((h) => (
              <td key={h} className={CELL_TODAY}>
                {todayMap[h] ? <PopCell pop={todayMap[h].pop} /> : <span className="text-slate-200">-</span>}
              </td>
            ))}
            {futureMaps.map((fm, i) => [
              <Divider key={`popdiv-${i}`} />,
              ...FUTURE_HOURS.map((h) => (
                <td key={`${i}-${h}`} className={CELL_FUTURE}>
                  {fm[h] ? <PopCell pop={fm[h].pop} /> : <span className="text-slate-200">-</span>}
                </td>
              )),
            ])}
          </tr>

          {/* ── 습도 ── */}
          <tr className={ROW_BASE}>
            <td className={LABEL_STYLE}>습도</td>
            {TODAY_HOURS.map((h) => (
              <td key={h} className={`${CELL_TODAY} tabular-nums text-xs text-slate-500`}>
                {todayMap[h] ? `${todayMap[h].reh}%` : '-'}
              </td>
            ))}
            {futureMaps.map((fm, i) => [
              <Divider key={`hdiv-${i}`} />,
              ...FUTURE_HOURS.map((h) => (
                <td key={`${i}-${h}`} className={`${CELL_FUTURE} tabular-nums text-xs text-slate-500`}>
                  {fm[h] ? `${fm[h].reh}%` : '-'}
                </td>
              )),
            ])}
          </tr>

        </tbody>
      </table>
    </div>
  );
}
