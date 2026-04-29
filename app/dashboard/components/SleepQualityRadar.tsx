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
    <div className="bg-[#0c1a2e] border border-[#1a3554] rounded-xl p-4">
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={chartData}>
          <PolarGrid stroke="#1a3554" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
          <Radar
            dataKey="value"
            stroke="#06b6d4"
            fill="#06b6d4"
            fillOpacity={0.3}
            name="平均"
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#0c1a2e', border: '1px solid #1a3554', borderRadius: 8, color: '#e2e8f0' }}
            labelStyle={{ color: '#e2e8f0' }}
            formatter={(value: number) => [`${value}`, '']}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
