'use client';

import { useEffect, useState, useCallback } from 'react';
import { DashboardData, RegionWeather, WeatherAlert } from '@/types/weather';
import { REGIONS } from '@/lib/constants';
import Header from '@/components/Header';
import AlertBanner from '@/components/AlertBanner';
import WeatherCard from '@/components/WeatherCard';
import SendButtons from '@/components/SendButtons';
import LoadingSpinner from '@/components/LoadingSpinner';

const REFRESH_INTERVAL = 10 * 60 * 1000; // 10분
const LAZY_REGION_IDS = ['sindun', 'docheok'] as const;
type LazyRegionId = typeof LAZY_REGION_IDS[number];
type LazyState = 'idle' | 'loading' | 'error' | RegionWeather;

const LAZY_REGION_INFO = REGIONS.filter((r) =>
  (LAZY_REGION_IDS as readonly string[]).includes(r.id)
);

export default function DashboardPage() {
  const [weatherData, setWeatherData] = useState<DashboardData | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [hasAlert, setHasAlert] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lazyRegions, setLazyRegions] = useState<Record<LazyRegionId, LazyState>>({
    sindun: 'idle',
    docheok: 'idle',
  });

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

  const loadLazyRegion = useCallback(async (regionId: LazyRegionId) => {
    setLazyRegions((prev) => ({ ...prev, [regionId]: 'loading' }));
    try {
      const res = await fetch(`/api/weather?regionId=${regionId}`);
      if (!res.ok) throw new Error('조회 실패');
      const data: DashboardData = await res.json();
      const region = data.regions[0];
      setLazyRegions((prev) => ({ ...prev, [regionId]: region }));
    } catch {
      setLazyRegions((prev) => ({ ...prev, [regionId]: 'error' }));
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
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-5">
      <Header
        queryTime={weatherData?.queryTime ?? ''}
        isNextDay={weatherData?.isNextDay ?? false}
      />
      <AlertBanner alerts={alerts} hasAlert={hasAlert} />

      <div className="flex flex-col gap-4">
        {/* 기본 지역: 자동 조회 */}
        {weatherData?.regions.map((region, idx) => (
          <WeatherCard
            key={region.regionId}
            regionName={region.regionName}
            sections={region.sections}
            days={region.days}
            accentIndex={idx}
          />
        ))}

        {/* 추가 지역: 버튼 클릭 시 조회 */}
        {LAZY_REGION_INFO.map((info) => {
          const state = lazyRegions[info.id as LazyRegionId];

          if (state === 'idle') {
            return (
              <button
                key={info.id}
                onClick={() => loadLazyRegion(info.id as LazyRegionId)}
                className="glass-card p-5 flex items-center justify-between w-full text-left hover:bg-white/60 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">📍</span>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{info.name}</p>
                    <p className="text-slate-400 text-xs">{info.sections}</p>
                  </div>
                </div>
                <span className="text-[18px] text-blue-600 font-semibold group-hover:text-sky-600 bg-sky-50 px-3 py-1.5 rounded-[175px]">
                  날씨 조회
                </span>
              </button>
            );
          }

          if (state === 'loading') {
            return (
              <div key={info.id} className="glass-card p-5 flex items-center gap-3">
                <span className="text-base">📍</span>
                <span className="text-sm text-slate-500 font-medium">{info.name}</span>
                <span className="text-xs text-slate-400 animate-pulse">조회 중...</span>
              </div>
            );
          }

          if (state === 'error') {
            return (
              <div key={info.id} className="glass-card p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">📍</span>
                  <span className="text-sm text-slate-800 font-bold">{info.name}</span>
                  <span className="text-xs text-red-400">조회 실패</span>
                </div>
                <button
                  onClick={() => loadLazyRegion(info.id as LazyRegionId)}
                  className="text-xs text-sky-500 font-semibold bg-sky-50 px-3 py-1.5 rounded-lg hover:bg-sky-100 transition-colors"
                >
                  다시 시도
                </button>
              </div>
            );
          }

          // 조회 완료: WeatherCard 표시
          return (
            <WeatherCard
              key={info.id}
              regionName={state.regionName}
              sections={state.sections}
              days={state.days}
              accentIndex={LAZY_REGION_INFO.indexOf(info) + 2}
            />
          );
        })}
      </div>

      <SendButtons weatherData={weatherData} alerts={alerts} />
    </main>
  );
}
