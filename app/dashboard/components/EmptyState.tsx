import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Props {
  type: 'no-data' | 'no-range-data';
  range?: string;
}

export function EmptyState({ type, range }: Props) {
  if (type === 'no-data') {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-8 text-center">
        <div className="w-24 h-24 rounded-full border border-[#1a3554] bg-[#0c1a2e] flex items-center justify-center text-5xl">
          ◐
        </div>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#06b6d4]">GET STARTED</p>
          <h3 className="text-2xl font-bold text-white">尚無睡眠資料</h3>
          <p className="text-[#94a3b8] max-w-sm leading-relaxed">
            上傳 Apple Health 匯出的 ZIP 檔案，即可開始分析您的睡眠品質。
          </p>
        </div>
        <div className="space-y-4">
          <Button asChild className="bg-[#06b6d4] hover:bg-[#0891b2] text-[#060d18] font-semibold px-8">
            <Link href="/upload">上傳資料</Link>
          </Button>
          <p className="text-xs text-[#64748b]">
            iPhone「健康」App → 右上角頭像 → 匯出所有健康資料
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-3 text-center">
      <div className="w-14 h-14 rounded-full border border-[#1a3554] bg-[#0c1a2e] flex items-center justify-center text-2xl text-[#64748b]">
        ╌
      </div>
      <p className="text-[#94a3b8]">
        {range ? `過去 ${range} 內` : '此期間'}沒有睡眠記錄
      </p>
      <p className="text-[#64748b] text-sm">試試切換其他時間範圍</p>
    </div>
  );
}
