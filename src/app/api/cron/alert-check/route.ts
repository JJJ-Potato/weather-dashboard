import { NextRequest, NextResponse } from 'next/server';
import { fetchAlerts } from '@/lib/kma-api';
import { formatAlertNotification } from '@/lib/message-formatter';
import { sendTelegramMessage } from '@/lib/telegram';
import { WeatherAlert } from '@/types/weather';
import fs from 'fs';
import path from 'path';

const TMP_FILE = path.join('/tmp', 'previous-alerts.json');

async function loadPreviousAlerts(): Promise<WeatherAlert[]> {
  // Vercel KV 미사용 시 /tmp 파일로 폴백
  try {
    if (fs.existsSync(TMP_FILE)) {
      const raw = fs.readFileSync(TMP_FILE, 'utf-8');
      return JSON.parse(raw) as WeatherAlert[];
    }
  } catch {
    // 파일 읽기 실패 시 빈 배열
  }
  return [];
}

async function savePreviousAlerts(alerts: WeatherAlert[]): Promise<void> {
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(alerts), 'utf-8');
  } catch (err) {
    console.error('savePreviousAlerts error:', err);
  }
}

function alertKey(alert: WeatherAlert): string {
  return `${alert.title}-${alert.region}`;
}

function isUpgrade(prev: WeatherAlert, curr: WeatherAlert): boolean {
  // 같은 지역에서 주의보 → 경보로 변경됐는지 확인
  return (
    prev.region === curr.region &&
    prev.title.includes('주의보') &&
    curr.title.includes('경보') &&
    !curr.title.includes('주의보')
  );
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [currentAlerts, previousAlerts] = await Promise.all([
      fetchAlerts(),
      loadPreviousAlerts(),
    ]);

    const prevKeys = new Set(previousAlerts.map(alertKey));
    const currKeys = new Set(currentAlerts.map(alertKey));

    const changes: Array<{ alert: WeatherAlert; type: 'new' | 'upgrade' | 'cancel' }> = [];

    // 신규 또는 상향
    for (const curr of currentAlerts) {
      if (!prevKeys.has(alertKey(curr))) {
        // 같은 지역의 이전 특보 확인 (상향 여부 판별)
        const prevSameRegion = previousAlerts.find((p) => isUpgrade(p, curr));
        changes.push({ alert: curr, type: prevSameRegion ? 'upgrade' : 'new' });
      }
    }

    // 해제
    for (const prev of previousAlerts) {
      if (!currKeys.has(alertKey(prev))) {
        changes.push({ alert: prev, type: 'cancel' });
      }
    }

    // 변경 건 텔레그램 발송
    for (const { alert, type } of changes) {
      const text = formatAlertNotification(alert, type);
      await sendTelegramMessage(text);
    }

    await savePreviousAlerts(currentAlerts);

    return NextResponse.json({
      checked: true,
      changes: changes.length,
      alerts: currentAlerts.length,
    });
  } catch (err) {
    console.error('GET /api/cron/alert-check error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
