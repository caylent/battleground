'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';

export default function CaylentLogo({ className }: { className?: string }) {
  const { resolvedTheme: theme } = useTheme();

  return (
    <Image
      alt="Caylent Logo"
      className={className}
      height={30}
      src={
        theme === 'dark' ? '/caylent-logo-dark.png' : '/caylent-logo-light.png'
      }
      width={100}
    />
  );
}
