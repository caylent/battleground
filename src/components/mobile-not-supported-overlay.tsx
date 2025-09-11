'use client';

import PixelBlast from './PixelBlast';

export function MobileNotSupportedOverlay() {
  return (
    <div className="absolute top-0 left-0 flex size-full flex-col items-center justify-center gap-4 bg-black font-bold text-2xl md:hidden">
      <div className="relative size-full">
        <PixelBlast
          color="#B19EEF"
          edgeFade={0.25}
          enableRipples
          liquid
          liquidRadius={1.2}
          liquidStrength={0.12}
          liquidWobbleSpeed={5}
          patternDensity={1.2}
          patternScale={3}
          pixelSize={6}
          pixelSizeJitter={0.5}
          rippleIntensityScale={1.5}
          rippleSpeed={0.4}
          rippleThickness={0.12}
          speed={0.6}
          transparent
          variant="circle"
        />
      </div>
      <div className="absolute top-0 left-0 flex size-full flex-col items-center justify-center">
        <span className="text-white">Oops! Looks like you’re on mobile…</span>
        <span className="text-white">this page only speaks desktop.</span>
      </div>
    </div>
  );
}
