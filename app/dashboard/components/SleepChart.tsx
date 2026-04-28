'use client';
import {
  LineChart,
  Line,
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

const LINES = [
  { key: 'remSleepMinutes', color: '#8b5cf6', label: 'REM睡眠' },
  { key: 'coreSleepMinutes', color: '#3b82f6', label: '核心睡眠' },
  { key: 'deepSleepMinutes', color: '#1e3a8a', label: '深層睡眠' },
  { key: 'awakeMinutes', color: '#f97316', label: '清醒' },
] as const;

export function SleepChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
        {LINES.map(({ key, color, label }) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={color}
            name={label}
            dot={false}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
