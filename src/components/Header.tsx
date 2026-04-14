interface Props {
  queryTime: string;
  isNextDay: boolean;
}

export default function Header({ queryTime, isNextDay }: Props) {
  return (
    <div className="glass-header px-6 py-5 text-center">
      {/* 아이콘 */}
      <div className="text-4xl mb-2 select-none">⛅</div>

      {/* 제목 */}
      <h1
        className="text-[27px] font-bold tracking-tight"
        style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #0369a1 50%, #0e7490 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        수도권 제2순환선(양평-이천)
      </h1>
      <p className="text-[20px] font-semibold text-sky-700 mt-0.5 tracking-wide">
        현장 날씨 현황
      </p>

      {/* 구분선 */}
      <div className="mx-auto my-3 h-px w-24 rounded-full bg-gradient-to-r from-transparent via-sky-300 to-transparent" />

      {/* 조회시간 */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-[17px] text-blue-600">{queryTime}</span>
        {isNextDay && (
          <span className="bg-gradient-to-r from-blue-500 to-sky-500 text-white text-xs px-2.5 py-0.5 rounded-full font-semibold shadow-sm">
            내일
          </span>
        )}
      </div>
    </div>
  );
}
