import { prisma } from '@/lib/db';
import type { SleepYearlyStats } from '@/lib/types';

const USER_ID = 1;

export async function GET() {
  const [dailyRows, categoryRows] = await Promise.all([
    prisma.sleepDaily.findMany({ where: { userId: USER_ID } }),
    prisma.sleepRecord.findMany({
      where: { userId: USER_ID },
      select: { date: true, category: true, durationMinutes: true },
    }),
  ]);

  const yearlyDaily = new Map<number, typeof dailyRows>();
  for (const row of dailyRows) {
    const year = row.date.getFullYear();
    if (!yearlyDaily.has(year)) yearlyDaily.set(year, []);
    yearlyDaily.get(year)!.push(row);
  }

  const yearlyRecords = new Map<number, typeof categoryRows>();
  for (const row of categoryRows) {
    const year = row.date.getFullYear();
    if (!yearlyRecords.has(year)) yearlyRecords.set(year, []);
    yearlyRecords.get(year)!.push(row);
  }

  const years = Array.from(new Set([...yearlyDaily.keys(), ...yearlyRecords.keys()])).sort();

  const data: SleepYearlyStats[] = years.map((year) => {
    const days = yearlyDaily.get(year) ?? [];
    const recs = yearlyRecords.get(year) ?? [];

    const totalMinutes = days.map((d) => d.totalSleepMinutes ?? 0);
    const avgNightlyMinutes =
      totalMinutes.length > 0
        ? Math.round(totalMinutes.reduce((a, b) => a + b, 0) / totalMinutes.length)
        : 0;

    const qualityScores = days.map((d) => d.sleepQualityScore ?? 0);
    const avgQualityScore =
      qualityScores.length > 0
        ? Math.round(qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length)
        : 0;

    const breakdown = { inBed: 0, rem: 0, core: 0, deep: 0, awake: 0 };
    for (const r of recs) {
      if (r.category === 'InBed') breakdown.inBed += r.durationMinutes;
      else if (r.category === 'AsleepREM') breakdown.rem += r.durationMinutes;
      else if (r.category === 'AsleepCore') breakdown.core += r.durationMinutes;
      else if (r.category === 'AsleepDeep') breakdown.deep += r.durationMinutes;
      else if (r.category === 'Awake') breakdown.awake += r.durationMinutes;
    }

    return {
      year,
      totalRecords: recs.length,
      avgNightlyMinutes,
      avgQualityScore,
      categoryBreakdown: breakdown,
    };
  });

  return Response.json({ success: true, data });
}
