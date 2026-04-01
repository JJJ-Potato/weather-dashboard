interface Props {
  queryTime: string;
  isNextDay: boolean;
}

export default function Header({ queryTime, isNextDay }: Props) {
  return (
    <div className="text-center py-2">
      <h1 className="text-xl font-bold text-slate-800">
        수도권 제2순환선(양평-이천)
      </h1>
      <p className="text-lg font-medium text-slate-600 mt-0.5">현장 날씨 현황</p>
      <div className="flex items-center justify-center gap-2 mt-1.5">
        <span className="text-sm text-slate-500">{queryTime}</span>
        {isNextDay && (
          <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
            내일
          </span>
        )}
      </div>
    </div>
  );
}
