'use client';

import { useEffect, useRef } from 'react';
import { drawPixelText, pixelTextWidth } from '@/lib/pixel';

// Text in the 3x5 pixel font, drawn at native size and scaled up crisply by CSS.
export default function PixelText({
  text,
  colour = '#ffffff',
  className,
}: {
  text: string;
  colour?: string;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawPixelText(ctx, text, 0, 0, colour);
  }, [text, colour]);

  return (
    <canvas
      ref={ref}
      width={pixelTextWidth(text)}
      height={5}
      role="img"
      aria-label={text}
      className={`hv-pixel ${className ?? ''}`}
    />
  );
}
