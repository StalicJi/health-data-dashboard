import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  title: string;
  value: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const TREND = {
  up: { icon: '↑', color: 'text-green-400' },
  down: { icon: '↓', color: 'text-red-400' },
  neutral: { icon: '→', color: 'text-gray-400' },
};

export function SleepStatsCard({ title, value, subtitle, trend }: Props) {
  const t = trend ? TREND[trend] : null;
  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-white">{value}</span>
          {t && <span className={`text-lg font-medium mb-0.5 ${t.color}`}>{t.icon}</span>}
        </div>
        {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
