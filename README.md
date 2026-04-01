# 수도권 제2순환선(양평-이천) 현장 날씨 현황 대시보드

수도권 제2순환선 양평-이천 건설공사 4개 지역의 시간대별 날씨 예보와 기상특보를 한 화면에 보여주는 반응형 웹 대시보드.

## 기술 스택

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS 3**
- **Vercel** 배포

## 환경 변수 설정

`.env.example`을 복사하여 `.env.local`을 생성하고 값을 입력합니다.

```bash
cp .env.example .env.local
```

| 변수명 | 설명 |
|--------|------|
| `KMA_API_KEY` | 기상청 공공데이터포털 API 인증키 |
| `TELEGRAM_BOT_TOKEN` | 텔레그램 BotFather 발급 토큰 |
| `TELEGRAM_CHAT_ID` | 텔레그램 메시지 수신 채팅방 ID |
| `CRON_SECRET` | Cron 엔드포인트 인증용 임의 문자열 |

## 로컬 실행

```bash
npm install
# .env.local 생성 및 KMA_API_KEY 입력
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 배포

1. GitHub 저장소에 push
2. [Vercel](https://vercel.com)에서 해당 저장소 연결
3. Vercel Dashboard → Settings → Environment Variables에서 환경 변수 등록
4. 이후 push 시 자동 배포

## Cron 기능

| 엔드포인트 | 스케줄 | 설명 |
|-----------|--------|------|
| `/api/cron/daily-forecast` | 매일 08:00 KST | 날씨 예보 텔레그램 자동 발송 |
| `/api/cron/alert-check` | 10분 간격 | 기상특보 변경 감지 및 즉시 알림 |

> `alert-check`는 Vercel **Pro 플랜** 이상에서만 분 단위 Cron이 동작합니다. Hobby 플랜은 `daily-forecast`만 작동합니다.
