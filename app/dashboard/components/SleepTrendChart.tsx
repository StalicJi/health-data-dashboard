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
    <div className="bg-[#0c1a2e] border border-[#1a3554] rounded-xl p-4">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a3554" />
          <XAxis
            dataKey="monthLabel"
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => formatMinutes(v)}
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#0c1a2e', border: '1px solid #1a3554', borderRadius: 8, color: '#e2e8f0' }}
            labelStyle={{ color: '#e2e8f0' }}
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
    </div>
  );
}
