'use client';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { SleepDailyStats } from '@/lib/types';

interface Props {
  data: SleepDailyStats[];
}

function avg(nums: number[]) {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function SleepQualityRadar({ data }: Props) {
  if (data.length === 0) return null;

  const avgTotal = avg(data.map((d) => d.totalSleepMinutes));
  const avgDeepPct = avg(
    data.map((d) => (d.totalSleepMinutes > 0 ? (d.deepSleepMinutes / d.totalSleepMinutes) * 100 : 0))
  );
  const avgRemPct = avg(
    data.map((d) => (d.totalSleepMinutes > 0 ? (d.remSleepMinutes / d.totalSleepMinutes) * 100 : 0))
  );
  const avgCorePct = avg(
    data.map((d) => (d.totalSleepMinutes > 0 ? (d.coreSleepMinutes / d.totalSleepMinutes) * 100 : 0))
  );
  const avgScore = avg(data.map((d) => d.sleepQualityScore));

  const chartData = [
    { subject: '深層睡眠%', value: Math.round(avgDeepPct) },
    { subject: 'REM%', value: Math.round(avgRemPct) },
    { subject: '核心睡眠%', value: Math.round(avgCorePct) },
    { subject: '睡眠評分', value: Math.round(avgScore) },
    { subject: '總時長', value: Math.round(Math.min((avgTotal / 480) * 100, 100)) },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={chartData}>
        <PolarGrid stroke="#374151" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
        <Radar
          dataKey="value"
          stroke="#06b6d4"
          fill="#06b6d4"
          fillOpacity={0.3}
          name="平均"
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
          labelStyle={{ color: '#e5e7eb' }}
          formatter={(value: number) => [`${value}`, '']}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
