import { WeatherAlert } from '@/types/weather';

interface Props {
  alerts: WeatherAlert[];
  hasAlert: boolean;
}

function AlertItem({ alert }: { alert: WeatherAlert }) {
  const isWarning = alert.title.includes('경보') && !alert.title.includes('주의보');
  return (
    <div
      className={`flex items-start gap-2 px-4 py-2.5 rounded-xl border ${
        isWarning
          ? 'bg-red-50 border-red-300 text-red-800'
          : 'bg-amber-50 border-amber-300 text-amber-800'
      }`}
    >
      <span className="text-lg leading-none mt-0.5">⚠️</span>
      <div>
        <span className="font-bold">{alert.title}</span>
        {alert.region && (
          <span className="ml-2 text-sm font-medium">{alert.region}</span>
        )}
        {alert.startTime && (
          <div className="text-xs mt-0.5 opacity-75">{alert.startTime}</div>
        )}
      </div>
    </div>
  );
}

export default function AlertBanner({ alerts, hasAlert }: Props) {
  if (!hasAlert) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
        <span>✅</span>
        <span>현재 발효 중인 기상특보가 없습니다</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {alerts.map((alert, i) => (
        <AlertItem key={i} alert={alert} />
      ))}
    </div>
  );
}
