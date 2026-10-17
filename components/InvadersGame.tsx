'use client';

import { useEffect, useRef, useState } from 'react';
import RunnerGame from './RunnerGame';
import { drawPixelText, pixelTextWidth } from '@/lib/pixel';

const WORLD_H = 48;
const STAR_COLOURS = ['#9b59b6', '#84cdfa', '#5ad1cd', '#ffffff'];

// Formation layout: "4 0 4" in 11 columns x 5 rows
// 1 = invader present, 0 = space
const FORMATION_GRID = [
  [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1], // Row 0
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1], // Row 1
  [1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1], // Row 2
  [0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1], // Row 3
  [0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1], // Row 4
];

type Invader = {
  col: number;
  row: number;
  color: string;
  alive: boolean;
};

type Bullet = {
  x: number;
  y: number;
  vy: number;
};

type Mode = 'playing' | 'win' | 'over';

export default function InvadersGame({
  scale = 3,
  className,
  forceGame,
}: {
  scale?: number;
  className?: string;
  forceGame?: 'invaders' | 'runner';
}) {
  const [chosenGame, setChosenGame] = useState<'invaders' | 'runner'>(
    forceGame ?? 'invaders'
  );

  useEffect(() => {
    if (!forceGame) {
      setChosenGame(Math.random() < 0.5 ? 'invaders' : 'runner');
    }
  }, [forceGame]);

  if (chosenGame === 'runner') {
    return <RunnerGame scale={scale} className={className} />;
  }

  return <InvadersCanvas scale={scale} className={className} />;
}

function InvadersCanvas({
  scale = 3,
  className,
}: {
  scale?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const liveRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 200;
    let mode: Mode = 'playing';
    let raf = 0;
    let last = 0;
    let visible = true;
    let stars: { x: number; y: number; c: string }[] = [];

    // Formation layout params
    const invW = 4;
    const invH = 3;
    const colPitch = 6;
    const rowPitch = 4;
    const formW = 11 * colPitch; // 66 units

    let formationX = 20;
    let formationY = 4;
    let formDir = 1;
    let formSpeed = 16;
    let formStepTimer = 0;
    let formFrame = 0;

    // Ship params
    const shipW = 7;
    let shipX = 40;
    const shipY = WORLD_H - 7;
    let leftHeld = false;
    let rightHeld = false;
    const shipSpeed = 110;

    // Bullets
    let bullets: Bullet[] = [];
    let lastFire = 0;

    // Create invaders
    let invaders: Invader[] = [];
    const initInvaders = () => {
      invaders = [];
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 11; c++) {
          if (FORMATION_GRID[r][c] === 1) {
            // Colors: left '4' = #84cdfa, middle '0' = #5ad1cd, right '4' = #84cdfa
            const color = c < 3 ? '#84cdfa' : c > 7 ? '#84cdfa' : '#5ad1cd';
            invaders.push({ col: c, row: r, color, alive: true });
          }
        }
      }
    };
    initInvaders();

    const announce = (text: string) => {
      if (liveRef.current) liveRef.current.textContent = text;
    };
    announce('Space Invaders 404 started. Defend against the 404 digits.');

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const cssW = canvas.clientWidth;
      width = Math.max(80, cssW / scale);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(WORLD_H * scale * dpr);
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
      ctx.imageSmoothingEnabled = false;
      stars = Array.from({ length: Math.round(width / 18) }, (_, i) => ({
        x: (i * 37) % Math.floor(width),
        y: 3 + ((i * 13) % (WORLD_H - 8)),
        c: STAR_COLOURS[i % STAR_COLOURS.length],
      }));
      formationX = Math.max(4, Math.floor((width - formW) / 2));
      shipX = Math.floor((width - shipW) / 2);
    };

    const resetGame = () => {
      mode = 'playing';
      initInvaders();
      formationX = Math.max(4, Math.floor((width - formW) / 2));
      formationY = 4;
      formDir = 1;
      formSpeed = 16;
      formStepTimer = 0;
      bullets = [];
      shipX = Math.floor((width - shipW) / 2);
      announce('Game restarted.');
    };

    const fireBullet = () => {
      if (mode !== 'playing') {
        resetGame();
        return;
      }
      const now = performance.now();
      if (now - lastFire < 220) return;
      lastFire = now;
      bullets.push({
        x: shipX + Math.floor(shipW / 2),
        y: shipY - 1,
        vy: -150,
      });
    };

    const step = (dt: number) => {
      // Ship keyboard move
      if (leftHeld) shipX -= shipSpeed * dt;
      if (rightHeld) shipX += shipSpeed * dt;
      shipX = Math.max(2, Math.min(width - shipW - 2, shipX));

      // Bullets move
      bullets.forEach((b) => {
        b.y += b.vy * dt;
      });
      bullets = bullets.filter((b) => b.y > 0);

      const aliveInvaders = invaders.filter((inv) => inv.alive);
      if (aliveInvaders.length === 0) {
        if (mode !== 'win') {
          mode = 'win';
          announce('YOU WIN - PRESS START to return home.');
        }
        return;
      }

      // Speed increases as invaders are cleared
      const remainingRatio = aliveInvaders.length / invaders.length;
      formSpeed = 14 + (1 - remainingRatio) * 38;

      // Formation move
      formStepTimer += dt * formSpeed;
      if (formStepTimer >= 1) {
        formStepTimer = 0;
        formFrame = 1 - formFrame;

        // Compute alive bounds
        let minCol = 11;
        let maxCol = 0;
        let maxRow = 0;
        aliveInvaders.forEach((inv) => {
          if (inv.col < minCol) minCol = inv.col;
          if (inv.col > maxCol) maxCol = inv.col;
          if (inv.row > maxRow) maxRow = inv.row;
        });

        const leftEdge = formationX + minCol * colPitch;
        const rightEdge = formationX + maxCol * colPitch + invW;

        if (rightEdge + formDir * 3 >= width - 4) {
          formDir = -1;
          formationY += 3;
        } else if (leftEdge + formDir * 3 <= 4) {
          formDir = 1;
          formationY += 3;
        } else {
          formationX += formDir * 3;
        }

        // Check if invaders reached bottom / ship
        const bottomEdge = formationY + maxRow * rowPitch + invH;
        if (bottomEdge >= shipY) {
          mode = 'over';
          announce('Game over. The invaders landed. Tap or press Enter to retry.');
        }
      }

      // Bullet-invader collisions
      for (const bullet of bullets) {
        for (const inv of aliveInvaders) {
          const ix = formationX + inv.col * colPitch;
          const iy = formationY + inv.row * rowPitch;
          if (
            bullet.x >= ix &&
            bullet.x <= ix + invW &&
            bullet.y >= iy &&
            bullet.y <= iy + invH
          ) {
            inv.alive = false;
            bullet.y = -99; // destroy bullet
            break;
          }
        }
      }
    };

    const draw = () => {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Stars
      ctx.globalAlpha = 0.5;
      for (const star of stars) {
        ctx.fillStyle = star.c;
        ctx.fillRect(Math.round(star.x), star.y, 1, 1);
      }
      ctx.globalAlpha = 1;

      // Ground line
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(0, WORLD_H - 1, width, 1);

      // Draw Invaders
      for (const inv of invaders) {
        if (!inv.alive) continue;
        const ix = Math.round(formationX + inv.col * colPitch);
        const iy = Math.round(formationY + inv.row * rowPitch);

        ctx.fillStyle = inv.color;
        if (formFrame === 0) {
          // Frame 0: legs in
          ctx.fillRect(ix + 1, iy, 2, 1);
          ctx.fillRect(ix, iy + 1, 4, 1);
          ctx.fillRect(ix, iy + 2, 1, 1);
          ctx.fillRect(ix + 3, iy + 2, 1, 1);
        } else {
          // Frame 1: legs out
          ctx.fillRect(ix, iy, 1, 1);
          ctx.fillRect(ix + 3, iy, 1, 1);
          ctx.fillRect(ix, iy + 1, 4, 1);
          ctx.fillRect(ix + 1, iy + 2, 2, 1);
        }
      }

      // Draw Ship
      const sx = Math.round(shipX);
      const sy = Math.round(shipY);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sx + 3, sy, 1, 1);
      ctx.fillRect(sx + 2, sy + 1, 3, 1);
      ctx.fillRect(sx + 1, sy + 2, 5, 1);
      ctx.fillRect(sx, sy + 3, 7, 1);

      // Draw Bullets
      ctx.fillStyle = '#f5c542';
      for (const b of bullets) {
        ctx.fillRect(Math.round(b.x), Math.round(b.y), 1, 2);
      }

      // HUD / Status
      if (mode === 'win') {
        const winText = 'YOU WIN - PRESS START';
        const tw = pixelTextWidth(winText);
        drawPixelText(ctx, winText, Math.round((width - tw) / 2), 22, '#5ad1cd');
      } else if (mode === 'over') {
        const overText = 'GAME OVER - TAP TO RETRY';
        const tw = pixelTextWidth(overText);
        drawPixelText(ctx, overText, Math.round((width - tw) / 2), 22, '#ed6f5c');
      }
    };

    const frame = (now: number) => {
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
      last = now;
      if (mode === 'playing' && !reduced) step(dt);
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
      } else if (e.key === 'Enter') {
        e.preventDefault();
        fireBullet();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') leftHeld = false;
      if (e.key === 'ArrowRight') rightHeld = false;
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cssX = e.clientX - rect.left;
      shipX = Math.max(2, Math.min(width - shipW - 2, cssX / scale - shipW / 2));
    };

    const onPointerDown = () => {
      canvas.focus({ preventScroll: true });
      fireBullet();
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible) start();
    });

    const onVisibility = () => {
      if (!document.hidden) start();
    };

    const resizeObserver = new ResizeObserver(resize);

    canvas.addEventListener('keydown', onKeyDown);
    canvas.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('visibilitychange', onVisibility);
    observer.observe(canvas);
    resizeObserver.observe(canvas);

    resize();
    start();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      canvas.removeEventListener('keydown', onKeyDown);
      canvas.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('visibilitychange', onVisibility);
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, [scale]);

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        tabIndex={0}
        aria-label="Space Invaders 404 mini-game. 404 digits are the invader formation. Use left and right arrow keys or pointer to move ship, Enter or tap to fire."
        className="hv-runner-canvas"
        style={{ height: WORLD_H * scale }}
      />
      <span ref={liveRef} className="sr-only" aria-live="polite" />
    </div>
  );
}
