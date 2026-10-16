'use client';

import { useEffect, useRef } from 'react';
import { SPEECH_BUBBLE, EXTRA_PALETTE } from '@/lib/pixel-extra';
import styles from './SpeechBubble.module.css';

export default function SpeechBubble() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    SPEECH_BUBBLE.forEach((row, y) => {
      Array.from(row).forEach((key, x) => {
        const colour = EXTRA_PALETTE[key];
        if (colour) {
          ctx.fillStyle = colour;
          ctx.fillRect(x, y, 1, 1);
        }
      });
    });
  }, []);

  return (
    <span className={styles.bubbleHost} aria-hidden="true">
      <span className={styles.bubbleAnim}>
        <canvas
          ref={canvasRef}
          width={SPEECH_BUBBLE[0].length}
          height={SPEECH_BUBBLE.length}
          className={styles.canvas}
        />
      </span>
    </span>
  );
}
