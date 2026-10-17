'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { BUG, PALETTE } from '@/lib/pixel';
import { BUG_SQUASHED, PLUS_TEN, EXTRA_PALETTE } from '@/lib/pixel-extra';
import styles from './BugSquash.module.css';

type BugEntity = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  state: 'crawling' | 'squashed';
  squashTimer: number;
  frame: number;
};

export function BugScoreBadge({ score }: { score: number }) {
  return (
    <span className={styles.scoreBadge} aria-label={`Bugs squashed score: ${score}`}>
      <span className={styles.scoreDot} aria-hidden="true" />
      <span>SCORE {String(score).padStart(2, '0')}</span>
    </span>
  );
}

export default function BugSquash({
  onScoreChange,
}: {
  onScoreChange?: (score: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLSpanElement>(null);
  const [bugs, setBugs] = useState<BugEntity[]>([]);
  const [score, setScore] = useState(0);

  const bugsRef = useRef<BugEntity[]>([]);
  bugsRef.current = bugs;

  const scoreRef = useRef(0);
  scoreRef.current = score;

  const announce = useCallback((text: string) => {
    if (liveRef.current) liveRef.current.textContent = text;
  }, []);

  const squash = (id: number) => {
    setBugs((prev) =>
      prev.map((b) => {
        if (b.id === id && b.state === 'crawling') {
          const newScore = scoreRef.current + 10;
          setScore(newScore);
          onScoreChange?.(newScore);
          announce(`Bug squashed! +10 points. Total score ${newScore}.`);
          return { ...b, state: 'squashed', squashTimer: 0.7 };
        }
        return b;
      })
    );
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Initial 4 bugs
    const w = container.clientWidth || 600;
    const h = container.clientHeight || 400;

    let nextId = 1;
    const initialBugs: BugEntity[] = Array.from({ length: 4 }, (_, i) => ({
      id: nextId++,
      x: 30 + Math.random() * Math.max(50, w - 80),
      y: 30 + (i * (h - 60)) / 4 + Math.random() * 20,
      vx: (Math.random() > 0.5 ? 1 : -1) * (18 + Math.random() * 16),
      vy: (Math.random() > 0.5 ? 1 : -1) * (12 + Math.random() * 14),
      state: 'crawling',
      squashTimer: 0,
      frame: Math.random() > 0.5 ? 1 : 0,
    }));
    setBugs(initialBugs);

    let raf = 0;
    let last = performance.now();
    let visible = true;
    let respawnTimeout = 0;

    const scheduleRespawn = () => {
      if (respawnTimeout) return;
      respawnTimeout = window.setTimeout(() => {
        respawnTimeout = 0;
        setBugs((curr) => {
          if (curr.length >= 5) return curr;
          const cw = container.clientWidth || 600;
          const ch = container.clientHeight || 400;
          const fromLeft = Math.random() > 0.5;
          const newBug: BugEntity = {
            id: nextId++,
            x: fromLeft ? 4 : cw - 26,
            y: 20 + Math.random() * Math.max(20, ch - 50),
            vx: (fromLeft ? 1 : -1) * (18 + Math.random() * 16),
            vy: (Math.random() - 0.5) * 24,
            state: 'crawling',
            squashTimer: 0,
            frame: 0,
          };
          return [...curr, newBug];
        });
      }, 2500 + Math.random() * 2000);
    };

    let animTime = 0;

    const tick = (now: number) => {
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
      last = now;
      animTime += dt;

      if (!reduced) {
        const cw = container.clientWidth || 600;
        const ch = container.clientHeight || 400;

        let needsStateUpdate = false;
        const currentBugs = bugsRef.current;

        const updated = currentBugs
          .map((bug) => {
            if (bug.state === 'squashed') {
              const remaining = bug.squashTimer - dt;
              needsStateUpdate = true;
              if (remaining <= 0) {
                scheduleRespawn();
                return null;
              }
              return { ...bug, squashTimer: remaining };
            }

            // Crawling movement
            let nx = bug.x + bug.vx * dt;
            let ny = bug.y + bug.vy * dt;
            let nvx = bug.vx;
            let nvy = bug.vy;

            if (nx <= 6) {
              nx = 6;
              nvx = Math.abs(nvx);
            } else if (nx >= cw - 26) {
              nx = cw - 26;
              nvx = -Math.abs(nvx);
            }

            if (ny <= 6) {
              ny = 6;
              nvy = Math.abs(nvy);
            } else if (ny >= ch - 22) {
              ny = ch - 22;
              nvy = -Math.abs(nvy);
            }

            needsStateUpdate = true;
            return {
              ...bug,
              x: nx,
              y: ny,
              vx: nvx,
              vy: nvy,
              frame: Math.floor(animTime * 6) % 2,
            };
          })
          .filter(Boolean) as BugEntity[];

        if (needsStateUpdate) {
          setBugs(updated);
        }
      }

      raf = visible && !document.hidden ? requestAnimationFrame(tick) : 0;
    };

    const start = () => {
      if (raf || !visible || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible) start();
    });

    const onVisibility = () => {
      if (!document.hidden) start();
    };

    observer.observe(container);
    document.addEventListener('visibilitychange', onVisibility);
    start();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (respawnTimeout) clearTimeout(respawnTimeout);
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      {bugs.map((bug) => (
        <BugButton key={bug.id} bug={bug} onSquash={() => squash(bug.id)} />
      ))}
      <span ref={liveRef} className="sr-only" aria-live="polite" />
    </div>
  );
}

function BugButton({
  bug,
  onSquash,
}: {
  bug: BugEntity;
  onSquash: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const plusRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const sprite = bug.state === 'squashed' ? BUG_SQUASHED : BUG[bug.frame];
    const palette = bug.state === 'squashed' ? EXTRA_PALETTE : PALETTE;

    sprite.forEach((row, y) => {
      Array.from(row).forEach((key, x) => {
        const c = palette[key];
        if (c) {
          ctx.fillStyle = c;
          ctx.fillRect(x, y, 1, 1);
        }
      });
    });
  }, [bug.state, bug.frame]);

  useEffect(() => {
    if (bug.state !== 'squashed') return;
    const canvas = plusRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    PLUS_TEN.forEach((row, y) => {
      Array.from(row).forEach((key, x) => {
        const c = EXTRA_PALETTE[key];
        if (c) {
          ctx.fillStyle = c;
          ctx.fillRect(x, y, 1, 1);
        }
      });
    });
  }, [bug.state]);

  return (
    <button
      type="button"
      onClick={onSquash}
      aria-label="Squash pixel bug"
      className={styles.bugBtn}
      style={{
        transform: `translate3d(${Math.round(bug.x)}px, ${Math.round(bug.y)}px, 0)`,
      }}
    >
      <canvas
        ref={canvasRef}
        width={10}
        height={8}
        className={styles.bugCanvas}
        aria-hidden="true"
      />
      {bug.state === 'squashed' && (
        <span className={styles.plusTen} aria-hidden="true">
          <canvas ref={plusRef} width={13} height={5} className={styles.plusTenCanvas} />
        </span>
      )}
    </button>
  );
}
