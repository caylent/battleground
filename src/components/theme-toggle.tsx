'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { resolvedTheme: theme, setTheme } = useTheme();

  return (
    <Button
      className="size-8 hover:bg-sidebar-accent hover:text-[var(--sidebar-accent-foreground)] dark:hover:bg-[var(--sidebar-accent)]"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      size="icon"
      variant="ghost"
    >
      {theme === 'light' ? <Sun /> : <Moon />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
