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
import type { SleepDailyStatsOrGap } from '@/lib/types';

interface Props {
  data: SleepDailyStatsOrGap[];
}

function getMondayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  const m = d.getMonth() + 1;
  const dd = d.getDate();
  return `${m}/${dd}`;
}

function getMondayKey(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

interface WeekBucket {
  weekLabel: string;
  worn: number;
  notWorn: number;
}

function buildWeeklyBuckets(data: SleepDailyStatsOrGap[]): WeekBucket[] {
  const map = new Map<string, WeekBucket>();

  for (const d of data) {
    const key = getMondayKey(d.date);
    if (!map.has(key)) {
      map.set(key, { weekLabel: getMondayLabel(d.date), worn: 0, notWorn: 0 });
    }
    const bucket = map.get(key)!;
    if (d.hasData) {
      bucket.worn += 1;
    } else {
      bucket.notWorn += 1;
    }
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v);
}

export function SleepWearCalendar({ data }: Props) {
  const chartData = buildWeeklyBuckets(data);

  return (
    <div className="bg-[#0c1a2e] border border-[#1a3554] rounded-xl p-4">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }} barSize={32}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a3554" vertical={false} />
          <XAxis
            dataKey="weekLabel"
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickLine={false}
            label={{ value: '週開始（週一）', position: 'insideBottom', offset: -2, fill: '#64748b', fontSize: 11 }}
          />
          <YAxis
            tickCount={8}
            domain={[0, 7]}
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            label={{ value: '天數', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
          />
          <Tooltip
            cursor={{ fill: 'rgba(0, 0, 0, 0.35)' }}
            contentStyle={{ backgroundColor: '#0c1a2e', border: '1px solid #1a3554', borderRadius: 8 }}
            labelStyle={{ color: '#e2e8f0' }}
            formatter={(value: number | string, name: string) => [`${value} 天`, name]}
          />
          <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
          <Bar dataKey="worn" stackId="week" fill="#06b6d4" name="有睡眠紀錄" radius={[0, 0, 0, 0]} />
          <Bar dataKey="notWorn" stackId="week" fill="#1a3554" name="未佩戴" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
