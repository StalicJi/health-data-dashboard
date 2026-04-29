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
import { useTheme } from 'next-themes';
import type { SleepDailyStats } from '@/lib/types';
import { formatDate, formatMinutes } from '@/lib/utils';
import { getChartColors } from '@/lib/chartTheme';

interface Props {
  data: SleepDailyStats[];
}

export function SleepCycleBreakdown({ data }: Props) {
  const { resolvedTheme } = useTheme();
  const c = getChartColors(resolvedTheme === 'dark');

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={c.gridStroke} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
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
            cursor={{ fill: c.cursorFill }}
            contentStyle={{ backgroundColor: c.tooltipBg, border: c.tooltipBorder, borderRadius: 8, color: c.tooltipText }}
            labelStyle={{ color: c.tooltipText }}
            formatter={(value: number | string, name: string) => [typeof value === 'number' ? formatMinutes(value) : value, name]}
            labelFormatter={(label) => formatDate(label)}
          />
          <Legend wrapperStyle={{ color: c.legendColor, fontSize: 12 }} />
          <Bar dataKey="remSleepMinutes" stackId="sleep" fill="#7c3aed" name="REM睡眠" />
          <Bar dataKey="coreSleepMinutes" stackId="sleep" fill="#0284c7" name="核心睡眠" />
          <Bar dataKey="deepSleepMinutes" stackId="sleep" fill="#0e7490" name="深層睡眠" />
          <Bar dataKey="awakeMinutes" stackId="sleep" fill="#ea580c" name="清醒" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
