export function ChatBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full bg-background">
      {/* Violet Storm Background with Top Glow */}
      <div
        className="absolute inset-0 z-0 hidden dark:block"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139, 92, 246, 0.25), transparent 70%), #000000',
        }}
      />

      <div
        className="absolute inset-0 z-0 block dark:hidden"
        style={{
          background:
            'radial-gradient(125% 125% at 50% 90%, #fff 40%, #c4aeeb 100%)',
        }}
      />

      {children}
    </div>
  );
}
