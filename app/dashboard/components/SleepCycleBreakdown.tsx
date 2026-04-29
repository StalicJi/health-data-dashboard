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
    <div className="bg-[#0c1a2e] border border-[#1a3554] rounded-xl p-4">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
            cursor={{ fill: 'rgba(0, 0, 0, 0.35)' }}
            contentStyle={{ backgroundColor: '#0c1a2e', border: '1px solid #1a3554', borderRadius: 8, color: '#e2e8f0' }}
            labelStyle={{ color: '#e2e8f0' }}
            formatter={(value: number | string, name: string) => [typeof value === 'number' ? formatMinutes(value) : value, name]}
            labelFormatter={(label) => formatDate(label)}
          />
          <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
          <Bar dataKey="remSleepMinutes" stackId="sleep" fill="#7c3aed" name="REM睡眠" />
          <Bar dataKey="coreSleepMinutes" stackId="sleep" fill="#0284c7" name="核心睡眠" />
          <Bar dataKey="deepSleepMinutes" stackId="sleep" fill="#0e7490" name="深層睡眠" />
          <Bar dataKey="awakeMinutes" stackId="sleep" fill="#ea580c" name="清醒" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
