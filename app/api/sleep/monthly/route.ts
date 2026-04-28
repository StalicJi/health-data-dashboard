import { type NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import type { SleepMonthlyStats } from '@/lib/types';

const USER_ID = 1;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const year = Number(searchParams.get('year') ?? new Date().getFullYear());

  const rows = await prisma.sleepMonthly.findMany({
    where: { userId: USER_ID, year },
    orderBy: { month: 'asc' },
  });

  const data: SleepMonthlyStats[] = rows.map((r) => ({
    year: r.year,
    month: r.month,
    avgTotalSleepMinutes: r.avgTotalSleepMinutes ?? 0,
    avgDeepSleepPercentage: r.avgDeepSleepPercentage ?? 0,
    avgCoreSleepPercentage: r.avgCoreSleepPercentage ?? 0,
    avgRemSleepPercentage: r.avgRemSleepPercentage ?? 0,
    avgQualityScore: r.avgQualityScore ?? 0,
  }));

  return Response.json({ success: true, data });
}
