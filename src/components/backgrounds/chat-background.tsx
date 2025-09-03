'use client';

import { useTheme } from 'next-themes';

export default function ChatBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();

  if (resolvedTheme === 'dark') {
    return (
      <div className="relative min-h-screen w-full bg-background">
        {/* Violet Storm Background with Top Glow */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139, 92, 246, 0.25), transparent 70%), #000000',
          }}
        />

        {children}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full">
      {/* Radial Gradient Background from Bottom */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(125% 125% at 50% 90%, #fff 40%, #c4aeeb 100%)',
        }}
      />
      {children}
    </div>
  );
}
