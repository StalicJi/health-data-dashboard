import Link from 'next/link';
import { FileUploader } from './components/FileUploader';

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
            ← 返回總覽
          </Link>
        </div>
        <h1 className="text-3xl font-bold">上傳 Apple Health 資料</h1>
        <p className="text-gray-400">
          從 Apple Health App 匯出資料後，上傳 ZIP 檔案即可開始分析。
        </p>
        <FileUploader />
      </div>
    </div>
  );
}
