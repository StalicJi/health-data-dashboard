'use client';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<UploadState>('idle');
  const [message, setMessage] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) {
      setFile(accepted[0]);
      setState('idle');
      setMessage('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/zip': ['.zip'] },
    maxFiles: 1,
  });

  async function handleUpload() {
    if (!file) return;
    setState('uploading');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        setState('success');
        setTotalRecords(data.totalRecords ?? 0);
      } else {
        setState('error');
        setMessage(data.error ?? '上傳失敗');
      }
    } catch {
      setState('error');
      setMessage('網路錯誤，請重試');
    }
  }

  return (
    <Card className="bg-[#0c1a2e] border-[#1a3554]">
      <CardContent className="pt-6 space-y-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-[#06b6d4] bg-[#06b6d4]/5'
              : 'border-[#1a3554] hover:border-[#06b6d4]/50'
          }`}
        >
          <input {...getInputProps()} />
          {file ? (
            <p className="text-white font-medium">{file.name}</p>
          ) : isDragActive ? (
            <p className="text-[#06b6d4]">放開以選擇檔案</p>
          ) : (
            <>
              <p className="text-[#94a3b8]">拖曳 ZIP 檔案至此，或點擊選擇</p>
              <p className="text-xs text-[#64748b] mt-2">支援 Apple Health 匯出的 .zip 格式</p>
            </>
          )}
        </div>

        <Button
          onClick={handleUpload}
          disabled={!file || state === 'uploading'}
          className="w-full bg-[#06b6d4] hover:bg-[#0891b2] text-[#060d18] font-semibold"
        >
          {state === 'uploading' ? '上傳中...' : '開始上傳'}
        </Button>

        {state === 'success' && (
          <p className="text-emerald-400 text-center font-medium">
            成功匯入 {totalRecords.toLocaleString()} 筆睡眠記錄
          </p>
        )}
        {state === 'error' && (
          <p className="text-red-400 text-center">{message}</p>
        )}
      </CardContent>
    </Card>
  );
}
