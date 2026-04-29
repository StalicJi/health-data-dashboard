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
import { useTheme } from 'next-themes';
import type { SleepMonthlyStats } from '@/lib/types';
import { formatMinutes } from '@/lib/utils';
import { getChartColors } from '@/lib/chartTheme';

interface Props {
  data: SleepMonthlyStats[];
}

export function SleepTrendChart({ data }: Props) {
  const { resolvedTheme } = useTheme();
  const c = getChartColors(resolvedTheme === 'dark');

  const chartData = data.map((d) => ({ ...d, monthLabel: `${d.month}月` }));

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={c.gridStroke} />
          <XAxis
            dataKey="monthLabel"
            tick={{ fill: c.tickFill, fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => formatMinutes(v)}
            tick={{ fill: c.tickFill, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{ backgroundColor: c.tooltipBg, border: c.tooltipBorder, borderRadius: 8, color: c.tooltipText }}
            labelStyle={{ color: c.tooltipText }}
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
