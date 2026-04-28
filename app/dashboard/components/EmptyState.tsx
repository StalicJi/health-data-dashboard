import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Props {
  type: 'no-data' | 'no-range-data';
  range?: string;
}

export function EmptyState({ type, range }: Props) {
  if (type === 'no-data') {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-6 text-center">
        <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center text-4xl">
          🌙
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white">尚無睡眠資料</h3>
          <p className="text-gray-400 max-w-sm">
            上傳 Apple Health 匯出的 ZIP 檔案，即可開始分析您的睡眠品質。
          </p>
        </div>
        <div className="space-y-3">
          <Button asChild>
            <Link href="/upload">上傳資料</Link>
          </Button>
          <p className="text-xs text-gray-500">
            在 iPhone 的「健康」App → 右上角頭像 → 匯出所有健康資料
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-3 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-2xl">
        📊
      </div>
      <p className="text-gray-400">
        {range ? `過去 ${range} 內` : '此期間'}沒有睡眠記錄
      </p>
      <p className="text-gray-500 text-sm">試試切換其他時間範圍</p>
    </div>
  );
}
