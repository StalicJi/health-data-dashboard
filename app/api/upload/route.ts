import { type NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { parseAppleHealthZip } from '@/lib/xmlParser';
import { calculateDailyStats, aggregateWeekly, aggregateMonthly } from '@/lib/sleepAnalyzer';

const USER_ID = 1;

export async function POST(request: NextRequest) {
  let sessionId: number | undefined;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return Response.json({ success: false, error: '請提供 ZIP 檔案' }, { status: 400 });
    }

    const session = await prisma.uploadSession.create({
      data: { userId: USER_ID, fileName: file.name, status: 'processing' },
    });
    sessionId = session.id;

    const buffer = Buffer.from(await file.arrayBuffer());
    const records = await parseAppleHealthZip(buffer);

    await prisma.sleepRecord.createMany({
      data: records.map((r) => ({
        userId: USER_ID,
        uploadSessionId: session.id,
        startDate: new Date(r.startDate.replace(' ', 'T').replace(/\s*([+-])(\d{2})(\d{2})$/, '$1$2:$3')),
        endDate: new Date(r.endDate.replace(' ', 'T').replace(/\s*([+-])(\d{2})(\d{2})$/, '$1$2:$3')),
        date: new Date(
          new Date(r.endDate.replace(' ', 'T').replace(/\s*([+-])(\d{2})(\d{2})$/, '$1$2:$3'))
            .toISOString()
            .slice(0, 10)
        ),
        category: r.category,
        categoryLabel: r.categoryLabel,
        sourceName: r.sourceName,
        sourceVersion: r.sourceVersion,
        durationMinutes: r.durationMinutes,
      })),
      skipDuplicates: true,
    });

    const dailyStats = calculateDailyStats(records);
    const weeklyStats = aggregateWeekly(dailyStats);
    const monthlyStats = aggregateMonthly(dailyStats);

    for (const s of dailyStats) {
      await prisma.sleepDaily.upsert({
        where: { date: new Date(s.date) },
        create: {
          userId: USER_ID,
          date: new Date(s.date),
          inBedMinutes: s.inBedMinutes,
          remSleepMinutes: s.remSleepMinutes,
          coreSleepMinutes: s.coreSleepMinutes,
          deepSleepMinutes: s.deepSleepMinutes,
          awakeMinutes: s.awakeMinutes,
          totalSleepMinutes: s.totalSleepMinutes,
          sleepQualityScore: s.sleepQualityScore,
        },
        update: {
          inBedMinutes: s.inBedMinutes,
          remSleepMinutes: s.remSleepMinutes,
          coreSleepMinutes: s.coreSleepMinutes,
          deepSleepMinutes: s.deepSleepMinutes,
          awakeMinutes: s.awakeMinutes,
          totalSleepMinutes: s.totalSleepMinutes,
          sleepQualityScore: s.sleepQualityScore,
        },
      });
    }

    for (const w of weeklyStats) {
      await prisma.sleepWeekly.upsert({
        where: { userId_weekStartDate: { userId: USER_ID, weekStartDate: new Date(w.weekStart) } },
        create: {
          userId: USER_ID,
          weekStartDate: new Date(w.weekStart),
          weekEndDate: new Date(w.weekEnd),
          avgTotalSleepMinutes: w.avgTotalSleepMinutes,
          avgDeepSleepMinutes: Math.round(w.avgDeepSleepPercentage),
          avgRemSleepMinutes: Math.round(w.avgRemSleepPercentage),
          avgSleepQualityScore: w.avgQualityScore,
        },
        update: {
          avgTotalSleepMinutes: w.avgTotalSleepMinutes,
          avgDeepSleepMinutes: Math.round(w.avgDeepSleepPercentage),
          avgRemSleepMinutes: Math.round(w.avgRemSleepPercentage),
          avgSleepQualityScore: w.avgQualityScore,
        },
      });
    }

    for (const m of monthlyStats) {
      await prisma.sleepMonthly.upsert({
        where: { userId_year_month: { userId: USER_ID, year: m.year, month: m.month } },
        create: {
          userId: USER_ID,
          year: m.year,
          month: m.month,
          avgTotalSleepMinutes: m.avgTotalSleepMinutes,
          avgDeepSleepPercentage: m.avgDeepSleepPercentage,
          avgCoreSleepPercentage: m.avgCoreSleepPercentage,
          avgRemSleepPercentage: m.avgRemSleepPercentage,
          avgQualityScore: m.avgQualityScore,
        },
        update: {
          avgTotalSleepMinutes: m.avgTotalSleepMinutes,
          avgDeepSleepPercentage: m.avgDeepSleepPercentage,
          avgCoreSleepPercentage: m.avgCoreSleepPercentage,
          avgRemSleepPercentage: m.avgRemSleepPercentage,
          avgQualityScore: m.avgQualityScore,
        },
      });
    }

    await prisma.uploadSession.update({
      where: { id: session.id },
      data: { status: 'completed', totalRecords: records.length },
    });

    return Response.json({
      success: true,
      sessionId: session.id,
      message: '資料上傳成功',
      totalRecords: records.length,
    });
  } catch (error) {
    if (sessionId) {
      await prisma.uploadSession
        .update({ where: { id: sessionId }, data: { status: 'failed' } })
        .catch(() => {});
    }
    const message = error instanceof Error ? error.message : '上傳失敗';
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
