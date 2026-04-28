import { type NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import type { SleepDailyStats } from '@/lib/types';

const USER_ID = 1;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const rows = await prisma.sleepDaily.findMany({
    where: {
      userId: USER_ID,
      ...(startDate || endDate
        ? {
            date: {
              ...(startDate ? { gte: new Date(startDate) } : {}),
              ...(endDate ? { lte: new Date(endDate) } : {}),
            },
          }
        : {}),
    },
    orderBy: { date: 'asc' },
  });

  const data: SleepDailyStats[] = rows.map((r) => ({
    date: r.date.toISOString().slice(0, 10),
    inBedMinutes: r.inBedMinutes ?? 0,
    remSleepMinutes: r.remSleepMinutes ?? 0,
    coreSleepMinutes: r.coreSleepMinutes ?? 0,
    deepSleepMinutes: r.deepSleepMinutes ?? 0,
    awakeMinutes: r.awakeMinutes ?? 0,
    totalSleepMinutes: r.totalSleepMinutes ?? 0,
    sleepQualityScore: r.sleepQualityScore ?? 0,
  }));

  return Response.json({ success: true, data });
}
