import { PALETTE, type Sprite } from './pixel';

export const EXTRA_PALETTE: Record<string, string> = {
  ...PALETTE,
  B: '#84cdfa', // retro neon arcade blue
  g: '#4ade80', // retro green
  o: '#fb923c', // retro orange
  k: '#1a1a24', // retro dark panel
  m: '#6b7280', // retro gray
};

// Renders a sprite using either PALETTE or an extended palette.
export function spriteCanvasCustom(
  sprite: Sprite,
  palette: Record<string, string> = EXTRA_PALETTE,
  flip = false
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = sprite[0].length;
  canvas.height = sprite.length;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  sprite.forEach((row, y) => {
    Array.from(row).forEach((key, x) => {
      const colour = palette[key];
      if (!colour) return;
      ctx.fillStyle = colour;
      ctx.fillRect(flip ? canvas.width - 1 - x : x, y, 1, 1);
    });
  });
  return canvas;
}

// 8x10 Speech bubble with "!" inside
export const SPEECH_BUBBLE: Sprite = [
  '..eeeeee..',
  '.ewwwwwwse.',
  'ewwrreewwe',
  'ewwrreewwe',
  'ewwwwwwwwe',
  'ewwrreewwe',
  '.ewwwwwwse.',
  '..eeeee...',
  '....e.....',
  '..........',
];

// Squashed bug frame (flat splat with legs splayed out)
export const BUG_SQUASHED: Sprite = [
  'd........d',
  '.d.rrrr.d.',
  '..rrrrrr..',
  '.rrwrrwrr.',
  'd.rrrrrr.d',
  '.d.rrrr.d.',
  'd........d',
  '..........',
];

// "+10" floating score popup (11x5)
export const PLUS_TEN: Sprite = [
  '..y...y..yyy.',
  '.yyy.yy.y...y',
  '..y...y.y...y',
  '..y...y.y...y',
  '.....yyy.yyy.',
];

// 5x5 pixel sparkle
export const SPARKLE: Sprite = [
  '..w..',
  '.www.',
  'wwlww',
  '.www.',
  '..w..',
];

// Player defender ship (9x7)
export const SHIP: Sprite = [
  '....B....',
  '...BBB...',
  '...BBB...',
  '..BBBBB..',
  '.BBwBBwB.',
  'BBBBBBBBB',
  'BB.BBB.BB',
];

// 404 Invaders (6x5): Frame 1 & Frame 2
export const INVADER_FRAMES: readonly [Sprite, Sprite] = [
  [
    '.w..w.',
    '..ww..',
    '.wwww.',
    'ww..ww',
    'w.ww.w',
  ],
  [
    'w....w',
    '.w..w.',
    'wwwwww',
    '.wwww.',
    '..ww..',
  ],
];

// Breakout paddle (28x5)
export const PADDLE_SPRITE: Sprite = [
  '.tttttttttttttttttttttttttt.',
  'tttttttttttttttttttttttttttt',
  'ttTTTTTTTTTTTTTTTTTTTTTTTTtt',
  'tttttttttttttttttttttttttttt',
  '.tttttttttttttttttttttttttt.',
];
