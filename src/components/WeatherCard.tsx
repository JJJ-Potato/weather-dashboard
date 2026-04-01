import { HourlyForecast } from '@/types/weather';
import WeatherTable from './WeatherTable';

interface Props {
  regionName: string;
  sections: string;
  forecasts: HourlyForecast[];
}

export default function WeatherCard({ regionName, sections, forecasts }: Props) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-baseline gap-2 mb-3">
        <h2 className="font-semibold text-slate-800 text-base">{regionName}</h2>
        <span className="text-slate-500 text-sm">({sections})</span>
      </div>
      <WeatherTable forecasts={forecasts} />
    </div>
  );
}
