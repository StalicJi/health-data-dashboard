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
        <div className="w-24 h-24 rounded-full border border-border bg-card flex items-center justify-center text-5xl">
          ◐
        </div>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">GET STARTED</p>
          <h3 className="text-2xl font-bold text-foreground">尚無睡眠資料</h3>
          <p className="text-muted-foreground max-w-sm leading-relaxed">
            上傳 Apple Health 匯出的 ZIP 檔案，即可開始分析您的睡眠品質。
          </p>
        </div>
        <div className="space-y-4">
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8">
            <Link href="/upload">上傳資料</Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            iPhone「健康」App → 右上角頭像 → 匯出所有健康資料
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-3 text-center">
      <div className="w-14 h-14 rounded-full border border-border bg-card flex items-center justify-center text-2xl text-muted-foreground">
        ╌
      </div>
      <p className="text-muted-foreground">
        {range ? `過去 ${range} 內` : '此期間'}沒有睡眠記錄
      </p>
      <p className="text-muted-foreground text-sm">試試切換其他時間範圍</p>
    </div>
  );
}
