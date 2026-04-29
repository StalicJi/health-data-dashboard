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
  { key: 'remSleepMinutes', color: '#7c3aed', label: 'REM睡眠' },
  { key: 'coreSleepMinutes', color: '#0284c7', label: '核心睡眠' },
  { key: 'deepSleepMinutes', color: '#0e7490', label: '深層睡眠' },
  { key: 'awakeMinutes', color: '#ea580c', label: '清醒' },
] as const;

export function SleepChart({ data }: Props) {
  return (
    <div className="bg-[#0c1a2e] border border-[#1a3554] rounded-xl p-4">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a3554" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
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
            contentStyle={{ backgroundColor: '#0c1a2e', border: '1px solid #1a3554', borderRadius: 8 }}
            labelStyle={{ color: '#e2e8f0' }}
            formatter={(value: number, name: string) => [formatMinutes(value), name]}
            labelFormatter={(label) => formatDate(label)}
          />
          <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
          {LINES.map(({ key, color, label }) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={color}
              name={label}
              dot={false}
              strokeWidth={2}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
