'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      className="size-8 justify-start pl-2 text-foreground hover:bg-sidebar-accent hover:text-[var(--sidebar-accent-foreground)] dark:hover:bg-[var(--sidebar-accent)]!"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      size="icon"
      variant="ghost"
    >
      <Sun className="dark:hidden" />
      <Moon className="hidden dark:inline" />
      <span className="md:hidden">Toggle theme</span>
    </Button>
  );
}
