export interface ParsedSleepRecord {
  startDate: string;
  endDate: string;
  category: 'InBed' | 'AsleepREM' | 'AsleepCore' | 'AsleepDeep' | 'Awake';
  categoryLabel: string;
  sourceName: string;
  sourceVersion: string;
  durationMinutes: number;
}

export interface SleepDailyStats {
  date: string;
  inBedMinutes: number;
  remSleepMinutes: number;
  coreSleepMinutes: number;
  deepSleepMinutes: number;
  awakeMinutes: number;
  totalSleepMinutes: number;
  sleepQualityScore: number;
}

export interface SleepWeeklyStats {
  weekStart: string;
  weekEnd: string;
  avgTotalSleepMinutes: number;
  avgDeepSleepPercentage: number;
  avgRemSleepPercentage: number;
  avgQualityScore: number;
}

export interface SleepMonthlyStats {
  month: number;
  year: number;
  avgTotalSleepMinutes: number;
  avgDeepSleepPercentage: number;
  avgCoreSleepPercentage: number;
  avgRemSleepPercentage: number;
  avgQualityScore: number;
}

export interface SleepYearlyStats {
  year: number;
  totalRecords: number;
  avgNightlyMinutes: number;
  avgQualityScore: number;
  categoryBreakdown: {
    inBed: number;
    rem: number;
    core: number;
    deep: number;
    awake: number;
  };
}

export interface UploadResponse {
  success: boolean;
  sessionId?: number;
  message: string;
  totalRecords?: number;
  error?: string;
}
