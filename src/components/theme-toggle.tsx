"use client";

import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme: theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-transform duration-300 ease-in-out dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute left-1/2 top-1/2 h-[1.2rem] w-[1.2rem] -translate-x-1/2 -translate-y-1/2 rotate-90 scale-0 transition-transform duration-300 ease-in-out dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
