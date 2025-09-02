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
    <div className="relative min-h-screen w-full bg-background">
      {/* Purple Glow Left */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: '#ffffff',
          backgroundImage: `
        radial-gradient(
          circle at top left,
          rgba(173, 109, 244, 0.5),
          transparent 70%
        )
      `,
          filter: 'blur(80px)',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {children}
    </div>
  );
}
