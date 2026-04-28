'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SleepStatsCard } from '@/app/dashboard/components/SleepStatsCard';
import { SleepChart } from '@/app/dashboard/components/SleepChart';
import { SleepTrendChart } from '@/app/dashboard/components/SleepTrendChart';
import { SleepCycleBreakdown } from '@/app/dashboard/components/SleepCycleBreakdown';
import { SleepQualityRadar } from '@/app/dashboard/components/SleepQualityRadar';
import { EmptyState } from '@/app/dashboard/components/EmptyState';
import { formatMinutes } from '@/lib/utils';
import type { SleepDailyStats, SleepMonthlyStats, SleepYearlyStats } from '@/lib/types';

type Range = '7d' | '30d' | '90d';

function getDateRange(range: Range): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  start.setDate(start.getDate() - days);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

function avgOf(arr: number[]) {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export default function HomePage() {
  const [range, setRange] = useState<Range>('30d');
  const year = new Date().getFullYear();
  const { startDate, endDate } = getDateRange(range);

  const {
    data: dailyData,
    isLoading: loadingDaily,
  } = useQuery<SleepDailyStats[]>({
    queryKey: ['sleep-daily', startDate, endDate],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/sleep/daily?startDate=${startDate}&endDate=${endDate}`);
        if (!res.ok) return [];
        const json = await res.json();
        return json.data ?? [];
      } catch {
        return [];
      }
    },
  });

  const { data: monthlyData, isLoading: loadingMonthly } = useQuery<SleepMonthlyStats[]>({
    queryKey: ['sleep-monthly', year],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/sleep/monthly?year=${year}`);
        if (!res.ok) return [];
        const json = await res.json();
        return json.data ?? [];
      } catch {
        return [];
      }
    },
  });

  const { data: yearlyData, isLoading: loadingYearly } = useQuery<SleepYearlyStats[]>({
    queryKey: ['sleep-yearly'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/sleep/yearly');
        if (!res.ok) return [];
        const json = await res.json();
        return json.data ?? [];
      } catch {
        return [];
      }
    },
  });

  const daily = dailyData ?? [];
  const monthly = monthlyData ?? [];

  const avgSleep = Math.round(avgOf(daily.map((d) => d.totalSleepMinutes)));
  const avgScore = Math.round(avgOf(daily.map((d) => d.sleepQualityScore)));
  const avgDeepPct = Math.round(
    avgOf(daily.map((d) => (d.totalSleepMinutes > 0 ? (d.deepSleepMinutes / d.totalSleepMinutes) * 100 : 0)))
  );
  const avgRemPct = Math.round(
    avgOf(daily.map((d) => (d.totalSleepMinutes > 0 ? (d.remSleepMinutes / d.totalSleepMinutes) * 100 : 0)))
  );

  const isLoading = loadingDaily || loadingMonthly || loadingYearly;
  const hasEverUploaded = (yearlyData ?? []).length > 0;
  const rangeLabel = range === '7d' ? '7 天' : range === '30d' ? '30 天' : '90 天';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">載入中...</div>
    );
  }

  if (!hasEverUploaded) {
    return <EmptyState type="no-data" />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">睡眠總覽</h2>
        <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
          <TabsList className="bg-gray-800">
            <TabsTrigger value="7d">7天</TabsTrigger>
            <TabsTrigger value="30d">30天</TabsTrigger>
            <TabsTrigger value="90d">90天</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {daily.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <SleepStatsCard title="平均睡眠時間" value={formatMinutes(avgSleep)} />
            <SleepStatsCard title="睡眠評分" value={`${avgScore}`} subtitle="滿分 100" />
            <SleepStatsCard title="深度睡眠" value={`${avgDeepPct}%`} />
            <SleepStatsCard title="REM 睡眠" value={`${avgRemPct}%`} />
          </div>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-200">每日睡眠分佈</h3>
            <SleepChart data={daily} />
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-200">睡眠週期堆疊</h3>
            <SleepCycleBreakdown data={daily} />
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-200">睡眠品質雷達</h3>
            <SleepQualityRadar data={daily} />
          </section>
        </>
      ) : (
        <EmptyState type="no-range-data" range={rangeLabel} />
      )}

      {monthly.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-200">{year} 年月度趨勢</h3>
          <SleepTrendChart data={monthly} />
        </section>
      )}
    </div>
  );
}
