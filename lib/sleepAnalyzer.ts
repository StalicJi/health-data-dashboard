import type { ParsedSleepRecord, SleepDailyStats, SleepWeeklyStats, SleepMonthlyStats } from './types';

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function avgFloat(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function getMondayOfWeek(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function getSundayOfWeek(mondayStr: string): string {
  const d = new Date(mondayStr);
  d.setDate(d.getDate() + 6);
  return d.toISOString().slice(0, 10);
}

export function calculateDailyStats(records: ParsedSleepRecord[]): SleepDailyStats[] {
  const byDate = new Map<
    string,
    { inBed: number; rem: number; core: number; deep: number; awake: number }
  >();

  for (const r of records) {
    const date = new Date(r.endDate.replace(' ', 'T').replace(/\s*([+-])(\d{2})(\d{2})$/, '$1$2:$3'))
      .toISOString()
      .slice(0, 10);

    if (!byDate.has(date)) byDate.set(date, { inBed: 0, rem: 0, core: 0, deep: 0, awake: 0 });
    const entry = byDate.get(date)!;

    switch (r.category) {
      case 'InBed': entry.inBed += r.durationMinutes; break;
      case 'AsleepREM': entry.rem += r.durationMinutes; break;
      case 'AsleepCore': entry.core += r.durationMinutes; break;
      case 'AsleepDeep': entry.deep += r.durationMinutes; break;
      case 'Awake': entry.awake += r.durationMinutes; break;
    }
  }

  const result: SleepDailyStats[] = [];

  for (const [date, v] of byDate) {
    const totalSleepMinutes = v.rem + v.core + v.deep;
    const sleepQualityScore = totalSleepMinutes > 0
      ? Math.round(
          (v.deep / totalSleepMinutes * 0.35 +
           v.core / totalSleepMinutes * 0.30 +
           v.rem / totalSleepMinutes * 0.20) * 85 +
          Math.min(totalSleepMinutes / 480, 1) * 15
        )
      : 0;

    result.push({
      date,
      inBedMinutes: v.inBed,
      remSleepMinutes: v.rem,
      coreSleepMinutes: v.core,
      deepSleepMinutes: v.deep,
      awakeMinutes: v.awake,
      totalSleepMinutes,
      sleepQualityScore,
    });
  }

  return result.sort((a, b) => a.date.localeCompare(b.date));
}

export function aggregateWeekly(dailyStats: SleepDailyStats[]): SleepWeeklyStats[] {
  const byWeek = new Map<string, SleepDailyStats[]>();

  for (const day of dailyStats) {
    const monday = getMondayOfWeek(day.date);
    if (!byWeek.has(monday)) byWeek.set(monday, []);
    byWeek.get(monday)!.push(day);
  }

  const result: SleepWeeklyStats[] = [];

  for (const [weekStart, days] of byWeek) {
    const total = days.map((d) => d.totalSleepMinutes);
    result.push({
      weekStart,
      weekEnd: getSundayOfWeek(weekStart),
      avgTotalSleepMinutes: avg(total),
      avgDeepSleepPercentage:
        avgFloat(days.map((d) => d.totalSleepMinutes > 0 ? d.deepSleepMinutes / d.totalSleepMinutes * 100 : 0)),
      avgRemSleepPercentage:
        avgFloat(days.map((d) => d.totalSleepMinutes > 0 ? d.remSleepMinutes / d.totalSleepMinutes * 100 : 0)),
      avgQualityScore: avg(days.map((d) => d.sleepQualityScore)),
    });
  }

  return result.sort((a, b) => a.weekStart.localeCompare(b.weekStart));
}

export function aggregateMonthly(dailyStats: SleepDailyStats[]): SleepMonthlyStats[] {
  const byMonth = new Map<string, SleepDailyStats[]>();

  for (const day of dailyStats) {
    const key = day.date.slice(0, 7); // "YYYY-MM"
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(day);
  }

  const result: SleepMonthlyStats[] = [];

  for (const [key, days] of byMonth) {
    const [year, month] = key.split('-').map(Number);
    result.push({
      year,
      month,
      avgTotalSleepMinutes: avg(days.map((d) => d.totalSleepMinutes)),
      avgDeepSleepPercentage:
        avgFloat(days.map((d) => d.totalSleepMinutes > 0 ? d.deepSleepMinutes / d.totalSleepMinutes * 100 : 0)),
      avgCoreSleepPercentage:
        avgFloat(days.map((d) => d.totalSleepMinutes > 0 ? d.coreSleepMinutes / d.totalSleepMinutes * 100 : 0)),
      avgRemSleepPercentage:
        avgFloat(days.map((d) => d.totalSleepMinutes > 0 ? d.remSleepMinutes / d.totalSleepMinutes * 100 : 0)),
      avgQualityScore: avg(days.map((d) => d.sleepQualityScore)),
    });
  }

  return result.sort((a, b) => a.year - b.year || a.month - b.month);
}
