'use client';

import { useEffect, useRef, useState } from 'react';
import { drawPixelText, pixelTextWidth } from '@/lib/pixel';

const LABEL = '1UP';

// Floating "1UP" burst for the contact CTA. Listens on its host anchor for
// activation (click, Enter or Space) and replays a CSS float-up animation
// without ever blocking the link itself.
export default function OneUp() {
  const hostRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    const host = hostRef.current?.parentElement;
    if (!host) return;
    const onActivate = () => setBurst((n) => n + 1);
    host.addEventListener('click', onActivate);
    return () => host.removeEventListener('click', onActivate);
  }, []);

  useEffect(() => {
    if (!burst) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      drawPixelText(ctx, LABEL, 0, 0, '#5ad1cd');
    }
    const timer = window.setTimeout(() => setBurst(0), 1400);
    return () => window.clearTimeout(timer);
  }, [burst]);

  return (
    <span ref={hostRef} className="hv-oneup-host" aria-hidden="true">
      {burst > 0 ? (
        <span key={burst} className="hv-oneup">
          <canvas ref={canvasRef} width={pixelTextWidth(LABEL)} height={5} />
        </span>
      ) : null}
    </span>
  );
}
