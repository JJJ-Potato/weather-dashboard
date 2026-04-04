'use client';

import { useState } from 'react';
import { DashboardData, WeatherAlert } from '@/types/weather';
import { formatDailyForecast } from '@/lib/message-formatter';

interface Props {
  weatherData: DashboardData | null;
  alerts: WeatherAlert[];
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

export default function SendButtons({ weatherData, alerts }: Props) {
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function handleBand() {
    if (!weatherData) return;
    const text = formatDailyForecast(weatherData, alerts);
    const shareUrl = `https://band.us/plugin/share?body=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
  }

  async function handleTelegram() {
    if (!weatherData) return;
    setTelegramLoading(true);
    try {
      const res = await fetch('/api/send-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weatherData, alerts }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('텔레그램 발송 완료', 'success');
      } else {
        showToast(data.message ?? '발송 실패', 'error');
      }
    } catch {
      showToast('텔레그램 발송 중 오류가 발생했습니다', 'error');
    } finally {
      setTelegramLoading(false);
    }
  }

  const disabled = !weatherData;

  return (
    <div className="relative">
      <div className="flex gap-3 justify-center py-4">
        <button
          onClick={handleBand}
          disabled={disabled}
          className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-xl px-6 py-3 font-medium transition-colors text-sm"
        >
          📢 밴드 발송
        </button>
        <button
          onClick={handleTelegram}
          disabled={disabled || telegramLoading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-xl px-6 py-3 font-medium transition-colors text-sm"
        >
          {telegramLoading ? '발송 중...' : '✈️ 텔레그램 발송'}
        </button>
      </div>
      {disabled && (
        <p className="text-center text-slate-400 text-xs -mt-2">데이터 로딩 중</p>
      )}

      {/* 토스트 */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-white text-sm font-medium shadow-lg z-50 transition-opacity ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
