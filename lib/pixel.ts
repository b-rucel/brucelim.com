// Pixel art drawn from code: sprites are string grids, one character per pixel.
// '.' is transparent; every other character maps to a colour in PALETTE.

export const PALETTE: Record<string, string> = {
  c: '#9b59b6', // cap
  C: '#7a3f96', // cap brim
  h: '#3a2a1e', // hair
  s: '#f3c9a3', // skin
  e: '#121212', // eye
  t: '#5ad1cd', // shirt
  T: '#3fa9a5', // shirt shade
  p: '#3d5fd1', // jeans
  b: '#f4f4f4', // sneakers
  r: '#ed6f5c', // bug body
  d: '#5a1f1a', // bug legs
  w: '#ffffff', // bug eye
  y: '#f5c542', // coin
  Y: '#c9922c', // coin shade
  l: '#fff3b0', // coin shine
};

export type Sprite = readonly string[];

const HEAD = [
  '....cccc....',
  '...cccccc...',
  '...ccccccCCC',
  '...hssssss..',
  '...hsssses..',
  '....ssssss..',
  '.....sss....',
];

export const RUNNER = {
  runA: [
    ...HEAD,
    '....tttttt..',
    '...ttttttts.',
    '..s.ttttT...',
    '....ttttT...',
    '....pppp....',
    '...pp..pp...',
    '..pp....pp..',
    '.bb......bb.',
    '............',
  ],
  runB: [
    ...HEAD,
    '....tttttt..',
    '....ttttt...',
    '....tttts...',
    '....ttttT...',
    '....pppp....',
    '....ppp.....',
    '....pp.p....',
    '...bbb.bb...',
    '............',
  ],
  jump: [
    ...HEAD,
    '...ttttttt..',
    '..s.tttttt.s',
    '....tttttT..',
    '....pppppp..',
    '...pp...pp..',
    '...bb...bb..',
    '............',
    '............',
    '............',
  ],
} satisfies Record<string, Sprite>;

export const BUG: readonly Sprite[] = [
  ['.d......d.', '..d....d..', '...rrrr...', '..rrrrrr..', '.rrwrrwrr.', '.rrrrrrrr.', '..rrrrrr..', '.d.d..d.d.'],
  ['.d......d.', '..d....d..', '...rrrr...', '..rrrrrr..', '.rrwrrwrr.', '.rrrrrrrr.', '..rrrrrr..', 'd.d....d.d'],
];

export const COIN: Sprite = [
  '..yyyy..',
  '.yllyyy.',
  'ylyyyyYy',
  'ylyyyyYy',
  'ylyyyyYy',
  'yyyyyyYy',
  '.yyyyYY.',
  '..YYYY..',
];

// Renders a sprite at one canvas pixel per sprite pixel. Scale it up with
// drawImage while imageSmoothingEnabled is false to keep the pixels crisp.
export function spriteCanvas(sprite: Sprite, flip = false): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = sprite[0].length;
  canvas.height = sprite.length;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  sprite.forEach((row, y) => {
    Array.from(row).forEach((key, x) => {
      const colour = PALETTE[key];
      if (!colour) return;
      ctx.fillStyle = colour;
      ctx.fillRect(flip ? canvas.width - 1 - x : x, y, 1, 1);
    });
  });
  return canvas;
}

// 3x5 pixel font for scores and short messages.
const FONT: Record<string, string> = {
  '0': '111101101101111', '1': '010110010010111', '2': '111001111100111', '3': '111001111001111',
  '4': '101101111001001', '5': '111100111001111', '6': '111100111101111', '7': '111001001001001',
  '8': '111101111101111', '9': '111101111001111',
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110',
  E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101',
  I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111',
  M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100',
  Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
  U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
  Y: '101101010010010', Z: '111001010100111',
  ' ': '000000000000000', '/': '001001010100100', ':': '000010000010000', '-': '000000111000000',
  '!': '010010010000010', '.': '000000000000010',
};

// Draws text in sprite-pixel units (each glyph is 3 wide, 1 unit apart). Returns the width.
export function drawPixelText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  colour: string,
  size = 1
): number {
  ctx.fillStyle = colour;
  let cursor = x;
  for (const char of text.toUpperCase()) {
    const glyph = FONT[char] ?? FONT[' '];
    for (let i = 0; i < 15; i++) {
      if (glyph[i] === '1') ctx.fillRect(cursor + (i % 3) * size, y + Math.floor(i / 3) * size, size, size);
    }
    cursor += 4 * size;
  }
  return cursor - x - size;
}

export const pixelTextWidth = (text: string, size = 1) => text.length * 4 * size - size;

const HEAD_BLINK = [
  '....cccc....',
  '...cccccc...',
  '...ccccccCCC',
  '...hssssss..',
  '...hsssees..',
  '....ssssss..',
  '.....sss....',
];

export const RUNNER_IDLE: Sprite = [
  ...HEAD,
  '....tttttt..',
  '...ttttttts.',
  '..s.ttttT...',
  '....ttttT...',
  '....pppp....',
  '....pppp....',
  '....pppp....',
  '...bb..bb...',
  '............',
];

export const RUNNER_IDLE_BLINK: Sprite = [
  ...HEAD_BLINK,
  '....tttttt..',
  '...ttttttts.',
  '..s.ttttT...',
  '....ttttT...',
  '....pppp....',
  '....pppp....',
  '....pppp....',
  '...bb..bb...',
  '............',
];

export const RUNNER_WAVE: Sprite = [
  ...HEAD,
  '....tttttt..',
  '...ttttttss.',
  '...tttttts..',
  '....ttttT...',
  '....pppp....',
  '....pppp....',
  '....pppp....',
  '...bb..bb...',
  '............',
];

export const RUNNER_WAVE_B: Sprite = [
  ...HEAD,
  '....tttttts.',
  '...ttttttss.',
  '....ttttt...',
  '....pppp....',
  '....pppp....',
  '....pppp....',
  '...bb..bb...',
  '............',
  '............',
];

export const RUNNER_SLEEP: Sprite = [
  '.cccc.........',
  'cccccc........',
  'hssssss.......',
  'hssseess......',
  '.ssssss.......',
  '..ttttttttt...',
  '..ppppppppbbb.',
  '..............',
];

export const MUSHROOM: Sprite = [
  '..rrrr..',
  '.rrwwrr.',
  'rwwrrwwr',
  'rrrrrrrr',
  '..ssss..',
  '..ssss..',
  '..ssss..',
];

export const HEART: Sprite = [
  '.rr.rr.',
  'rwrrrrr',
  'rrrrrrr',
  '.rrrrr.',
  '..rrr..',
  '...r...',
];

export const FLAG: Sprite = [
  '.rrrrrrr..',
  '.rrrrrr...',
  '.rrrrr....',
  '.rrrr.....',
  '.rrr......',
  '.rr.......',
  '.w........',
  '.w........',
  '.w........',
  '.w........',
  '.w........',
  '.w........',
];

export const GRASS: Sprite = ['..t..', '.t.t.', 'ttttt'];

export const BUSH: Sprite = [
  '..tttt..',
  '.tttttt.',
  'tttttttt',
  'tttttttt',
  '.TTTTTT.',
];

export const FLAME: readonly Sprite[] = [
  ['..y.', '.yy.', '.yy.', '.ry.', '.rr.', '..r.'],
  ['..y.', '.yy.', '.yy.', '.ry.', '.rr.', '....'],
];
