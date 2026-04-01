'use client';

import { useEffect, useState, useCallback } from 'react';
import { DashboardData, WeatherAlert } from '@/types/weather';
import Header from '@/components/Header';
import AlertBanner from '@/components/AlertBanner';
import WeatherCard from '@/components/WeatherCard';
import SendButtons from '@/components/SendButtons';
import LoadingSpinner from '@/components/LoadingSpinner';

const REFRESH_INTERVAL = 10 * 60 * 1000; // 10분

export default function DashboardPage() {
  const [weatherData, setWeatherData] = useState<DashboardData | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [hasAlert, setHasAlert] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const [weatherRes, alertRes] = await Promise.all([
        fetch('/api/weather'),
        fetch('/api/alert'),
      ]);

      if (!weatherRes.ok) throw new Error('날씨 데이터 조회 실패');
      if (!alertRes.ok) throw new Error('기상특보 조회 실패');

      const weather: DashboardData = await weatherRes.json();
      const alertData = await alertRes.json();

      setWeatherData(weather);
      setAlerts(alertData.alerts ?? []);
      setHasAlert(alertData.hasAlert ?? false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-500 text-sm">{error}</p>
        <button
          onClick={() => { setLoading(true); fetchData(); }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <Header
        queryTime={weatherData?.queryTime ?? ''}
        isNextDay={weatherData?.isNextDay ?? false}
      />
      <AlertBanner alerts={alerts} hasAlert={hasAlert} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {weatherData?.regions.map((region) => (
          <WeatherCard
            key={region.regionId}
            regionName={region.regionName}
            sections={region.sections}
            forecasts={region.forecasts}
          />
        ))}
      </div>
      <SendButtons weatherData={weatherData} alerts={alerts} />
    </main>
  );
}
