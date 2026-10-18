'use client';

import { useEffect, useRef } from 'react';
import { drawPixelText, pixelTextWidth, type Sprite } from '@/lib/pixel';

// Virtual world coordinate system: 180x180 square.
const WORLD_SIZE = 180;
const CX = WORLD_SIZE / 2; // 90
const CY = WORLD_SIZE / 2; // 90
const PLAYER_R = 72; // radius of player circle
const HOLD_R = 48; // radius of enemy orbital holding ring
const HI_KEY = 'bl-warp1983-hi';
const STAR_COLOURS = ['#9b59b6', '#84cdfa', '#5ad1cd', '#ffffff'];

const WARP_PALETTE: Record<string, string> = {
  w: '#ffffff',
  b: '#84cdfa', // retro neon arcade cyan-blue
  c: '#9b59b6', // retro purple / magenta
  t: '#5ad1cd', // retro teal
  r: '#ed6f5c', // retro red
  d: '#5a1f1a', // dark red
  y: '#f5c542', // gold / yellow
  l: '#fff3b0', // shine
  e: '#121212', // dark
};

function makeSpriteCanvas(sprite: Sprite): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = sprite[0].length;
  canvas.height = sprite.length;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  sprite.forEach((row, y) => {
    Array.from(row).forEach((key, x) => {
      const colour = WARP_PALETTE[key];
      if (!colour) return;
      ctx.fillStyle = colour;
      ctx.fillRect(x, y, 1, 1);
    });
  });
  return canvas;
}

// 9x9 Player wedge fighter pointing upward (facing center when rotated)
const SHIP_SPRITE: Sprite = [
  '....w....',
  '...wbw...',
  '..bbwbb..',
  '..bbwbb..',
  '.bbbtbbb.',
  'bbbbwbbbb',
  'b.b...b.b',
  'b.......b',
  '..yy.yy..',
];

// 7x7 Scout enemy (1 hit) - 2 animated frames
const SCOUT_FRAMES: readonly Sprite[] = [
  [
    'c.....c',
    'ct...tc',
    '.ctwtc.',
    '..www..',
    '.ctwtc.',
    'ct...tc',
    'c.....c',
  ],
  [
    '.c...c.',
    'c.t.t.c',
    '.twwwwt.',
    '..wcw..',
    '.twwwwt.',
    'c.t.t.c',
    '.c...c.',
  ],
];

// 9x9 Cruiser heavy enemy (2 hits) - 2 animated frames
const CRUISER_FRAMES: readonly Sprite[] = [
  [
    '..rrrrr..',
    '.rryyyrr.',
    'rry.w.yrr',
    'ry.www.yr',
    'rywwwwwyr',
    'ry.www.yr',
    'rry.w.yrr',
    '.rryyyrr.',
    '..rrrrr..',
  ],
  [
    '.rrrrr..',
    'rryyyyrr.',
    'ryy.w.yyr',
    'ry.www.yr',
    'rywwwwwyr',
    'ry.www.yr',
    'ryy.w.yyr',
    'rryyyyrr.',
    '.rrrrr..',
  ],
];

// 3x3 Player bullet
const BULLET_SPRITE: Sprite = [
  '.w.',
  'wbw',
  '.w.',
];

// 3x3 Enemy projectile
const ENEMY_BULLET_SPRITE: Sprite = [
  '.y.',
  'yry',
  '.y.',
];

// 5x5 Mini ship icon for life counter
const MINI_SHIP_SPRITE: Sprite = [
  '..w..',
  '.bbb.',
  'bbwbb',
  'b...b',
  '.y.y.',
];

type Mode = 'attract' | 'playing' | 'over';

interface Star {
  angle: number;
  dist: number;
  speed: number;
  c: string;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  fromPlayer: boolean;
}

interface Enemy {
  id: number;
  type: 'scout' | 'cruiser';
  hp: number;
  maxHp: number;
  radius: number;
  angle: number;
  angularSpeed: number;
  radialSpeed: number;
  state: 'spawn' | 'orbit' | 'dive' | 'bonus';
  diveProgress: number;
  diveTargetAngle: number;
  shootCooldown: number;
  alive: boolean;
  flashTimer: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  c: string;
}

class SoundFX {
  private ctx: AudioContext | null = null;
  public muted = true;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (!this.muted) this.init();
    return this.muted;
  }

  public shoot() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(840, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.07);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.07);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  public hit() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.06);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.06);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  public explode() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.16);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.16);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  public warp() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const notes = [330, 440, 550, 660, 880];
    const now = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'square';
      const t = now + idx * 0.05;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.07, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.045);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t);
      osc.stop(t + 0.05);
    });
  }

  public bonus() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const notes = [523, 659, 784, 1046];
    const now = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'square';
      const t = now + idx * 0.08;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.09, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.075);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t);
      osc.stop(t + 0.08);
    });
  }
}

const pad = (n: number) => String(n).padStart(5, '0');

export default function Warp1983Game({
  className,
}: {
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const liveRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sound = new SoundFX();

    const sprites = {
      ship: makeSpriteCanvas(SHIP_SPRITE),
      scouts: SCOUT_FRAMES.map((f) => makeSpriteCanvas(f)),
      cruisers: CRUISER_FRAMES.map((f) => makeSpriteCanvas(f)),
      bullet: makeSpriteCanvas(BULLET_SPRITE),
      enemyBullet: makeSpriteCanvas(ENEMY_BULLET_SPRITE),
      miniShip: makeSpriteCanvas(MINI_SHIP_SPRITE),
    };

    let mode: Mode = 'attract';
    let playerAngle = Math.PI / 2; // bottom of circle
    let playerLives = 3;
    let score = 0;
    let hi = 0;
    let animT = 0;
    let overAt = 0;
    let invulnerableTimer = 0;
    let lastShotTime = 0;
    let warpSpeedBoost = 1.0;
    let bannerText = '';
    let bannerTimer = 0;

    // Stage progression
    const DESTINATIONS = ['EARTH', 'MARS', 'JUPITER'];
    let destIndex = 0;
    let warpsLeft = 3;
    let isBonusStage = false;
    let bonusTotal = 0;
    let bonusKills = 0;

    // Formation spawning state
    let enemiesToSpawn = 0;
    let spawnTimer = 0;
    let currentSpawnAngle = 0;

    let enemies: Enemy[] = [];
    let bullets: Bullet[] = [];
    const particles: Particle[] = [];
    let stars: Star[] = [];

    // Inputs
    let leftHeld = false;
    let rightHeld = false;
    let fireHeld = false;
    let pointerDragging = false;
    // Gamepad (USB or Bluetooth look the same to the Gamepad API). Browsers only expose a
    // pad after one of its buttons is pressed on the page, so "connected" means "pressed".
    let padConnected = false;
    let padFlash = 0; // seconds left of the "CONTROLLER READY" banner
    let padSteer: number | null = null; // ring angle the stick/d-pad points at
    let padFire = false;
    let padHeld = false;

    // Animation & visibility lifecycle
    let raf = 0;
    let last = 0;
    let visible = true;

    try {
      hi = Number(localStorage.getItem(HI_KEY)) || 0;
    } catch {}

    const announce = (text: string) => {
      if (liveRef.current) liveRef.current.textContent = text;
    };

    const initStars = () => {
      stars = Array.from({ length: 60 }, (_, i) => ({
        angle: Math.random() * Math.PI * 2,
        dist: 2 + Math.random() * (PLAYER_R + 20),
        speed: 35 + (i % 5) * 8,
        c: STAR_COLOURS[i % STAR_COLOURS.length],
      }));
    };
    initStars();

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      const cssSize = Math.max(160, rect.width || 280);
      canvas.width = Math.round(cssSize * dpr);
      canvas.height = Math.round(cssSize * dpr);
      const scale = (cssSize * dpr) / WORLD_SIZE;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.imageSmoothingEnabled = false;
      draw();
    };

    const spawnFormation = () => {
      if (isBonusStage) {
        enemiesToSpawn = 10;
        bonusTotal = 10;
        bonusKills = 0;
        bannerText = 'CHALLENGING STAGE!';
        bannerTimer = 2.4;
      } else {
        enemiesToSpawn = 10 + (3 - warpsLeft) * 2;
        bannerText = `${warpsLeft} ${warpsLeft === 1 ? 'WARP' : 'WARPS'} TO ${DESTINATIONS[destIndex]}`;
        bannerTimer = 2.2;
      }
      spawnTimer = 0.5;
      currentSpawnAngle = Math.random() * Math.PI * 2;
    };

    const startStage = () => {
      enemies = [];
      bullets = [];
      spawnFormation();
    };

    const resetGame = () => {
      playerAngle = Math.PI / 2;
      playerLives = 3;
      score = 0;
      destIndex = 0;
      warpsLeft = 3;
      isBonusStage = false;
      invulnerableTimer = 2.0;
      warpSpeedBoost = 1.0;
      startStage();
    };

    const createExplosion = (x: number, y: number, colour: string) => {
      for (let i = 0; i < 12; i++) {
        const a = Math.random() * Math.PI * 2;
        const spd = 20 + Math.random() * 55;
        particles.push({
          x,
          y,
          vx: Math.cos(a) * spd,
          vy: Math.sin(a) * spd,
          life: 0.35 + Math.random() * 0.25,
          maxLife: 0.6,
          c: Math.random() < 0.6 ? colour : '#ffffff',
        });
      }
    };

    const firePlayerBullet = () => {
      const now = performance.now();
      if (now - lastShotTime < 160) return;
      if (bullets.filter((b) => b.fromPlayer).length >= 4) return;
      lastShotTime = now;

      // In Gyruss, ship sits on the outer ring and shoots towards the center
      const px = CX + Math.cos(playerAngle) * PLAYER_R;
      const py = CY + Math.sin(playerAngle) * PLAYER_R;
      const vx = -Math.cos(playerAngle) * 210;
      const vy = -Math.sin(playerAngle) * 210;

      bullets.push({ x: px, y: py, vx, vy, fromPlayer: true });
      sound.shoot();
    };

    const enemyShoot = (e: Enemy) => {
      if (isBonusStage || mode === 'over') return;
      const ex = CX + Math.cos(e.angle) * e.radius;
      const ey = CY + Math.sin(e.angle) * e.radius;
      const vx = Math.cos(e.angle) * 70;
      const vy = Math.sin(e.angle) * 70;
      bullets.push({ x: ex, y: ey, vx, vy, fromPlayer: false });
    };

    const takeHit = () => {
      if (invulnerableTimer > 0) return;
      const px = CX + Math.cos(playerAngle) * PLAYER_R;
      const py = CY + Math.sin(playerAngle) * PLAYER_R;
      createExplosion(px, py, '#84cdfa');
      sound.explode();

      if (mode === 'attract') {
        // In attract mode, instant respawn to keep playing
        invulnerableTimer = 1.5;
        return;
      }

      playerLives--;
      if (playerLives <= 0) {
        mode = 'over';
        overAt = performance.now();
        if (score > hi) {
          hi = score;
          try {
            localStorage.setItem(HI_KEY, String(hi));
          } catch {}
        }
        announce(`Game over. Final score ${score}. Tap or press Space to retry.`);
      } else {
        invulnerableTimer = 2.2;
      }
    };

    const action = () => {
      if (mode === 'attract') {
        resetGame();
        mode = 'playing';
        announce(
          padConnected
            ? 'WARP 1983 started. Point the stick or d-pad where the ship should go, hold A to fire.'
            : 'WARP 1983 started. Left/Right or A/D to rotate, Space or tap to fire.'
        );
        start();
      } else if (mode === 'playing') {
        firePlayerBullet();
      } else if (mode === 'over' && performance.now() - overAt > 500) {
        resetGame();
        mode = 'playing';
        announce('Game restarted.');
        start();
      }
    };

    const step = (dt: number) => {
      animT += dt;

      if (bannerTimer > 0) {
        bannerTimer -= dt;
      }

      if (invulnerableTimer > 0) {
        invulnerableTimer -= dt;
      }

      // Starfield 3D warp streaming from center
      const speedMult = warpSpeedBoost;
      for (const star of stars) {
        const radialV = (star.speed + star.dist * 2.8) * speedMult * dt;
        star.dist += radialV;
        if (star.dist > PLAYER_R + 24) {
          star.dist = 2 + Math.random() * 4;
          star.angle = Math.random() * Math.PI * 2;
          star.c = STAR_COLOURS[Math.floor(Math.random() * STAR_COLOURS.length)];
        }
      }

      // Enemy spawning from center
      if (enemiesToSpawn > 0) {
        spawnTimer -= dt;
        if (spawnTimer <= 0) {
          spawnTimer = 0.22;
          enemiesToSpawn--;
          currentSpawnAngle += 0.42;

          const isCruiser = !isBonusStage && enemiesToSpawn % 4 === 0;
          enemies.push({
            id: Math.random(),
            type: isCruiser ? 'cruiser' : 'scout',
            hp: isCruiser ? 2 : 1,
            maxHp: isCruiser ? 2 : 1,
            radius: 4,
            angle: currentSpawnAngle,
            angularSpeed: 2.8,
            radialSpeed: 45,
            state: isBonusStage ? 'bonus' : 'spawn',
            diveProgress: 0,
            diveTargetAngle: 0,
            shootCooldown: 1.5 + Math.random() * 2.5,
            alive: true,
            flashTimer: 0,
          });
        }
      }

      // Enemy update loop
      for (const e of enemies) {
        if (!e.alive) continue;
        if (e.flashTimer > 0) e.flashTimer -= dt;

        if (e.state === 'spawn') {
          e.radius += e.radialSpeed * dt;
          e.angle += e.angularSpeed * dt;
          if (e.radius >= HOLD_R) {
            e.radius = HOLD_R;
            e.state = 'orbit';
            e.angularSpeed = (Math.random() < 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.4);
          }
        } else if (e.state === 'orbit') {
          e.angle += e.angularSpeed * dt;
          e.shootCooldown -= dt;
          if (e.shootCooldown <= 0) {
            e.shootCooldown = 2.5 + Math.random() * 3;
            // Chance to dive or shoot
            if (Math.random() < 0.45) {
              e.state = 'dive';
              e.diveProgress = 0;
              e.diveTargetAngle = playerAngle + (Math.random() - 0.5) * 0.8;
            } else {
              enemyShoot(e);
            }
          }
        } else if (e.state === 'dive') {
          e.diveProgress += dt * 0.65;
          // Arcing dive toward player ring and returning
          const progress = Math.sin(e.diveProgress * Math.PI);
          e.radius = HOLD_R + progress * (PLAYER_R - HOLD_R + 6);
          e.angle += (e.diveTargetAngle - e.angle) * dt * 2.5;

          if (e.diveProgress > 0.4 && e.diveProgress < 0.45) {
            enemyShoot(e);
          }

          if (e.diveProgress >= 1.0) {
            e.state = 'orbit';
            e.radius = HOLD_R;
            e.shootCooldown = 2.0 + Math.random() * 2;
          }
        } else if (e.state === 'bonus') {
          // Bonus formation: swooping figure in circle
          e.radius += 24 * dt;
          e.angle += 3.2 * dt;
          if (e.radius > PLAYER_R + 15) {
            e.alive = false;
          }
        }

        // Collision with player ship
        const ex = CX + Math.cos(e.angle) * e.radius;
        const ey = CY + Math.sin(e.angle) * e.radius;
        const px = CX + Math.cos(playerAngle) * PLAYER_R;
        const py = CY + Math.sin(playerAngle) * PLAYER_R;
        if (Math.hypot(ex - px, ey - py) < 8) {
          createExplosion(ex, ey, '#ed6f5c');
          e.alive = false;
          takeHit();
        }
      }

      // Bullet update & collision detection
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        // Clean up out of bounds
        const distFromCenter = Math.hypot(b.x - CX, b.y - CY);
        if (distFromCenter > PLAYER_R + 18 || (b.fromPlayer && distFromCenter < 2)) {
          bullets.splice(i, 1);
          continue;
        }

        if (b.fromPlayer) {
          // Player bullet hits enemies
          let hit = false;
          for (const e of enemies) {
            if (!e.alive) continue;
            const ex = CX + Math.cos(e.angle) * e.radius;
            const ey = CY + Math.sin(e.angle) * e.radius;
            if (Math.hypot(b.x - ex, b.y - ey) < (e.type === 'cruiser' ? 7 : 5)) {
              hit = true;
              e.hp--;
              e.flashTimer = 0.08;
              if (e.hp <= 0) {
                e.alive = false;
                const pts = e.type === 'cruiser' ? 200 : 100;
                score += pts;
                if (isBonusStage) bonusKills++;
                createExplosion(ex, ey, e.type === 'cruiser' ? '#f5c542' : '#84cdfa');
                sound.explode();
              } else {
                sound.hit();
              }
              break;
            }
          }
          if (hit) {
            bullets.splice(i, 1);
            continue;
          }
        } else {
          // Enemy bullet hits player
          const px = CX + Math.cos(playerAngle) * PLAYER_R;
          const py = CY + Math.sin(playerAngle) * PLAYER_R;
          if (Math.hypot(b.x - px, b.y - py) < 6) {
            bullets.splice(i, 1);
            takeHit();
            continue;
          }
        }
      }

      // Check wave completion
      const activeEnemies = enemies.filter((e) => e.alive);
      if (enemiesToSpawn === 0 && activeEnemies.length === 0 && bannerTimer <= 0) {
        if (isBonusStage) {
          // Completed bonus stage
          if (bonusKills === bonusTotal && bonusTotal > 0) {
            score += 5000;
            bannerText = 'PERFECT! 5000 PTS';
            sound.bonus();
          } else {
            bannerText = `BONUS: ${bonusKills * 100} PTS`;
          }
          bannerTimer = 2.4;
          isBonusStage = false;
          destIndex = (destIndex + 1) % DESTINATIONS.length;
          warpsLeft = 3;
          warpSpeedBoost = 3.5;
          sound.warp();
          setTimeout(() => {
            warpSpeedBoost = 1.0;
            startStage();
          }, 2000);
        } else {
          warpsLeft--;
          if (warpsLeft <= 0) {
            // Reached destination! Trigger bonus stage
            isBonusStage = true;
            bannerText = `WARP TO ${DESTINATIONS[destIndex]}!`;
            bannerTimer = 2.2;
            warpSpeedBoost = 4.0;
            sound.warp();
            setTimeout(() => {
              warpSpeedBoost = 1.0;
              startStage();
            }, 2000);
          } else {
            // Next warp in current destination
            bannerText = 'WARP CLEAR!';
            bannerTimer = 1.6;
            warpSpeedBoost = 3.2;
            sound.warp();
            setTimeout(() => {
              warpSpeedBoost = 1.0;
              startStage();
            }, 1600);
          }
        }
      }

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        if (p.life <= 0) particles.splice(i, 1);
      }

      // Player rotation inputs
      const rotSpeed = 3.8;
      // Keys and pad both steer toward a spot on the ring, the short way round, like the
      // arcade stick. Left heads for the left side wherever the ship is; a plain
      // clockwise/counterclockwise turn would feel reversed in the top half of the ring.
      const keyX = Number(rightHeld) - Number(leftHeld);
      const steer = keyX ? (keyX > 0 ? 0 : Math.PI) : padSteer;
      if (steer !== null && mode === 'playing') {
        const diff = Math.atan2(Math.sin(steer - playerAngle), Math.cos(steer - playerAngle));
        playerAngle += Math.max(-rotSpeed * dt, Math.min(rotSpeed * dt, diff));
      }
      if ((fireHeld || padFire) && mode === 'playing') firePlayerBullet();
      if (padFlash > 0) padFlash -= dt;

      // Normalize angle [0, 2*PI)
      playerAngle = (playerAngle + Math.PI * 2) % (Math.PI * 2);

      // Attract mode AI: plays itself smoothly
      if (mode === 'attract') {
        let targetEnemy: Enemy | null = null;
        let minD = Infinity;
        for (const e of activeEnemies) {
          const ex = CX + Math.cos(e.angle) * e.radius;
          const ey = CY + Math.sin(e.angle) * e.radius;
          const px = CX + Math.cos(playerAngle) * PLAYER_R;
          const py = CY + Math.sin(playerAngle) * PLAYER_R;
          const d = Math.hypot(ex - px, ey - py);
          if (d < minD) {
            minD = d;
            targetEnemy = e;
          }
        }

        if (targetEnemy) {
          let diff = targetEnemy.angle - playerAngle;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          playerAngle += Math.sign(diff) * Math.min(Math.abs(diff), 3.2 * dt);
          if (Math.abs(diff) < 0.28 && performance.now() - lastShotTime > 240) {
            firePlayerBullet();
          }
        }
      }
    };

    const draw = () => {
      // Clear entire backing store
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Background space grid / tunnel ring
      ctx.strokeStyle = 'rgba(132, 205, 250, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(CX, CY, PLAYER_R, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(155, 89, 182, 0.08)';
      ctx.beginPath();
      ctx.arc(CX, CY, HOLD_R, 0, Math.PI * 2);
      ctx.stroke();

      // Starfield
      for (const s of stars) {
        const sx = CX + Math.cos(s.angle) * s.dist;
        const sy = CY + Math.sin(s.angle) * s.dist;
        ctx.fillStyle = s.c;
        if (s.dist > 46) {
          // Streaming streak outward
          const tailLen = Math.min(4, s.dist * 0.08);
          ctx.beginPath();
          ctx.moveTo(Math.round(sx), Math.round(sy));
          ctx.lineTo(
            Math.round(sx - Math.cos(s.angle) * tailLen),
            Math.round(sy - Math.sin(s.angle) * tailLen)
          );
          ctx.strokeStyle = s.c;
          ctx.stroke();
        } else {
          ctx.fillRect(Math.round(sx), Math.round(sy), 1, 1);
        }
      }

      // Draw enemies
      const frameIdx = Math.floor(animT * 6) % 2;
      for (const e of enemies) {
        if (!e.alive) continue;
        const ex = CX + Math.cos(e.angle) * e.radius;
        const ey = CY + Math.sin(e.angle) * e.radius;
        const sprite =
          e.type === 'cruiser' ? sprites.cruisers[frameIdx] : sprites.scouts[frameIdx];

        ctx.save();
        ctx.translate(Math.round(ex), Math.round(ey));
        // Rotate enemy to align with flight path
        ctx.rotate(e.angle + Math.PI / 2);
        if (e.flashTimer > 0) {
          ctx.globalAlpha = 0.8;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-sprite.width / 2, -sprite.height / 2, sprite.width, sprite.height);
        } else {
          ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
        }
        ctx.restore();
      }

      // Draw bullets
      for (const b of bullets) {
        const sprite = b.fromPlayer ? sprites.bullet : sprites.enemyBullet;
        ctx.drawImage(sprite, Math.round(b.x - 1), Math.round(b.y - 1));
      }

      // Draw particles
      for (const p of particles) {
        ctx.fillStyle = p.c;
        const alpha = Math.max(0, p.life / p.maxLife);
        ctx.globalAlpha = alpha;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
      }
      ctx.globalAlpha = 1;

      // Draw player ship
      const px = CX + Math.cos(playerAngle) * PLAYER_R;
      const py = CY + Math.sin(playerAngle) * PLAYER_R;
      const facingAngle = playerAngle + Math.PI; // pointing toward center

      const blink = invulnerableTimer > 0 && Math.floor(animT * 14) % 2 === 0;
      if (!blink && mode !== 'over') {
        ctx.save();
        ctx.translate(Math.round(px), Math.round(py));
        // Rotate so ship nose points toward center
        ctx.rotate(facingAngle - Math.PI / 2);
        ctx.drawImage(sprites.ship, -sprites.ship.width / 2, -sprites.ship.height / 2);
        ctx.restore();
      }

      // HUD overlay: Score, Destination, Hi-Score
      const dim = 'rgba(255,255,255,0.7)';
      drawPixelText(ctx, `1UP ${pad(score)}`, 4, 4, dim);
      const hiText = `HI ${pad(hi)}`;
      drawPixelText(ctx, hiText, WORLD_SIZE - pixelTextWidth(hiText) - 4, 4, dim);

      // Sound mute status indicator (interactive button in corner)
      const sndText = sound.muted ? 'SND:OFF' : 'SND:ON';
      drawPixelText(
        ctx,
        sndText,
        WORLD_SIZE - pixelTextWidth(sndText) - 4,
        WORLD_SIZE - 9,
        sound.muted ? 'rgba(255,255,255,0.35)' : '#5ad1cd'
      );

      // Player lives icons at bottom left
      for (let i = 0; i < playerLives; i++) {
        ctx.drawImage(sprites.miniShip, 4 + i * 8, WORLD_SIZE - 9);
      }

      // Controller status: a banner when one connects, then a small "PAD" tag
      if (padConnected) {
        drawPixelText(ctx, 'PAD', Math.round((WORLD_SIZE - pixelTextWidth('PAD')) / 2), WORLD_SIZE - 9, '#5ad1cd');
      }
      if (padFlash > 0) {
        const ready = 'CONTROLLER READY';
        drawPixelText(ctx, ready, Math.round((WORLD_SIZE - pixelTextWidth(ready)) / 2), 14, '#5ad1cd');
      }

      // Stage banner in center (attract mode shows the title there instead)
      if (bannerTimer > 0 && bannerText && mode !== 'attract') {
        const tw = pixelTextWidth(bannerText);
        drawPixelText(ctx, bannerText, Math.round((WORLD_SIZE - tw) / 2), CY - 18, '#ffffff');
      }

      // Attract mode overlay
      if (mode === 'attract') {
        const title = 'WARP 1983';
        const tw = pixelTextWidth(title, 2);
        drawPixelText(ctx, title, Math.round((WORLD_SIZE - tw) / 2), CY - 24, '#84cdfa', 2);

        const blinkText = reduced || Math.floor(animT * 2) % 2 === 0;
        if (blinkText) {
          const sub = padConnected ? 'PRESS A OR START' : 'SPACE OR TAP TO PLAY';
          const sw = pixelTextWidth(sub);
          drawPixelText(ctx, sub, Math.round((WORLD_SIZE - sw) / 2), CY + 14, '#ffffff');
        }

        const hint = padConnected ? 'STICK TO MOVE - A TO FIRE' : 'A/D TO ROTATE - SPACE FIRE';
        const hw = pixelTextWidth(hint);
        drawPixelText(ctx, hint, Math.round((WORLD_SIZE - hw) / 2), CY + 24, 'rgba(255,255,255,0.5)');
      }

      // Game Over overlay
      if (mode === 'over') {
        const goText = 'GAME OVER';
        const gw = pixelTextWidth(goText, 2);
        drawPixelText(ctx, goText, Math.round((WORLD_SIZE - gw) / 2), CY - 16, '#ed6f5c', 2);

        const retry = padConnected ? 'PRESS A TO RETRY' : 'TAP OR SPACE TO RETRY';
        const rw = pixelTextWidth(retry);
        drawPixelText(ctx, retry, Math.round((WORLD_SIZE - rw) / 2), CY + 12, '#ffffff');
      }
    };

    const pollGamepad = () => {
      const pads = navigator.getGamepads?.() ?? [];
      const pad = Array.from(pads).find((p) => p && p.connected);
      padSteer = null;
      padFire = false;
      if (!pad) return;

      // Standard mapping: left stick axes 0/1, d-pad buttons 12-15 (up, down, left, right).
      const b = (i: number) => Boolean(pad.buttons[i]?.pressed);
      const sx = pad.axes[0] ?? 0;
      const sy = pad.axes[1] ?? 0;
      const dx = Number(b(15)) - Number(b(14));
      const dy = Number(b(13)) - Number(b(12));
      if (Math.hypot(sx, sy) > 0.5) padSteer = Math.atan2(sy, sx);
      else if (dx || dy) padSteer = Math.atan2(dy, dx);

      // A / RB / RT fire (held = autofire); A or Start also starts and retries.
      padFire = b(0) || b(5) || b(7);
      const pressed = b(0) || b(9);
      if (pressed && !padHeld) action();
      padHeld = pressed;
    };

    const onPadConnected = (event: GamepadEvent) => {
      padConnected = true;
      padFlash = 2.5;
      announce(`Controller connected: ${event.gamepad.id}. Stick or d-pad to move, A to fire.`);
      start();
    };

    const onPadDisconnected = () => {
      padConnected = Array.from(navigator.getGamepads?.() ?? []).some((p) => p && p.connected);
      if (!padConnected) announce('Controller disconnected.');
    };

    const frame = (now: number) => {
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
      last = now;
      pollGamepad();

      if (mode !== 'over') {
        step(dt);
      } else {
        animT += dt;
      }

      draw();
      raf = visible && !document.hidden ? requestAnimationFrame(frame) : 0;
    };

    function start() {
      if (raf || !visible || document.hidden) return;
      if (reduced && mode === 'attract') return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    const onKey = (event: KeyboardEvent) => {
      if (
        event.code === 'ArrowLeft' ||
        event.code === 'KeyA' ||
        event.code === 'ArrowRight' ||
        event.code === 'KeyD' ||
        event.code === 'Space' ||
        event.code === 'ArrowUp' ||
        event.code === 'KeyW'
      ) {
        // Prevent scrolling ONLY while canvas has focus
        event.preventDefault();
      }

      if (event.code === 'ArrowLeft' || event.code === 'KeyA') leftHeld = true;
      if (event.code === 'ArrowRight' || event.code === 'KeyD') rightHeld = true;
      if (event.code === 'Space' || event.code === 'ArrowUp' || event.code === 'KeyW') {
        fireHeld = true;
        action();
      }
      if (event.code === 'KeyM') {
        sound.toggleMute();
      }
      if (event.code === 'Escape') {
        canvas.blur();
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'ArrowLeft' || event.code === 'KeyA') leftHeld = false;
      if (event.code === 'ArrowRight' || event.code === 'KeyD') rightHeld = false;
      if (event.code === 'Space' || event.code === 'ArrowUp' || event.code === 'KeyW') {
        fireHeld = false;
      }
    };

    const handlePointerCoord = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const scale = WORLD_SIZE / rect.width;
      const mx = (clientX - rect.left) * scale;
      const my = (clientY - rect.top) * scale;

      // Check sound toggle click (bottom right)
      if (mx > WORLD_SIZE - 40 && my > WORLD_SIZE - 20) {
        sound.toggleMute();
        return;
      }

      // Rotate ship to touch/pointer angle around center
      playerAngle = (Math.atan2(my - CY, mx - CX) + Math.PI * 2) % (Math.PI * 2);
    };

    const onPointerDown = (event: PointerEvent) => {
      canvas.focus({ preventScroll: true, focusVisible: false } as FocusOptions);
      pointerDragging = true;
      handlePointerCoord(event.clientX, event.clientY);
      action();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!pointerDragging) return;
      handlePointerCoord(event.clientX, event.clientY);
    };

    const onPointerUp = () => {
      pointerDragging = false;
    };

    const onBlur = () => {
      leftHeld = false;
      rightHeld = false;
      fireHeld = false;
      pointerDragging = false;
    };

    const onVisibility = () => {
      if (!document.hidden) start();
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible) start();
    });
    const resizeObserver = new ResizeObserver(resize);

    canvas.addEventListener('keydown', onKey);
    canvas.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('gamepadconnected', onPadConnected);
    window.addEventListener('gamepaddisconnected', onPadDisconnected);
    // A pad already exposed before this mounted (e.g. pressed on an earlier page view).
    padConnected = Array.from(navigator.getGamepads?.() ?? []).some((p) => p && p.connected);

    observer.observe(canvas);
    resizeObserver.observe(canvas);
    resize();
    start();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      canvas.removeEventListener('keydown', onKey);
      canvas.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('gamepadconnected', onPadConnected);
      window.removeEventListener('gamepaddisconnected', onPadDisconnected);
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className={`hv-warp-container ${className || ''}`}>
      <canvas
        ref={canvasRef}
        tabIndex={0}
        aria-label="WARP 1983 arcade shooter. Rotate around the ring with Left and Right or A and D, and press Space or tap to fire toward the center. With a controller, point the stick or d-pad where the ship should go and press A to fire."
        className="hv-warp-canvas"
      />
      <span ref={liveRef} className="sr-only" aria-live="polite" />
    </div>
  );
}
