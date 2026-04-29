export interface ChartColors {
  gridStroke: string;
  tickFill: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  legendColor: string;
  notWornFill: string;
  cursorFill: string;
}

export function getChartColors(isDark: boolean): ChartColors {
  if (isDark) {
    return {
      gridStroke: '#1a3554',
      tickFill: '#64748b',
      tooltipBg: '#0c1a2e',
      tooltipBorder: '1px solid #1a3554',
      tooltipText: '#e2e8f0',
      legendColor: '#94a3b8',
      notWornFill: '#1a3554',
      cursorFill: 'rgba(0,0,0,0.35)',
    };
  }
  return {
    gridStroke: '#e2e8f0',
    tickFill: '#64748b',
    tooltipBg: '#ffffff',
    tooltipBorder: '1px solid #e2e8f0',
    tooltipText: '#0f172a',
    legendColor: '#64748b',
    notWornFill: '#cbd5e1',
    cursorFill: 'rgba(0,0,0,0.08)',
  };
}
