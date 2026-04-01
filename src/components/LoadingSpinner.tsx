export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      <p className="text-slate-500 text-sm">날씨 정보를 불러오는 중...</p>
    </div>
  );
}
