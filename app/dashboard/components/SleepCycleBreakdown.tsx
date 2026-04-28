'use client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { SleepDailyStats } from '@/lib/types';
import { formatDate, formatMinutes } from '@/lib/utils';

interface Props {
  data: SleepDailyStats[];
}

export function SleepCycleBreakdown({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
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
          formatter={(value: number, name: string) => [formatMinutes(value), name]}
          labelFormatter={(label) => formatDate(label)}
        />
        <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
        <Bar dataKey="remSleepMinutes" stackId="sleep" fill="#8b5cf6" name="REM睡眠" />
        <Bar dataKey="coreSleepMinutes" stackId="sleep" fill="#3b82f6" name="核心睡眠" />
        <Bar dataKey="deepSleepMinutes" stackId="sleep" fill="#1e3a8a" name="深層睡眠" />
        <Bar dataKey="awakeMinutes" stackId="sleep" fill="#f97316" name="清醒" />
      </BarChart>
    </ResponsiveContainer>
  );
}
