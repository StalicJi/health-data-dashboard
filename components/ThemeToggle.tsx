'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // Avoid hydration mismatch: don't render icon until mounted on the client,
  // because the server doesn't know which theme next-themes will resolve to.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Render a size-matched placeholder so layout doesn't shift on hydration
    return <span className="size-8 inline-block" aria-hidden />;
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      aria-label={isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded-md hover:bg-muted"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
