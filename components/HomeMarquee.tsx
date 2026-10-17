'use client';

import { useEffect, useRef } from 'react';
import { COIN, HEART, MUSHROOM, spriteCanvas, type Sprite } from '@/lib/pixel';

const ROW_ONE = ['Software engineering', 'Web experiences', 'Retro games', 'Los Angeles'];
const ROW_TWO = ['React', 'Next.js', 'TypeScript', 'Cloudflare'];

const ITEMS: Sprite[] = [COIN, MUSHROOM, HEART];

function MqItem({ index }: { index: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const sprite = ITEMS[index % ITEMS.length];

  useEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(spriteCanvas(sprite), 0, 0);
  }, [sprite]);

  return (
    <canvas
      ref={ref}
      width={sprite[0].length}
      height={sprite.length}
      className="hv-mq-item"
      aria-hidden="true"
    />
  );
}

function Row({ words }: { words: string[] }) {
  return (
    <>
      {[...words, ...words].map((word, index) => (
        <span key={index}>
          {word}
          <MqItem index={index} />
        </span>
      ))}
    </>
  );
}

export default function HomeMarquee() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      el.dataset.paused = entry?.isIntersecting ? 'false' : 'true';
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="hv-marquee" data-paused="false" aria-hidden="true">
      <div className="hv-mq-row">
        <Row words={ROW_ONE} />
      </div>
      <div className="hv-mq-row">
        <Row words={ROW_TWO} />
      </div>
    </div>
  );
}
