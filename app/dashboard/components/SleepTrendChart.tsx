'use client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { SleepMonthlyStats } from '@/lib/types';
import { formatMinutes } from '@/lib/utils';

interface Props {
  data: SleepMonthlyStats[];
}

export function SleepTrendChart({ data }: Props) {
  const chartData = data.map((d) => ({ ...d, monthLabel: `${d.month}月` }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="monthLabel"
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => formatMinutes(v)}
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
          labelStyle={{ color: '#e5e7eb' }}
          formatter={(value: number) => [formatMinutes(value), '平均睡眠時間']}
        />
        <Line
          type="monotone"
          dataKey="avgTotalSleepMinutes"
          stroke="#06b6d4"
          name="平均睡眠時間"
          dot={{ fill: '#06b6d4' }}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
