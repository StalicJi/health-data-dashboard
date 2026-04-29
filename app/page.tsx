'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SleepStatsCard } from '@/app/dashboard/components/SleepStatsCard';
import { SleepChart } from '@/app/dashboard/components/SleepChart';
import { SleepTrendChart } from '@/app/dashboard/components/SleepTrendChart';
import { SleepCycleBreakdown } from '@/app/dashboard/components/SleepCycleBreakdown';
import { SleepQualityRadar } from '@/app/dashboard/components/SleepQualityRadar';
import { SleepWearCalendar } from '@/app/dashboard/components/SleepWearCalendar';
import { EmptyState } from '@/app/dashboard/components/EmptyState';
import { formatMinutes } from '@/lib/utils';
import { fillDateRange } from '@/lib/sleepAnalyzer';
import type { SleepDailyStats, SleepMonthlyStats, SleepYearlyStats, SleepDailyStatsOrGap } from '@/lib/types';

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

  const { data: dailyData, isLoading: loadingDaily } = useQuery<SleepDailyStats[]>({
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

  const totalDays = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const wornDays = daily.length;
  const notWornDays = Math.max(0, totalDays - wornDays);
  const wearRate = totalDays > 0 ? Math.round((wornDays / totalDays) * 100) : 0;
  const filledDaily: SleepDailyStatsOrGap[] = daily.length > 0 ? fillDateRange(daily, startDate, endDate) : [];

  // 只用實際有睡眠階段資料的天計算平均，排除 InBed-only 或未佩戴的零值天
  const sleepDays = daily.filter((d) => d.totalSleepMinutes > 0);

  const avgSleep = Math.round(avgOf(sleepDays.map((d) => d.totalSleepMinutes)));
  const avgScore = Math.round(avgOf(sleepDays.map((d) => d.sleepQualityScore)));
  const avgDeepPct = Math.round(
    avgOf(sleepDays.map((d) => (d.deepSleepMinutes / d.totalSleepMinutes) * 100))
  );
  const avgRemPct = Math.round(
    avgOf(sleepDays.map((d) => (d.remSleepMinutes / d.totalSleepMinutes) * 100))
  );

  const isLoading = loadingDaily || loadingMonthly || loadingYearly;
  const hasEverUploaded = (yearlyData ?? []).length > 0;
  const rangeLabel = range === '7d' ? '7 天' : range === '30d' ? '30 天' : '90 天';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 rounded-full animate-spin border-2 border-border border-t-primary" />
      </div>
    );
  }

  if (!hasEverUploaded) {
    return <EmptyState type="no-data" />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          SLEEP ANALYTICS
        </p>
        <h1 className="text-4xl font-bold text-foreground">睡眠總覽</h1>
      </div>

      <div className="flex items-center justify-end">
        <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
          <TabsList className="bg-card border border-border p-1 rounded-full">
            <TabsTrigger
              value="7d"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 text-muted-foreground data-[state=active]:font-semibold"
            >
              7天
            </TabsTrigger>
            <TabsTrigger
              value="30d"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 text-muted-foreground data-[state=active]:font-semibold"
            >
              30天
            </TabsTrigger>
            <TabsTrigger
              value="90d"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 text-muted-foreground data-[state=active]:font-semibold"
            >
              90天
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {daily.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <SleepStatsCard title="平均睡眠時間" value={formatMinutes(avgSleep)} />
            <SleepStatsCard title="睡眠評分" value={`${avgScore}`} subtitle="滿分 100" />
            <SleepStatsCard title="深度睡眠" value={`${avgDeepPct}%`} />
            <SleepStatsCard title="REM 睡眠" value={`${avgRemPct}%`} />
            <SleepStatsCard title="佩戴天數" value={`${wornDays} 天`} subtitle={`共 ${totalDays} 天`} />
            <SleepStatsCard title="未佩戴天數" value={`${notWornDays} 天`} subtitle={`佩戴率 ${wearRate}%`} />
          </div>

          <section className="space-y-4">
            <h3
              className="text-base font-semibold text-foreground uppercase tracking-wide border-l-2 border-primary pl-3"
            >
              每日睡眠分佈
            </h3>
            <SleepChart data={daily} />
          </section>

          <section className="space-y-4">
            <h3
              className="text-base font-semibold text-foreground uppercase tracking-wide border-l-2 border-primary pl-3"
            >
              睡眠週期堆疊
            </h3>
            <SleepCycleBreakdown data={daily} />
          </section>

          <section className="space-y-4">
            <h3
              className="text-base font-semibold text-foreground uppercase tracking-wide border-l-2 border-primary pl-3"
            >
              睡眠品質雷達
            </h3>
            <SleepQualityRadar data={daily} />
          </section>

          <section className="space-y-4">
            <h3
              className="text-base font-semibold text-foreground uppercase tracking-wide border-l-2 border-primary pl-3"
            >
              每週佩戴記錄
            </h3>
            <SleepWearCalendar data={filledDaily} />
          </section>
        </>
      ) : (
        <EmptyState type="no-range-data" range={rangeLabel} />
      )}

      {monthly.length > 0 && (
        <section className="space-y-4">
          <h3
            className="text-base font-semibold text-foreground uppercase tracking-wide border-l-2 border-primary pl-3"
          >
            {year} 年月度趨勢
          </h3>
          <SleepTrendChart data={monthly} />
        </section>
      )}
    </div>
  );
}
