'use client';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useTheme } from 'next-themes';
import type { SleepDailyStats } from '@/lib/types';
import { getChartColors } from '@/lib/chartTheme';

interface Props {
  data: SleepDailyStats[];
}

function avg(nums: number[]) {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function SleepQualityRadar({ data }: Props) {
  const { resolvedTheme } = useTheme();
  const c = getChartColors(resolvedTheme === 'dark');

  const sleepDays = data.filter((d) => d.totalSleepMinutes > 0);
  if (sleepDays.length === 0) return null;

  const avgTotal = avg(sleepDays.map((d) => d.totalSleepMinutes));
  const avgDeepPct = avg(sleepDays.map((d) => (d.deepSleepMinutes / d.totalSleepMinutes) * 100));
  const avgRemPct = avg(sleepDays.map((d) => (d.remSleepMinutes / d.totalSleepMinutes) * 100));
  const avgCorePct = avg(sleepDays.map((d) => (d.coreSleepMinutes / d.totalSleepMinutes) * 100));
  const avgScore = avg(sleepDays.map((d) => d.sleepQualityScore));

  const chartData = [
    { subject: '深層睡眠%', value: Math.round(avgDeepPct) },
    { subject: 'REM%', value: Math.round(avgRemPct) },
    { subject: '核心睡眠%', value: Math.round(avgCorePct) },
    { subject: '睡眠評分', value: Math.round(avgScore) },
    { subject: '總時長', value: Math.round(Math.min((avgTotal / 480) * 100, 100)) },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={chartData}>
          <PolarGrid stroke={c.gridStroke} />
          <PolarAngleAxis dataKey="subject" tick={{ fill: c.tickFill, fontSize: 12 }} />
          <Radar
            dataKey="value"
            stroke="#06b6d4"
            fill="#06b6d4"
            fillOpacity={0.3}
            name="平均"
          />
          <Tooltip
            contentStyle={{ backgroundColor: c.tooltipBg, border: c.tooltipBorder, borderRadius: 8, color: c.tooltipText }}
            labelStyle={{ color: c.tooltipText }}
            formatter={(value: number) => [`${value}`, '']}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
