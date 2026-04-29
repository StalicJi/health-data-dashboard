import Link from 'next/link';
import { FileUploader } from './components/FileUploader';

export default function UploadPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
      >
        ← 返回總覽
      </Link>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">DATA IMPORT</p>
        <h1 className="text-3xl font-bold text-foreground">上傳 Apple Health 資料</h1>
        <p className="text-muted-foreground leading-relaxed">
          從 Apple Health App 匯出資料後，上傳 ZIP 檔案即可開始分析。
        </p>
      </div>
      <div className="h-px bg-border" />
      <FileUploader />
    </div>
  );
}
