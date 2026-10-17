'use client';

import { useEffect } from 'react';
import { drawPixelText, pixelTextWidth } from '@/lib/pixel';
import styles from './BreakoutMode.module.css';

const BALL_R = 4;
const PADDLE_H = 8;
const PADDLE_Y_PAD = 22; // paddle sits this far above the bottom edge
const HUD_TOP = 40; // the ball cannot rise above the HUD line
const START_LIVES = 3;
const END_BEAT_MS = 1500;

type Brick = {
  x: number;
  y: number;
  w: number;
  h: number;
  el: HTMLElement;
  color: string;
  hit: boolean;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
};

/** The game is desktop-pointer only; the page-level level makes no sense on touch. */
export function breakoutSupported(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.innerWidth < 900) return false;
  if (window.matchMedia('(hover: none)').matches) return false;
  return true;
}

const BRICK_TAG = /^(BUTTON|IMG|SVG|CANVAS|SCRIPT|STYLE|NOSCRIPT|TEXTAREA|INPUT|SELECT|OPTION|VIDEO|AUDIO|IFRAME|OBJECT|EMBED)$/i;
const CONTENT_SKIP_TAG = /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|LINK|META|TITLE)$/i;

function copyCanvasBitmaps(src: Element, clone: Element) {
  const s = src.querySelectorAll('canvas');
  const c = clone.querySelectorAll('canvas');
  const n = Math.min(s.length, c.length);
  for (let i = 0; i < n; i++) {
    const from = s[i] as HTMLCanvasElement;
    const to = c[i] as HTMLCanvasElement;
    if (!from.width || !from.height) continue;
    try {
      to.getContext('2d')?.drawImage(from, 0, 0);
    } catch {
      /* tainted or zero-sized canvas: leave blank */
    }
  }
}

function collectTextNodes(node: Node, out: Text[]) {
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      if ((child.textContent ?? '').trim()) out.push(child as Text);
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as Element;
      if (BRICK_TAG.test(el.tagName)) continue; // single brick, inner text stays
      collectTextNodes(child, out);
    }
  }
}

/** Split every text node of the clone into one span per word, in the clone only. */
function splitWords(root: Element) {
  const texts: Text[] = [];
  collectTextNodes(root, texts);
  for (const node of texts) {
    const raw = node.textContent ?? '';
    const frag = document.createDocumentFragment();
    let i = 0;
    while (i < raw.length) {
      const ws = /^\s+/.exec(raw.slice(i));
      if (ws) {
        frag.append(document.createTextNode(ws[0]));
        i += ws[0].length;
        continue;
      }
      const wd = /\S+/.exec(raw.slice(i));
      const word = (wd as RegExpExecArray)[0];
      const span = document.createElement('span');
      span.textContent = word;
      span.setAttribute('data-brick-word', '');
      frag.append(span);
      i += word.length;
    }
    node.replaceWith(frag);
  }
}

function brickColor(el: Element): string {
  let node: Element | null = el;
  while (node) {
    const m = /rgba?\(([^)]+)\)/.exec(getComputedStyle(node).color);
    if (m) {
      const parts = m[1].split(',').map((p) => parseFloat(p));
      const alpha = parts.length > 3 ? parts[3] : 1;
      if (alpha > 0.05) return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, 1)`;
    }
    node = node.parentElement;
  }
  return 'rgba(255, 255, 255, 0.85)';
}

function pickTopLevelRoot(): Element {
  const kids = Array.from(document.body.children).filter(
    (el) => !CONTENT_SKIP_TAG.test(el.tagName)
  );
  // The Next.js app usually lives in a single wrapper; descend into it so the
  // level is built from real sections (header / main sections / footer).
  if (kids.length === 1) {
    const inner = Array.from(kids[0].children).filter(
      (el) => !CONTENT_SKIP_TAG.test(el.tagName)
    );
    if (inner.length >= 1) return kids[0];
  }
  return document.body;
}

function hiDPICanvas(canvas: HTMLCanvasElement, w: number, h: number) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
  return ctx;
}

export default function BreakoutMode({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    if (!breakoutSupported()) {
      onClose();
      return;
    }

    const W = window.innerWidth;
    const H = window.innerHeight;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let done = false;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const later = (fn: () => void, ms: number) => {
      const t = setTimeout(() => {
        timers.delete(t);
        fn();
      }, ms);
      timers.add(t);
      return t;
    };

    // --- screen-reader live region lives outside any hidden subtree ---
    const live = document.createElement('div');
    live.className = 'sr-only';
    live.setAttribute('aria-live', 'polite');
    document.body.appendChild(live);
    const announce = (msg: string) => {
      live.textContent = '';
      void live.offsetWidth; // restart the announcement
      live.textContent = msg;
    };

    // --- remember the user's position first: scrolling to the level anchor
    // is for building the level, but on exit we return them to where they were
    const savedScrollY = window.scrollY;

    // --- scroll to the level anchor, then lock scrolling ---
    document.querySelector('#writing')?.scrollIntoView({ behavior: 'instant', block: 'start' });
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;
    const scrollbarW = Math.max(0, W - document.documentElement.clientWidth);
    document.body.style.overflow = 'hidden';
    if (scrollbarW > 0) document.body.style.paddingRight = `${scrollbarW}px`;

    // --- build the play layer from clones of the visible top-level sections ---
    const layer = document.createElement('div');
    layer.className = styles.layer;
    const cloneHost = document.createElement('div');
    cloneHost.setAttribute('aria-hidden', 'true');
    cloneHost.setAttribute('inert', '');
    layer.appendChild(cloneHost);

    const root = pickTopLevelRoot();
    const hiddenSources: { el: HTMLElement; prev: string }[] = [];
    for (const el of Array.from(root.children)) {
      if (CONTENT_SKIP_TAG.test(el.tagName)) continue;
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const hasFixedInside = el.querySelector('*') ? !!Array.from(el.querySelectorAll('*')).some((d) => getComputedStyle(d).position === 'fixed') : false;
      const paints = (rect.width > 0 && rect.height > 0) || hasFixedInside;
      if (!paints || cs.display === 'none' || cs.visibility === 'hidden') continue;

      const clone = el.cloneNode(true) as HTMLElement;
      const pos = cs.position;
      if (pos === 'fixed') {
        clone.style.position = 'fixed';
      } else {
        clone.style.position = 'absolute';
        clone.style.left = `${Math.round(rect.left)}px`;
        clone.style.top = `${Math.round(rect.top)}px`;
        clone.style.width = `${Math.round(rect.width)}px`;
        if (rect.height > 0) clone.style.minHeight = `${Math.round(rect.height)}px`;
      }
      clone.style.margin = '0';
      copyCanvasBitmaps(el, clone);
      splitWords(clone);
      // framer-motion Reveals frozen at their pre-animation inline state
      // (opacity 0 / translate) would clone as invisible; force them settled.
      for (const node of [clone, ...clone.querySelectorAll<HTMLElement>('*')]) {
        if (node.style.opacity && node.style.opacity !== '1') node.style.opacity = '1';
        if (node.style.transform && node.style.transform !== 'none') node.style.transform = 'none';
      }
      cloneHost.appendChild(clone);

      // Hide the real page; clones replace it visually (layout untouched).
      hiddenSources.push({
        el: el as HTMLElement,
        prev: (el as HTMLElement).style.getPropertyValue('visibility'),
      });
      (el as HTMLElement).style.setProperty('visibility', 'hidden', 'important');
    }
    document.body.appendChild(layer);

    // --- canvas above the clones ---
    const canvas = document.createElement('canvas');
    canvas.className = styles.canvas;
    canvas.setAttribute('tabindex', '-1');
    canvas.setAttribute(
      'aria-label',
      'Breakout game over the page. Move the paddle with the arrow keys or the pointer. Launch the ball with Space or a click. Press Escape to exit.'
    );
    const ctx = hiDPICanvas(canvas, W, H);
    layer.appendChild(canvas);

    // --- close button ---
    const topBar = document.createElement('div');
    topBar.className = styles.topBar;
    const hudText = document.createElement('span');
    hudText.className = styles.hudText;
    hudText.textContent = 'BREAKOUT • THE PAGE IS THE LEVEL';
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = styles.closeBtn;
    closeBtn.setAttribute('data-breakout-close', '');
    closeBtn.setAttribute('aria-label', 'Exit Breakout');
    closeBtn.textContent = 'ESC ✕';
    topBar.append(hudText, closeBtn);
    layer.appendChild(topBar);

    // --- level: every visible word/button/img/svg/canvas is a brick ---
    const padTop = H - PADDLE_Y_PAD - 8; // keep the paddle strip clear
    const bricks: Brick[] = [];
    const brickNodes = cloneHost.querySelectorAll<HTMLElement>('[data-brick-word], button, img, svg, canvas');
    for (const el of brickNodes) {
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity || '1') === 0) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      if (r.right <= 0 || r.left >= W || r.bottom <= 0 || r.top >= H) continue;
      // Bricks whose bottom edge is above the HUD ceiling can never be
      // reached by the ball; leaving them in would make the level
      // impossible to clear. They stay as scenery in the clone.
      if (r.bottom <= HUD_TOP + BALL_R + 1) continue;
      const h = Math.min(r.height, padTop - r.top);
      if (h < 3) continue;
      bricks.push({
        x: r.left,
        y: r.top,
        w: r.width,
        h,
        el,
        color: brickColor(el),
        hit: false,
      });
    }

    // --- game state ---

    const paddleW = Math.max(70, Math.min(140, W * 0.16));
    let paddleX = (W - paddleW) / 2;
    const paddleY = H - PADDLE_Y_PAD;
    let leftHeld = false;
    let rightHeld = false;
    let ballX = W / 2;
    let ballY = paddleY - BALL_R - 2;
    let ballVx = 0;
    let ballVy = 0;
    let attached = true;
    let lives = START_LIVES;
    let hits = 0;
    let ended: 'over' | 'clear' | null = null;
    let particles: Particle[] = [];
    let raf = 0;
    let last = performance.now();

    const burst = (b: Brick) => {
      if (reduced) return;
      const n = Math.max(6, Math.min(16, Math.round((b.w * b.h) / 90)));
      for (let i = 0; i < n; i++) {
        particles.push({
          x: b.x + Math.random() * b.w,
          y: b.y + Math.random() * b.h,
          vx: (Math.random() - 0.5) * 240,
          vy: (Math.random() - 0.5) * 240 - 60,
          life: 0.3 + Math.random() * 0.3,
          size: Math.random() > 0.6 ? 3 : 2,
          color: b.color,
        });
      }
    };

    const endGame = (how: 'over' | 'clear') => {
      if (ended) return;
      ended = how;
      announce(how === 'clear' ? 'Level clear! Every brick on the page is smashed.' : `Game over. No lives left. Score: ${hits} bricks.`);
      later(() => exit(), END_BEAT_MS);
    };

    const teardown = () => {
      cancelAnimationFrame(raf);
      for (const t of timers) clearTimeout(t);
      timers.clear();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('resize', onResize);
      layer.remove();
      for (const { el, prev } of hiddenSources) {
        if (prev) el.style.setProperty('visibility', prev, 'important');
        else el.style.removeProperty('visibility');
      }
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
      window.scrollTo({ top: savedScrollY, behavior: 'instant' });
      // Silent cleanup (Strict Mode teardown / unmount): drop this instance's
      // live region. A real exit keeps it so the "page restored" message lands.
      if (!done) live.remove();
    };

    // Real exit (user-ended or programmatic): tear down, announce, unmount.
    const exit = () => {
      if (done) return;
      done = true;
      teardown();
      announce('Breakout ended. The page is restored.');
      // Plain timer on purpose: teardown() cancels the scheduled set, and this
      // removal must still fire after the real exit unmounts the component.
      setTimeout(() => live.remove(), 600);
      onClose();
    };

    // React cleanup must NOT notify the parent: in dev, Strict Mode
    // double-invokes effects, and onClose() there would unmount the
    // freshly remounted game. Cleanup is a silent teardown only.

    const launch = () => {
      if (ended) return;
      attached = false;
      ballVy = -250;
      ballVx = (Math.random() * 2 - 1) * 160;
    };

    const step = (dt: number) => {
      if (ended) return;
      if (leftHeld) paddleX -= 380 * dt;
      if (rightHeld) paddleX += 380 * dt;
      paddleX = Math.max(2, Math.min(W - paddleW - 2, paddleX));

      for (const p of particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 220 * dt;
        p.life -= dt;
      }
      particles = particles.filter((p) => p.life > 0);

      if (attached) {
        ballX = paddleX + paddleW / 2;
        ballY = paddleY - BALL_R - 2;
        return;
      }

      // Sub-stepping so the ball cannot tunnel through small words.
      const speed = Math.hypot(ballVx, ballVy);
      const steps = Math.max(1, Math.min(8, Math.ceil((speed * dt) / 3)));
      const sdt = dt / steps;
      for (let s = 0; s < steps; s++) {
        ballX += ballVx * sdt;
        ballY += ballVy * sdt;

        if (ballX - BALL_R <= 2) {
          ballX = 2 + BALL_R;
          ballVx = Math.abs(ballVx);
        } else if (ballX + BALL_R >= W - 2) {
          ballX = W - 2 - BALL_R;
          ballVx = -Math.abs(ballVx);
        }
        if (ballY - BALL_R <= HUD_TOP) {
          ballY = HUD_TOP + BALL_R;
          ballVy = Math.abs(ballVy);
        }

        for (const brick of bricks) {
          if (brick.hit) continue;
          const cx = Math.max(brick.x, Math.min(ballX, brick.x + brick.w));
          const cy = Math.max(brick.y, Math.min(ballY, brick.y + brick.h));
          const dx = ballX - cx;
          const dy = ballY - cy;
          if (dx * dx + dy * dy <= BALL_R * BALL_R) {
            brick.hit = true;
            hits += 1;
            brick.el.style.setProperty('visibility', 'hidden', 'important');
            burst(brick);
            if (Math.abs(dx) > Math.abs(dy)) {
              ballVx = dx > 0 ? Math.abs(ballVx) : -Math.abs(ballVx);
            } else if (Math.abs(dy) > Math.abs(dx)) {
              ballVy = dy > 0 ? Math.abs(ballVy) : -Math.abs(ballVy);
            } else {
              ballVx = -ballVx;
              ballVy = -ballVy;
            }
            announce(`Brick hit. ${bricks.length - hits} left.`);
            if (hits >= bricks.length) endGame('clear');
            break;
          }
        }

        if (ballVy > 0 && ballY + BALL_R >= paddleY && ballY - BALL_R <= paddleY + PADDLE_H && ballX >= paddleX - 6 && ballX <= paddleX + paddleW + 6) {
          ballVy = -Math.abs(ballVy);
          const offset = (ballX - (paddleX + paddleW / 2)) / (paddleW / 2);
          ballVx = offset * 240;
          if (!reduced) {
            for (let i = 0; i < 4; i++) {
              particles.push({ x: ballX, y: paddleY, vx: (Math.random() - 0.5) * 120, vy: -Math.random() * 80, life: 0.25, size: 2, color: '#5ad1cd' });
            }
          }
        }

        if (ballY > H + BALL_R + 10) {
          lives -= 1;
          if (lives > 0) {
            announce(`Lost a life. ${lives} left.`);
            attached = true;
            ballVx = 0;
          } else {
            endGame('over');
          }
          break;
        }
        if (ended) break;
      }
    };

    const draw = () => {
      ctx?.clearRect(0, 0, W, H);
      if (!ctx) return;

      // Particles
      for (const p of particles) {
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      }

      // Paddle
      ctx.fillStyle = '#5ad1cd';
      ctx.fillRect(Math.round(paddleX), paddleY, Math.round(paddleW), PADDLE_H);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.round(paddleX + 2), paddleY + 1, Math.round(paddleW) - 4, 1);

      // Ball
      ctx.fillStyle = '#f5c542';
      ctx.fillRect(Math.round(ballX - BALL_R), Math.round(ballY - BALL_R), BALL_R * 2, BALL_R * 2);

      // HUD (below the close button; drawn over the ball, arcade-style)
      const livesTxt = `LIVES ${lives}`;
      const bricksTxt = `BRICKS ${bricks.length - hits}/${bricks.length}`;
      drawPixelText(ctx, livesTxt, W - 12 - pixelTextWidth(livesTxt), 46, '#84cdfa');
      drawPixelText(ctx, bricksTxt, W - 12 - pixelTextWidth(bricksTxt), 56, '#5ad1cd');

      if (attached && !ended) {
        const t = 'SPACE / CLICK TO LAUNCH';
        drawPixelText(ctx, t, Math.round((W - pixelTextWidth(t)) / 2), paddleY - 34, '#84cdfa');
      }

      if (ended) {
        const big = ended === 'clear' ? 'LEVEL CLEAR' : 'GAME OVER';
        const color = ended === 'clear' ? '#5ad1cd' : '#ed6f5c';
        const scale = 7;
        ctx.save();
        ctx.scale(scale, scale);
        drawPixelText(ctx, big, W / (2 * scale) - pixelTextWidth(big) / 2, H / (2 * scale) - 2.5, color);
        ctx.restore();
        const sub = 'PRESS ANY KEY OR CLICK';
        drawPixelText(ctx, sub, Math.round((W - pixelTextWidth(sub)) / 2), Math.round(H / 2) + 24, '#84cdfa');
      }
    };

    const frame = (now: number) => {
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
      last = now;
      step(dt);
      draw();
      raf = requestAnimationFrame(frame);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        exit();
        return;
      }
      if (ended) {
        e.preventDefault();
        exit();
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        leftHeld = true;
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        rightHeld = true;
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (attached) launch();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') leftHeld = false;
      if (e.key === 'ArrowRight') rightHeld = false;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (ended) return;
      paddleX = Math.max(2, Math.min(W - paddleW - 2, e.clientX - paddleW / 2));
    };

    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest?.('[data-breakout-close]')) return;
      if (ended) {
        e.preventDefault();
        exit();
        return;
      }
      if (attached) launch();
    };

    const onResize = () => {
      exit();
    };

    closeBtn.addEventListener('click', () => exit());

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('resize', onResize);
    canvas.focus();
    announce('Breakout started. The page is the level. Move with the arrow keys or the pointer, launch with Space or a click, exit with Escape.');
    raf = requestAnimationFrame(frame);

    return () => teardown();
  }, [onClose]);

  return null;
}
