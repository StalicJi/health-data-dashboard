import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  title: string;
  value: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const TREND = {
  up: { icon: '↑', color: 'text-emerald-400' },
  down: { icon: '↓', color: 'text-red-400' },
  neutral: { icon: '→', color: 'text-slate-400' },
};

export function SleepStatsCard({ title, value, subtitle, trend }: Props) {
  const t = trend ? TREND[trend] : null;
  return (
    <Card className="bg-card border-border rounded-xl">
      <CardHeader className="pb-1 pt-5 px-5">
        <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-foreground tabular-nums">{value}</span>
          {t && <span className={`text-base font-medium mb-1 ${t.color}`}>{t.icon}</span>}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        <div className="mt-3 h-px bg-gradient-to-r from-primary/40 to-transparent" />
      </CardContent>
    </Card>
  );
}
