'use client';

import { useEffect, useRef, useState } from 'react';
import { drawPixelText, pixelTextWidth } from '@/lib/pixel';

const SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
];

const isEditable = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

function ToastLabel({ text }: { text: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawPixelText(ctx, text, 0, 0, '#8dffb4');
  }, [text]);

  return (
    <canvas
      ref={ref}
      width={pixelTextWidth(text)}
      height={5}
      aria-hidden="true"
      style={{ display: 'block', width: pixelTextWidth(text) * 3, height: 15, imageRendering: 'pixelated' }}
    />
  );
}

// Watches for the Konami sequence on the homepage and toggles a CRT mode:
// a scanline/tint overlay class on .home-v2 plus a 'bl-konami' window event
// that switches the hero runner's jetpack on. Arrow keys are only observed,
// never preventDefault-ed, and the listener ignores editable targets.
export default function KonamiMode() {
  const [on, setOn] = useState(false);
  const [toastAt, setToastAt] = useState(0);
  const onRef = useRef(false);

  useEffect(() => {
    const buffer: string[] = [];
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
      if (isEditable(event.target)) return;
      buffer.push(event.code);
      if (buffer.length > SEQUENCE.length) buffer.shift();
      if (buffer.length === SEQUENCE.length && buffer.every((code, i) => code === SEQUENCE[i])) {
        buffer.length = 0;
        const next = !onRef.current;
        onRef.current = next;
        setOn(next);
        setToastAt(Date.now());
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.querySelector('.home-v2')?.classList.toggle('hv-crt', on);
    window.dispatchEvent(new CustomEvent('bl-konami', { detail: { enabled: on } }));
  }, [on]);

  useEffect(() => {
    if (!toastAt) return;
    const timer = window.setTimeout(() => setToastAt(0), 6000);
    return () => window.clearTimeout(timer);
  }, [toastAt]);

  useEffect(
    () => () => {
      document.querySelector('.home-v2')?.classList.remove('hv-crt');
    },
    []
  );

  if (!toastAt) return null;

  const message = on ? 'CRT MODE ON' : 'CRT MODE OFF';

  return (
    <div className="hv-crt-toast" role="status">
      <ToastLabel text={message} />
      <span className="sr-only">{message}</span>
      <button
        type="button"
        className="hv-crt-toast-close"
        onClick={() => setToastAt(0)}
        aria-label="Dismiss CRT mode message"
      >
        ×
      </button>
    </div>
  );
}
