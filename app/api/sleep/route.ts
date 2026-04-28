import { type NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

const USER_ID = 1;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? '20')));
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const where = {
    userId: USER_ID,
    ...(startDate || endDate
      ? {
          date: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: new Date(endDate) } : {}),
          },
        }
      : {}),
  };

  const [records, total] = await Promise.all([
    prisma.sleepRecord.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { date: 'desc' },
    }),
    prisma.sleepRecord.count({ where }),
  ]);

  return Response.json({
    success: true,
    records,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
