export function ChatBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full bg-background">
      {/* Dynamic Radial Gradient Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(
              ellipse 80% 60% at 50% 0%, 
              hsl(from var(--primary) h s l / 0.30), 
              transparent 70%
            )
          `,
        }}
      />

      {children}
    </div>
  );
}
