'use client';

import { useEffect, useRef } from 'react';
import { COIN, PALETTE } from '@/lib/pixel';

// A pixel coin that pops out of its parent row on hover (animation in globals.css).
export default function PixelCoin() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    COIN.forEach((row, y) =>
      Array.from(row).forEach((key, x) => {
        if (!PALETTE[key]) return;
        ctx.fillStyle = PALETTE[key];
        ctx.fillRect(x, y, 1, 1);
      })
    );
  }, []);

  return (
    <span className="hv-coin" aria-hidden="true">
      <canvas ref={ref} width={COIN[0].length} height={COIN.length} />
    </span>
  );
}
