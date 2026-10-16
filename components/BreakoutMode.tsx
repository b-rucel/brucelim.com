'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { drawPixelText, pixelTextWidth } from '@/lib/pixel';
import styles from './BreakoutMode.module.css';

type Article = {
  title: string;
  date: string;
  href: string;
};

type Brick = {
  index: number;
  title: string;
  href: string;
  x: number;
  y: number;
  w: number;
  h: number;
  hit: boolean;
  color: string;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
};

const BRICK_PALETTE = [
  '#9b59b6', // purple
  '#5ad1cd', // cyan
  '#f5c542', // yellow
  '#84cdfa', // blue
  '#ed6f5c', // red
  '#3d5fd1', // deep blue
  '#5ad1cd', // cyan
  '#9b59b6', // purple
];

export default function BreakoutMode({
  articles,
  onClose,
  listElement,
}: {
  articles: Article[];
  onClose: () => void;
  listElement: HTMLElement | null;
}) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const liveRef = useRef<HTMLSpanElement>(null);
  const [hitArticles, setHitArticles] = useState<number[]>([]);
  const [selectedHitIdx, setSelectedHitIdx] = useState<number | null>(null);

  const announce = useCallback((msg: string) => {
    if (liveRef.current) liveRef.current.textContent = msg;
  }, []);

  useEffect(() => {
    announce('Breakout game started. Use left and right arrow keys or pointer to move paddle. Press Escape to exit.');
    return () => {
      announce('Breakout game ended. Article list restored.');
    };
  }, [announce]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = canvas.clientWidth || 600;
    let height = canvas.clientHeight || 500;
    let raf = 0;
    let last = 0;
    let visible = true;

    // Paddle state
    const paddleW = Math.max(70, Math.min(120, width * 0.22));
    const paddleH = 8;
    let paddleX = (width - paddleW) / 2;
    let leftHeld = false;
    let rightHeld = false;
    const paddleSpeed = 340;

    // Ball state
    const ballR = 4;
    let ballX = width / 2;
    let ballY = height - 40;
    let ballVx = 160;
    let ballVy = -200;
    let ballAttached = false;

    // Particles
    let particles: Particle[] = [];

    // Bricks measured from list rows
    let bricks: Brick[] = [];
    const measureBricks = () => {
      const rect = canvas.getBoundingClientRect();
      const rows = listElement ? listElement.querySelectorAll('.hv-post-row') : [];
      if (rows.length > 0) {
        bricks = Array.from(rows).map((row, i) => {
          const r = row.getBoundingClientRect();
          return {
            index: i,
            title: articles[i]?.title || `Article ${i + 1}`,
            href: articles[i]?.href || '#',
            x: Math.max(8, r.left - rect.left),
            y: Math.max(28, r.top - rect.top),
            w: Math.max(100, r.width),
            h: Math.max(24, r.height),
            hit: false,
            color: BRICK_PALETTE[i % BRICK_PALETTE.length],
          };
        });
      } else {
        const topMargin = 34;
        const totalH = height - topMargin - 60;
        const rowH = Math.floor(totalH / articles.length);
        bricks = articles.map((art, i) => ({
          index: i,
          title: art.title,
          href: art.href,
          x: 12,
          y: topMargin + i * rowH,
          w: width - 24,
          h: Math.max(22, rowH - 6),
          hit: false,
          color: BRICK_PALETTE[i % BRICK_PALETTE.length],
        }));
      }
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
      measureBricks();
      paddleX = Math.max(0, Math.min(width - paddleW, paddleX));
    };

    const spawnParticles = (x: number, y: number, color: string) => {
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.5;
        const spd = 40 + Math.random() * 80;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          life: 0.35,
          color,
        });
      }
    };

    const step = (dt: number) => {
      // Paddle keyboard movement
      if (leftHeld) paddleX -= paddleSpeed * dt;
      if (rightHeld) paddleX += paddleSpeed * dt;
      paddleX = Math.max(4, Math.min(width - paddleW - 4, paddleX));

      // Particles
      particles.forEach((p) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
      });
      particles = particles.filter((p) => p.life > 0);

      if (ballAttached) {
        ballX = paddleX + paddleW / 2;
        ballY = height - 24 - ballR;
        return;
      }

      // Ball movement
      ballX += ballVx * dt;
      ballY += ballVy * dt;

      // Walls
      if (ballX - ballR <= 2) {
        ballX = 2 + ballR;
        ballVx = Math.abs(ballVx);
      } else if (ballX + ballR >= width - 2) {
        ballX = width - 2 - ballR;
        ballVx = -Math.abs(ballVx);
      }

      if (ballY - ballR <= 24) {
        ballY = 24 + ballR;
        ballVy = Math.abs(ballVy);
      }

      // Paddle collision
      const paddleY = height - 22;
      if (
        ballY + ballR >= paddleY &&
        ballY - ballR <= paddleY + paddleH &&
        ballX >= paddleX - 4 &&
        ballX <= paddleX + paddleW + 4 &&
        ballVy > 0
      ) {
        ballVy = -Math.abs(ballVy);
        const hitOffset = (ballX - (paddleX + paddleW / 2)) / (paddleW / 2);
        ballVx = hitOffset * 220;
        spawnParticles(ballX, paddleY, '#5ad1cd');
      }

      // Bottom pit: respawn ball on paddle
      if (ballY > height + 20) {
        ballAttached = true;
        ballVx = 160 * (Math.random() > 0.5 ? 1 : -1);
        ballVy = -200;
        setTimeout(() => {
          ballAttached = false;
        }, 800);
      }

      // Brick collisions
      for (const brick of bricks) {
        if (brick.hit) continue;
        const testX = Math.max(brick.x, Math.min(ballX, brick.x + brick.w));
        const testY = Math.max(brick.y, Math.min(ballY, brick.y + brick.h));
        const distX = ballX - testX;
        const distY = ballY - testY;
        if (distX * distX + distY * distY <= ballR * ballR) {
          brick.hit = true;
          spawnParticles(testX, testY, brick.color);

          // Bounce
          if (Math.abs(distX) > Math.abs(distY)) {
            ballVx = distX > 0 ? Math.abs(ballVx) : -Math.abs(ballVx);
          } else {
            ballVy = distY > 0 ? Math.abs(ballVy) : -Math.abs(ballVy);
          }

          setHitArticles((prev) => (prev.includes(brick.index) ? prev : [...prev, brick.index]));
          setSelectedHitIdx(brick.index);
          announce(`${brick.title} hit! Press Enter or click to open.`);
          break;
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Bricks
      for (const brick of bricks) {
        if (!brick.hit) {
          // Unhit solid brick
          ctx.fillStyle = 'rgba(20, 20, 28, 0.7)';
          ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
          ctx.strokeStyle = brick.color;
          ctx.lineWidth = 1;
          ctx.strokeRect(brick.x + 0.5, brick.y + 0.5, brick.w - 1, brick.h - 1);

          // Top highlight
          ctx.fillStyle = brick.color;
          ctx.fillRect(brick.x + 2, brick.y + 2, brick.w - 4, 2);

          // Title text in retro pixel font
          const maxTextW = brick.w - 20;
          let disp = brick.title.toUpperCase();
          while (disp.length > 0 && pixelTextWidth(disp) > maxTextW) {
            disp = disp.slice(0, -1);
          }
          if (disp.length < brick.title.length) disp += '...';
          drawPixelText(ctx, disp, brick.x + 8, brick.y + Math.max(4, Math.floor((brick.h - 5) / 2)), '#ffffff');
        } else {
          // Hit brick: cracked / open link status
          ctx.fillStyle = 'rgba(90, 209, 205, 0.08)';
          ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
          ctx.strokeStyle = 'rgba(90, 209, 205, 0.45)';
          ctx.strokeRect(brick.x + 0.5, brick.y + 0.5, brick.w - 1, brick.h - 1);

          // Prompt
          const text = `${brick.title.toUpperCase()} [ENTER/CLICK TO READ]`;
          let disp = text;
          while (disp.length > 0 && pixelTextWidth(disp) > brick.w - 16) {
            disp = disp.slice(0, -1);
          }
          drawPixelText(ctx, disp, brick.x + 8, brick.y + Math.max(4, Math.floor((brick.h - 5) / 2)), '#5ad1cd');
        }
      }

      // Particles
      for (const p of particles) {
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2);
      }

      // Paddle
      const paddleY = height - 22;
      ctx.fillStyle = '#5ad1cd';
      ctx.fillRect(Math.round(paddleX), paddleY, paddleW, paddleH);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.round(paddleX + 2), paddleY + 1, paddleW - 4, 1);

      // Ball
      ctx.fillStyle = '#f5c542';
      ctx.fillRect(Math.round(ballX - ballR), Math.round(ballY - ballR), ballR * 2, ballR * 2);

      // HUD overlay: hit count
      const hitCount = bricks.filter((b) => b.hit).length;
      const hud = `HITS: ${hitCount}/${bricks.length}`;
      drawPixelText(ctx, hud, 12, 10, '#84cdfa');
    };

    const frame = (now: number) => {
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
      last = now;
      if (!reduced) step(dt);
      draw();
      raf = visible && !document.hidden ? requestAnimationFrame(frame) : 0;
    };

    function start() {
      if (raf || !visible || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        leftHeld = true;
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        rightHeld = true;
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter') {
        if (selectedHitIdx !== null && articles[selectedHitIdx]) {
          e.preventDefault();
          router.push(articles[selectedHitIdx].href);
        } else {
          // If no row specifically selected, open the latest hit row
          const hitIdxs = bricks.filter((b) => b.hit).map((b) => b.index);
          if (hitIdxs.length > 0) {
            const targetIdx = hitIdxs[hitIdxs.length - 1];
            router.push(articles[targetIdx].href);
          }
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') leftHeld = false;
      if (e.key === 'ArrowRight') rightHeld = false;
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      paddleX = Math.max(0, Math.min(width - paddleW, clientX - paddleW / 2));
    };

    const onPointerDown = (e: PointerEvent) => {
      canvas.focus({ preventScroll: true });
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      // Check if clicking a hit brick
      for (const brick of bricks) {
        if (brick.hit && px >= brick.x && px <= brick.x + brick.w && py >= brick.y && py <= brick.y + brick.h) {
          router.push(brick.href);
          return;
        }
      }

      if (ballAttached) ballAttached = false;
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible) start();
    });

    const resizeObserver = new ResizeObserver(resize);

    canvas.addEventListener('keydown', onKeyDown);
    canvas.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerdown', onPointerDown);
    observer.observe(canvas);
    resizeObserver.observe(canvas);

    resize();
    start();
    canvas.focus({ preventScroll: true });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      canvas.removeEventListener('keydown', onKeyDown);
      canvas.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, [articles, onClose, listElement, router, announce, selectedHitIdx]);

  return (
    <div className={styles.overlay}>
      <div className={styles.topBar}>
        <span className={styles.hudText}>BREAKOUT MODE &bull; [ESC] TO EXIT</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Exit Breakout game"
          className={styles.closeBtn}
        >
          <span>ESC</span>
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <canvas
        ref={canvasRef}
        tabIndex={0}
        aria-label="Breakout mini-game with article bricks. Move paddle with left and right arrow keys or pointer. Click or press Enter on a hit row to open the article. Press Escape to exit."
        className={styles.canvas}
      />

      {/* Screen-reader accessible list of hit articles */}
      <div className="sr-only">
        {hitArticles.map((idx) => (
          <a key={articles[idx].href} href={articles[idx].href}>
            Open {articles[idx].title}
          </a>
        ))}
      </div>

      <span ref={liveRef} className="sr-only" aria-live="polite" />
    </div>
  );
}
