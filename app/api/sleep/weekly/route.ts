import { type NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import type { SleepWeeklyStats } from '@/lib/types';

const USER_ID = 1;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const year = Number(searchParams.get('year') ?? new Date().getFullYear());

  const rows = await prisma.sleepWeekly.findMany({
    where: {
      userId: USER_ID,
      weekStartDate: {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`),
      },
    },
    orderBy: { weekStartDate: 'asc' },
  });

  const data: SleepWeeklyStats[] = rows.map((r) => ({
    weekStart: r.weekStartDate.toISOString().slice(0, 10),
    weekEnd: r.weekEndDate.toISOString().slice(0, 10),
    avgTotalSleepMinutes: r.avgTotalSleepMinutes ?? 0,
    avgDeepSleepPercentage: r.avgDeepSleepMinutes ?? 0,
    avgRemSleepPercentage: r.avgRemSleepMinutes ?? 0,
    avgQualityScore: r.avgSleepQualityScore ?? 0,
  }));

  return Response.json({ success: true, data });
}
