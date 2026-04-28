import unzipper from 'unzipper';
import sax from 'sax';
import type { ParsedSleepRecord } from './types';

const CATEGORY_MAP: Record<string, ParsedSleepRecord['category']> = {
  HKCategoryValueSleepAnalysisInBed: 'InBed',
  HKCategoryValueSleepAnalysisAsleepREM: 'AsleepREM',
  HKCategoryValueSleepAnalysisAsleepCore: 'AsleepCore',
  HKCategoryValueSleepAnalysisAsleepDeep: 'AsleepDeep',
  HKCategoryValueSleepAnalysisAwake: 'Awake',
};

const CATEGORY_LABEL: Record<string, string> = {
  InBed: '在床上',
  AsleepREM: 'REM睡眠',
  AsleepCore: '核心睡眠',
  AsleepDeep: '深層睡眠',
  Awake: '清醒',
};

function parseAppleDate(dateStr: string): Date {
  return new Date(dateStr.replace(' ', 'T').replace(/\s*([+-])(\d{2})(\d{2})$/, '$1$2:$3'));
}

export async function parseAppleHealthZip(buffer: Buffer): Promise<ParsedSleepRecord[]> {
  const directory = await unzipper.Open.buffer(buffer);

  const xmlFile =
    directory.files.find(
      (f) =>
        f.path === 'apple_health_export/export.xml' ||
        f.path === 'export.xml' ||
        f.path.toLowerCase().endsWith('export.xml')
    ) ?? directory.files.find((f) => f.path.endsWith('.xml'));

  if (!xmlFile) throw new Error('找不到 XML 匯出檔案');

  return new Promise((resolve, reject) => {
    const results: ParsedSleepRecord[] = [];
    const parser = sax.createStream(true, { lowercase: false });

    parser.on('opentag', (node) => {
      if (node.name !== 'Record') return;
      const attrs = node.attributes as Record<string, string>;
      if (attrs['type'] !== 'HKCategoryTypeIdentifierSleepAnalysis') return;

      const category = CATEGORY_MAP[attrs['value']];
      if (!category) return;

      const startDate = parseAppleDate(attrs['startDate']);
      const endDate = parseAppleDate(attrs['endDate']);
      const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
      if (durationMinutes <= 0) return;

      results.push({
        startDate: attrs['startDate'],
        endDate: attrs['endDate'],
        category,
        categoryLabel: CATEGORY_LABEL[category],
        sourceName: attrs['sourceName'] ?? '',
        sourceVersion: attrs['sourceVersion'] ?? '',
        durationMinutes,
      });
    });

    parser.on('error', reject);
    parser.on('end', () => resolve(results));

    xmlFile.stream().pipe(parser);
  });
}
