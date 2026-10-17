(() => {
  'use strict';

  const HI_STORAGE_KEY = 'bl-sort-arena-hi-v1';
  const PROG_STORAGE_KEY = 'bl-sort-arena-prog-v2';
  const STARTING_CREDITS = 1000;
  const UNLOCK_HEAP_AT = 2000;
  const TACTIC_COST = 40;
  const LEVEL_SIZES = { 1: 16, 2: 32, 3: 64 };

  // Pixel palette & string-grid sprite renderer adapted from lib/pixel.ts
  const PALETTE = {
    c: '#5ad1cd',
    C: '#247373',
    h: '#c8f7f5',
    m: '#c48fff',
    M: '#623794',
    l: '#eed9ff',
    v: '#ff7e6b',
    V: '#8f3326',
    p: '#ffd4cc',
    g: '#6ce395',
    G: '#267347',
    k: '#d4fce2',
    w: '#f3f5f8',
    d: '#181b24',
    y: '#f5c542',
    Y: '#c9922c',
    s: '#fff3b0',
  };

  // 16x16 pixel-art fighter emblems for SELECT screen
  const PORTRAIT_SPRITES = [
    // 0: Quickblade — twin cyber-katana pivot crest
    [
      '.......hh.......',
      '......chhc......',
      '.....cchhcc.....',
      '....cc.hh.cc....',
      '...cc..hh..cc...',
      '..cc...hh...cc..',
      '.cc...chhc...cc.',
      'hhhhhhcwwchhhhhh',
      'CCCCCCCwwCCCCCCC',
      '.CC...chhc...CC.',
      '..CC...hh...CC..',
      '...CC..hh..CC...',
      '....CC.hh.CC....',
      '.....CChhCC.....',
      '......ChhC......',
      '.......CC.......',
    ],
    // 1: Mergetitan — interlocking twin-bus monolith helm
    [
      '..mmmm....mmmm..',
      '.mllllm..mllllm.',
      '.mlMMlm..mlMMlm.',
      '.mlMMlmmmmMMllm.',
      '.mllllllllllllm.',
      '..mmmmmmmmmmmm..',
      '...mllwwwwllm...',
      '..mllwddddwllm..',
      '..mllwddddwllm..',
      '...mllwwwwllm...',
      '..mmmmmmmmmmmm..',
      '.mlllMMMMMMlllm.',
      '.mlMMm....mMMlm.',
      '.mlMMm....mMMlm.',
      '..mmmm....mmmm..',
      '................',
    ],
    // 2: Vipershift — twin-fang register serpent emblem
    [
      '....vvvvvvvv....',
      '..vvppppppppvv..',
      '.vppvvvvvvvvppv.',
      '.vpvVVvvvvVVvpv.',
      'vpvVwwv..vwwVvpv',
      'vpvVwwv..vwwVvpv',
      'vpvvvvv..vvvvvpv',
      '.vppppvvvvppppv.',
      '..vvvvppppvvvv..',
      '...vv.wwww.vv...',
      '..vv..w..w..vv..',
      '..v...w..w...v..',
      '......w..w......',
      '.....vw..wv.....',
      '.....v....v.....',
      '................',
    ],
    // 3: Heapforge — binary pyramid crown & anvil
    [
      '......gggg......',
      '.....gkkkkgg....',
      '.....gkwwkg.....',
      '....ggkkkkgg....',
      '...gGGggggGGg...',
      '..gggg....gggg..',
      '.gkkkkg..gkkkkg.',
      '.gGGGGg..gGGGGg.',
      'gggggggggggggggg',
      'kkkkkkkkkkkkkkkk',
      '.GGGGGGGGGGGGGG.',
      '..gggg....gggg..',
      '.gkkkkg..gkkkkg.',
      '.gGGGGg..gGGGGg.',
      '..gggg....gggg..',
      '................',
    ],
  ];

  // 12x12 character runner sprites per fighter (runA, runB, win, lose)
  function makeRunnerSet(pri, hi, shd) {
    const mapTokens = (rows) =>
      rows.map((r) =>
        r
          .replace(/P/g, pri)
          .replace(/H/g, hi)
          .replace(/S/g, shd)
      );
    return {
      runA: buildSpriteCanvas(
        mapTokens([
          '....HHHH....',
          '...HPPPPw...',
          '...HPPPdw...',
          '....PPPP....',
          '..HHPPPPHH..',
          '.H.PPPPPP.H.',
          '....PPPP....',
          '...PP..PP...',
          '..PP....PP..',
          '.SS......SS.',
          '............',
          '............',
        ])
      ),
      runB: buildSpriteCanvas(
        mapTokens([
          '....HHHH....',
          '...HPPPPw...',
          '...HPPPdw...',
          '....PPPP....',
          '...HPPPP....',
          '..HHPPPPPH..',
          '....PPPP....',
          '....PPPP....',
          '...PP.PP....',
          '..SS...SS...',
          '............',
          '............',
        ])
      ),
      win: buildSpriteCanvas(
        mapTokens([
          '.H..HHHH..H.',
          'H..HPPPPw..H',
          'H..HPPPdw..H',
          '.H..PPPP..H.',
          '..HHPPPPHH..',
          '....PPPP....',
          '....PPPP....',
          '...PP..PP...',
          '..PP....PP..',
          '..SS....SS..',
          '............',
          '............',
        ])
      ),
      lose: buildSpriteCanvas(
        mapTokens([
          '............',
          '............',
          '....HHHH....',
          '...HPPPP....',
          '...HPPPdd...',
          '..SSPPPPSS..',
          '..SPPPPPPS..',
          '...PPPPPP...',
          '..SS....SS..',
          '.SS......SS.',
          '............',
          '............',
        ])
      ),
    };
  }

  const RUNNER_SPRITES = [
    makeRunnerSet('c', 'h', 'C'),
    makeRunnerSet('m', 'l', 'M'),
    makeRunnerSet('v', 'p', 'V'),
    makeRunnerSet('g', 'k', 'G'),
  ];

  // 8x8 pixel coin from lib/pixel.ts
  const COIN_SPRITE = [
    '..yyyy..',
    '.ysyyys.',
    'ysyyyyYy',
    'ysyyyyYy',
    'ysyyyyYy',
    'yyyyyyYy',
    '.yyyyYY.',
    '..YYYY..',
  ];

  function buildSpriteCanvas(sprite) {
    const c = document.createElement('canvas');
    c.width = sprite[0].length;
    c.height = sprite.length;
    const g = c.getContext('2d');
    if (!g) return c;
    for (let y = 0; y < sprite.length; y++) {
      const row = sprite[y];
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        if (ch === '.') continue;
        const col = PALETTE[ch];
        if (!col) continue;
        g.fillStyle = col;
        g.fillRect(x, y, 1, 1);
      }
    }
    return c;
  }

  const coinSpriteCanvas = buildSpriteCanvas(COIN_SPRITE);

  const FIGHTERS = [
    {
      id: 0,
      name: 'Quickblade',
      upper: 'QUICKBLADE',
      algo: 'Quick sort · Lomuto pivot',
      clockRate: 1.0,
      color: '#5ad1cd',
      colorHi: '#c8f7f5',
      gen: quickSortGen,
    },
    {
      id: 1,
      name: 'Mergetitan',
      upper: 'MERGETITAN',
      algo: 'Merge sort · bottom-up',
      clockRate: 1.08,
      color: '#c48fff',
      colorHi: '#eed9ff',
      gen: mergeSortGen,
    },
    {
      id: 2,
      name: 'Vipershift',
      upper: 'VIPERSHIFT',
      algo: 'Insertion sort · 2.25× clock',
      clockRate: 2.25,
      color: '#ff7e6b',
      colorHi: '#ffd4cc',
      gen: insertionSortGen,
    },
    {
      id: 3,
      name: 'Heapforge',
      upper: 'HEAPFORGE',
      algo: 'Heap sort · binary sift',
      clockRate: 1.18,
      color: '#6ce395',
      colorHi: '#d4fce2',
      gen: heapSortGen,
    },
  ];

  // 3x5 pixel bitmap font adapted from lib/pixel.ts
  const PIXEL_FONT = {
    '0': '111101101101111',
    '1': '010110010010111',
    '2': '111001111100111',
    '3': '111001111001111',
    '4': '101101111001001',
    '5': '111100111001111',
    '6': '111100111101111',
    '7': '111001001001001',
    '8': '111101111101111',
    '9': '111101111001111',
    A: '010101111101101',
    B: '110101110101110',
    C: '011100100100011',
    D: '110101101101110',
    E: '111100110100111',
    F: '111100110100100',
    G: '011100101101011',
    H: '101101111101101',
    I: '111010010010111',
    J: '001001001101010',
    K: '101101110101101',
    L: '100100100100111',
    M: '101111111101101',
    N: '110101101101101',
    O: '010101101101010',
    P: '110101110100100',
    Q: '010101101110011',
    R: '110101110101101',
    S: '011100010001110',
    T: '111010010010010',
    U: '101101101101111',
    V: '101101101101010',
    W: '101101111111101',
    X: '101101010101101',
    Y: '101101010010010',
    Z: '111001010100111',
    ' ': '000000000000000',
    '/': '001001010100100',
    ':': '000010000010000',
    '-': '000000111000000',
    '!': '010010010000010',
    '.': '000000000000010',
    '%': '101001010100101',
    '#': '010111010111010',
    '+': '000010111010000',
  };

  function drawPixelText(ctx, text, x, y, colour, size) {
    ctx.fillStyle = colour;
    let cursor = Math.round(x);
    const ry = Math.round(y);
    const upper = String(text).toUpperCase();
    for (let c = 0; c < upper.length; c++) {
      const glyph = PIXEL_FONT[upper[c]] || PIXEL_FONT[' '];
      for (let i = 0; i < 15; i++) {
        if (glyph[i] === '1') {
          ctx.fillRect(
            cursor + (i % 3) * size,
            ry + Math.floor(i / 3) * size,
            size,
            size
          );
        }
      }
      cursor += 4 * size;
    }
    return cursor - x - size;
  }

  function pixelTextWidth(text, size) {
    return String(text).length * 4 * size - size;
  }

  // Seeded deterministic PRNG (Mulberry32)
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function nextRand() {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Pure Generator 1: Quick Sort (Lomuto Partition)
  function* quickSortGen(input) {
    const arr = input.slice();

    function* sortRange(low, high) {
      if (low >= high) return;
      const pivotVal = arr[high];
      let i = low;
      for (let j = low; j < high; j++) {
        yield {
          type: 'compare',
          a: j,
          b: high,
          pivot: high,
          snapshot: arr.slice(),
        };
        if (arr[j] < pivotVal) {
          if (i !== j) {
            const tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
            yield {
              type: 'swap',
              a: i,
              b: j,
              pivot: high,
              snapshot: arr.slice(),
            };
          }
          i++;
        }
      }
      if (i !== high) {
        const tmp = arr[i];
        arr[i] = arr[high];
        arr[high] = tmp;
        yield {
          type: 'swap',
          a: i,
          b: high,
          pivot: i,
          snapshot: arr.slice(),
        };
      } else {
        yield {
          type: 'compare',
          a: i,
          b: high,
          pivot: i,
          snapshot: arr.slice(),
        };
      }
      yield* sortRange(low, i - 1);
      yield* sortRange(i + 1, high);
    }

    yield* sortRange(0, arr.length - 1);
    return arr;
  }

  // Pure Generator 2: Bottom-Up In-Place Merge Sort
  function* mergeSortGen(input) {
    const arr = input.slice();
    const n = arr.length;

    for (let width = 1; width < n; width *= 2) {
      for (let left = 0; left < n - width; left += width * 2) {
        let l = left;
        let mid = left + width - 1;
        let r = mid + 1;
        const right = Math.min(left + width * 2 - 1, n - 1);

        while (l <= mid && r <= right) {
          yield {
            type: 'compare',
            a: l,
            b: r,
            pivot: mid,
            snapshot: arr.slice(),
          };
          if (arr[l] <= arr[r]) {
            l++;
            if ((l - left) % 2 === 0) {
              yield {
                type: 'compare',
                a: Math.min(l, right),
                b: r,
                pivot: mid,
                snapshot: arr.slice(),
              };
            }
          } else {
            const val = arr[r];
            for (let k = r; k > l; k--) {
              arr[k] = arr[k - 1];
            }
            arr[l] = val;
            yield {
              type: 'swap',
              a: l,
              b: r,
              pivot: l,
              snapshot: arr.slice(),
            };
            l++;
            mid++;
            r++;
          }
        }
      }
    }
    return arr;
  }

  // Pure Generator 3: Insertion Sort
  function* insertionSortGen(input) {
    const arr = input.slice();
    const n = arr.length;

    for (let i = 1; i < n; i++) {
      let j = i;
      while (j > 0) {
        yield {
          type: 'compare',
          a: j - 1,
          b: j,
          pivot: i,
          snapshot: arr.slice(),
        };
        if (arr[j - 1] > arr[j]) {
          const tmp = arr[j - 1];
          arr[j - 1] = arr[j];
          arr[j] = tmp;
          yield {
            type: 'swap',
            a: j - 1,
            b: j,
            pivot: i,
            snapshot: arr.slice(),
          };
          j--;
        } else {
          break;
        }
      }
    }
    return arr;
  }

  // Pure Generator 4: Binary Max-Heap Sort (Unlocks at 2,000 CR)
  function* heapSortGen(input) {
    const arr = input.slice();
    const n = arr.length;

    function* siftDown(start, end) {
      let root = start;
      while (root * 2 + 1 <= end) {
        const child = root * 2 + 1;
        let swapIdx = root;

        yield {
          type: 'compare',
          a: swapIdx,
          b: child,
          pivot: end,
          snapshot: arr.slice(),
        };
        if (arr[swapIdx] < arr[child]) {
          swapIdx = child;
        }
        if (child + 1 <= end) {
          yield {
            type: 'compare',
            a: swapIdx,
            b: child + 1,
            pivot: end,
            snapshot: arr.slice(),
          };
          if (arr[swapIdx] < arr[child + 1]) {
            swapIdx = child + 1;
          }
        }
        if (swapIdx === root) {
          return;
        }
        const tmp = arr[root];
        arr[root] = arr[swapIdx];
        arr[swapIdx] = tmp;
        yield {
          type: 'swap',
          a: root,
          b: swapIdx,
          pivot: end,
          snapshot: arr.slice(),
        };
        root = swapIdx;
      }
    }

    for (let start = Math.floor((n - 2) / 2); start >= 0; start--) {
      yield* siftDown(start, n - 1);
    }
    for (let end = n - 1; end > 0; end--) {
      const tmp = arr[end];
      arr[end] = arr[0];
      arr[0] = tmp;
      yield {
        type: 'swap',
        a: 0,
        b: end,
        pivot: end,
        snapshot: arr.slice(),
      };
      yield* siftDown(0, end - 1);
    }
    return arr;
  }

  function generateArray(seed, powerMode, barCount) {
    const rng = mulberry32(seed);
    const arr = Array.from({ length: barCount }, (_, i) => i + 1);

    if (powerMode === 'nearly') {
      const localSwaps = Math.max(2, Math.floor(barCount / 6));
      for (let s = 0; s < localSwaps; s++) {
        const idx = Math.floor(rng() * (barCount - 2));
        const span = 1 + Math.floor(rng() * 2);
        const target = Math.min(barCount - 1, idx + span);
        const tmp = arr[idx];
        arr[idx] = arr[target];
        arr[target] = tmp;
      }
      return arr;
    }

    if (powerMode === 'reverse') {
      arr.reverse();
      const jitterSwaps = Math.max(2, Math.floor(barCount / 8));
      for (let s = 0; s < jitterSwaps; s++) {
        const idx = Math.floor(rng() * (barCount - 3));
        const span = 1 + Math.floor(rng() * 2);
        const tmp = arr[idx];
        arr[idx] = arr[idx + span];
        arr[idx + span] = tmp;
      }
      return arr;
    }

    for (let i = barCount - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function analyzeArrayAndOdds(arr, powerMode) {
    let inversions = 0;
    const n = arr.length;
    const maxInversions = (n * (n - 1)) / 2;

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (arr[i] > arr[j]) inversions++;
      }
    }

    const invRatio = inversions / maxInversions;
    const tailVal = arr[n - 1];
    const pivotExtremity = Math.abs(tailVal - (n + 1) / 2) / (n / 2);

    const estQuickOps = Math.round(
      n * Math.log2(n) * (0.96 + 1.45 * Math.abs(invRatio - 0.5) + 0.32 * pivotExtremity)
    );
    const estMergeOps = Math.round(n * Math.log2(n) * (1.06 + 0.18 * invRatio));
    const estInsertOps = Math.round(n + inversions * 1.92);
    const estHeapOps = Math.round(n * Math.log2(n) * 1.24);

    const estOps = [estQuickOps, estMergeOps, estInsertOps, estHeapOps];
    const effectiveCycles = estOps.map((ops, idx) => ops / FIGHTERS[idx].clockRate);

    const weights = effectiveCycles.map((cyc) => Math.pow(120 / Math.max(20, cyc), 2.3));
    const weightSum = weights[0] + weights[1] + weights[2];

    const odds = weights.map((w, idx) => {
      const denom = idx === 3 ? weightSum - weights[2] + weights[3] : weightSum;
      const prob = w / denom;
      const raw = 0.92 / prob;
      return Math.max(1.2, Math.min(6.5, Math.round(raw * 10) / 10));
    });

    const modeLabel =
      powerMode === 'nearly'
        ? 'Nearly sorted'
        : powerMode === 'reverse'
          ? 'Reverse trap'
          : 'Random shuffle';

    return {
      inversions,
      estOps,
      odds,
      modeLabel,
    };
  }

  // Optional Web Audio Synthesizer (OFF by default, initialized only on user click)
  const sfx = {
    enabled: false,
    ctx: null,
    lastTickAt: 0,
    toggle() {
      this.enabled = !this.enabled;
      if (this.enabled && !this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended' && this.enabled) {
        this.ctx.resume();
      }
      if (this.enabled) {
        this.playTone(660, 0.05, 'square', 0.04);
      }
      return this.enabled;
    },
    playTone(freq, duration, type, gainVal) {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type || 'square';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(gainVal || 0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + duration);
      } catch (_err) {
        // Ignore audio errors
      }
    },
    playStep(barVal, barCount, isSwap) {
      if (!this.enabled || !this.ctx) return;
      const nowMs = performance.now();
      if (nowMs - this.lastTickAt < 46) return;
      this.lastTickAt = nowMs;
      const freq = 220 + (barVal / barCount) * 480;
      this.playTone(
        freq,
        isSwap ? 0.035 : 0.02,
        isSwap ? 'square' : 'triangle',
        isSwap ? 0.028 : 0.015
      );
    },
    playCountdown(isGo) {
      this.playTone(isGo ? 880 : 440, isGo ? 0.14 : 0.07, 'square', 0.05);
    },
    playTactic(isBoost) {
      this.playTone(isBoost ? 740 : 260, 0.09, 'sawtooth', 0.05);
    },
    playHitStop() {
      this.playTone(180, 0.09, 'sawtooth', 0.06);
      this.playTone(720, 0.08, 'square', 0.04);
    },
    playFinish(wonBet) {
      if (!this.enabled || !this.ctx) return;
      const notes = wonBet ? [523.25, 659.25, 783.99, 1046.5] : [330, 277.18, 220];
      notes.forEach((n, idx) => {
        setTimeout(() => {
          this.playTone(n, 0.11, 'square', 0.045);
        }, idx * 75);
      });
    },
  };

  // DOM References
  const stage = document.getElementById('stage');
  const sceneSelect = document.getElementById('sceneSelect');
  const scenePlay = document.getElementById('scenePlay');
  const sceneGameOver = document.getElementById('sceneGameOver');

  const hudLevel = document.getElementById('hudLevel');
  const hudWager = document.getElementById('hudWager');
  const hudFighter = document.getElementById('hudFighter');
  const hudSeed = document.getElementById('hudSeed');
  const hudCredits = document.getElementById('hudCredits');
  const hudMult = document.getElementById('hudMult');
  const hudPips = Array.from(document.querySelectorAll('#hudPips i'));

  const helpBtn = document.getElementById('helpBtn');
  const helpDialog = document.getElementById('helpDialog');
  const helpClose = document.getElementById('helpClose');
  const sfxBtn = document.getElementById('sfxBtn');
  const sfxState = document.getElementById('sfxState');
  const resetBankBtn = document.getElementById('resetBankBtn');

  const levelPills = Array.from(document.querySelectorAll('.level-pill[data-level]'));
  const seedVal = document.getElementById('seedVal');
  const seedMode = document.getElementById('seedMode');
  const seedInv = document.getElementById('seedInv');
  const rerollBtn = document.getElementById('rerollBtn');

  const fighterBtns = [
    document.getElementById('fighter0'),
    document.getElementById('fighter1'),
    document.getElementById('fighter2'),
    document.getElementById('fighter3'),
  ];
  const key3 = document.getElementById('key3');
  const flavor3 = document.getElementById('flavor3');
  const portraitCanvases = Array.from(document.querySelectorAll('.fighter-portrait'));
  const oddsNodes = [
    document.getElementById('odds0'),
    document.getElementById('odds1'),
    document.getElementById('odds2'),
    document.getElementById('odds3'),
  ];
  const estNodes = [
    document.getElementById('est0'),
    document.getElementById('est1'),
    document.getElementById('est2'),
    document.getElementById('est3'),
  ];

  const chipBtns = Array.from(document.querySelectorAll('.chip[data-wager]'));
  const modNearly = document.getElementById('modNearly');
  const modReverse = document.getElementById('modReverse');
  const selectPayout = document.getElementById('selectPayout');
  const startBtn = document.getElementById('startBtn');

  const boostBtn = document.getElementById('boostBtn');
  const boostState = document.getElementById('boostState');
  const jamBtn = document.getElementById('jamBtn');
  const jamState = document.getElementById('jamState');

  const laneArticles = [
    document.getElementById('lane0'),
    document.getElementById('lane1'),
    document.getElementById('lane2'),
  ];
  const laneNames = [
    document.getElementById('laneName0'),
    document.getElementById('laneName1'),
    document.getElementById('laneName2'),
  ];
  const laneFxNodes = [
    document.getElementById('laneFx0'),
    document.getElementById('laneFx1'),
    document.getElementById('laneFx2'),
  ];
  const posNodes = [
    document.getElementById('pos0'),
    document.getElementById('pos1'),
    document.getElementById('pos2'),
  ];
  const opsNodes = [
    document.getElementById('ops0'),
    document.getElementById('ops1'),
    document.getElementById('ops2'),
  ];
  const splitNodes = [
    document.getElementById('split0'),
    document.getElementById('split1'),
    document.getElementById('split2'),
  ];
  const rateNodes = [
    document.getElementById('rate0'),
    document.getElementById('rate1'),
    document.getElementById('rate2'),
  ];
  const gaugeSegs = [
    Array.from(document.querySelectorAll('#gauge0 i')),
    Array.from(document.querySelectorAll('#gauge1 i')),
    Array.from(document.querySelectorAll('#gauge2 i')),
  ];
  const canvases = [
    document.getElementById('canvas0'),
    document.getElementById('canvas1'),
    document.getElementById('canvas2'),
  ];
  const ctxs = canvases.map((c) => c.getContext('2d'));

  const countdown = document.getElementById('countdown');
  const countdownNum = document.getElementById('countdownNum');

  const resultPanel = document.getElementById('resultPanel');
  const resultKicker = document.getElementById('resultKicker');
  const resultHead = document.getElementById('resultHead');
  const resultSub = document.getElementById('resultSub');
  const resultPayout = document.getElementById('resultPayout');
  const resultBalance = document.getElementById('resultBalance');
  const resultMult = document.getElementById('resultMult');
  const resultMeter = Array.from(document.querySelectorAll('#resultMeter i'));
  const scoreList = document.getElementById('scoreList');
  const nextBtn = document.getElementById('nextBtn');

  const gameOverSub = document.getElementById('gameOverSub');
  const continueCount = document.getElementById('continueCount');
  const continueBtn = document.getElementById('continueBtn');

  const fxCanvas = document.getElementById('fxCanvas');
  const fxCtx = fxCanvas.getContext('2d');
  const srLive = document.getElementById('srLive');

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reducedMotion = reducedMotionQuery.matches;
  reducedMotionQuery.addEventListener('change', (e) => {
    reducedMotion = e.matches;
  });

  // Render 16x16 pixel portraits onto the 4 fighter select cards
  portraitCanvases.forEach((canvas, idx) => {
    const sprite = PORTRAIT_SPRITES[idx];
    if (!sprite) return;
    const src = buildSpriteCanvas(sprite);
    const g = canvas.getContext('2d');
    if (!g) return;
    g.imageSmoothingEnabled = false;
    g.clearRect(0, 0, canvas.width, canvas.height);
    g.drawImage(src, 0, 0);
  });

  // Cached canvas viewports (updated via ResizeObserver, zero layout reads in rAF)
  const viewports = [
    { w: 360, h: 420, dpr: 1 },
    { w: 360, h: 420, dpr: 1 },
    { w: 360, h: 420, dpr: 1 },
  ];
  const fxViewport = { w: 1440, h: 900, dpr: 1 };

  const state = {
    scene: 'select', // 'select' | 'race' | 'result' | 'gameover'
    phase: 'idle', // 'idle' | 'countdown' | 'racing' | 'hitstop' | 'finish' | 'gameover'
    level: 1, // 1 (N=16) | 2 (N=32) | 3 (N=64)
    unlockedHeap: false,
    seed: 409,
    powerMode: 'none', // 'none' | 'nearly' | 'reverse'
    selectedFighter: 0,
    activeLineup: [0, 1, 2], // 3 fighter IDs racing in lanes 0..2
    wagerMode: '100',
    lockedWager: 100,
    raceSpend: 0,
    movesUsed: 0,
    boostUsed: false,
    jamUsed: false,
    credits: STARTING_CREDITS,
    displayCredits: STARTING_CREDITS,
    creditAnimFrom: STARTING_CREDITS,
    creditAnimTo: STARTING_CREDITS,
    creditAnimT: 1,
    payoutAnimTo: 0,
    payoutSign: '+',
    streak: 0,
    baseArray: [],
    odds: [2.5, 2.3, 3.1, 2.4],
    estOps: [72, 76, 135, 84],
    countdownTimer: 0,
    countdownStep: 3,
    hitStopTimer: 0,
    shakeTimer: 0,
    shakeStep: 0,
    continueTimer: 9,
    finishOrder: [],
    winnerLaneIdx: -1,
    lanes: [],
    coins: [],
    highScores: [],
  };

  function announce(msg) {
    if (srLive) srLive.textContent = msg;
  }

  function loadProgression() {
    try {
      const raw = localStorage.getItem(PROG_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        if (parsed.level === 1 || parsed.level === 2 || parsed.level === 3) {
          state.level = parsed.level;
        }
        if (parsed.unlockedHeap === true) {
          state.unlockedHeap = true;
        }
      }
    } catch (_e) {
      // Storage unavailable
    }
  }

  function saveProgression() {
    try {
      localStorage.setItem(
        PROG_STORAGE_KEY,
        JSON.stringify({
          level: state.level,
          unlockedHeap: state.unlockedHeap,
        })
      );
    } catch (_e) {
      // Ignore storage write errors
    }
  }

  function loadHighScores() {
    const fallback = [
      { fighter: 'QUICKBLADE', seed: 104, payout: 1850 },
      { fighter: 'VIPERSHIFT', seed: 712, payout: 1520 },
      { fighter: 'MERGETITAN', seed: 308, payout: 1280 },
    ];
    try {
      const raw = localStorage.getItem(HI_STORAGE_KEY);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(0, 4);
    } catch (_e) {
      // Storage unavailable
    }
    return fallback;
  }

  function saveHighScore(fighterName, seedNum, balanceAfter) {
    state.highScores.push({
      fighter: fighterName,
      seed: seedNum,
      payout: Math.round(balanceAfter),
    });
    state.highScores.sort((a, b) => b.payout - a.payout);
    state.highScores = state.highScores.slice(0, 4);
    try {
      localStorage.setItem(HI_STORAGE_KEY, JSON.stringify(state.highScores));
    } catch (_e) {
      // Ignore storage write errors
    }
    renderHighScores();
  }

  function renderHighScores() {
    while (scoreList.firstChild) {
      scoreList.removeChild(scoreList.firstChild);
    }
    state.highScores.slice(0, 4).forEach((entry, idx) => {
      const li = document.createElement('li');
      li.className = 'score-row';

      const rank = document.createElement('span');
      rank.className = 'score-rank';
      rank.textContent = '#' + String(idx + 1).padStart(2, '0');

      const name = document.createElement('span');
      name.className = 'score-name';
      name.textContent =
        entry.fighter + ' · #' + String(entry.seed).padStart(4, '0');

      const val = document.createElement('span');
      val.className = 'score-val money';
      val.textContent = entry.payout.toLocaleString('en-US') + ' CR';

      li.appendChild(rank);
      li.appendChild(name);
      li.appendChild(val);
      scoreList.appendChild(li);
    });
  }

  function getBarCount() {
    return LEVEL_SIZES[state.level] || 16;
  }

  function getStreakMultiplier() {
    return 1 + Math.min(4, state.streak) * 0.25;
  }

  function getActiveWager() {
    if (state.wagerMode === 'max') {
      return Math.max(10, state.credits);
    }
    const numeric = Number(state.wagerMode) || 100;
    return Math.min(Math.max(10, state.credits), numeric);
  }

  function getEffectiveFighterOdds(fighterId) {
    const base = state.odds[fighterId] || 2.0;
    return Math.max(1.1, Math.round((base - state.movesUsed * 0.2) * 10) / 10);
  }

  function setScene(nextScene) {
    state.scene = nextScene;
    stage.dataset.scene = nextScene;

    const allScenes = [
      { el: sceneSelect, match: nextScene === 'select' },
      { el: scenePlay, match: nextScene === 'race' || nextScene === 'result' },
      { el: sceneGameOver, match: nextScene === 'gameover' },
    ];

    allScenes.forEach(({ el, match }) => {
      if (match) {
        el.dataset.state = 'active';
        el.removeAttribute('inert');
      } else {
        el.dataset.state = 'idle';
        el.setAttribute('inert', '');
      }
    });

    if (nextScene === 'race') {
      scenePlay.dataset.mode = 'race';
    } else if (nextScene === 'result') {
      scenePlay.dataset.mode = 'result';
    }
    requestTick();
  }

  function createLaneRuntime(laneSlot, fighterId, initialArr) {
    const fighter = FIGHTERS[fighterId];
    const bars = initialArr.map((val) => ({
      val,
      visualVal: val,
      yOffset: 0,
      yVel: 0,
      heat: 0,
      locked: false,
      peakHold: val,
    }));

    return {
      slot: laneSlot,
      fighterId,
      fighter,
      generator: fighter.gen(initialArr),
      bars,
      stepBudget: 0,
      compares: 0,
      swaps: 0,
      totalOps: 0,
      opsRateSmoothed: 0,
      activeA: -1,
      activeB: -1,
      pivotIdx: -1,
      boostTimer: 0,
      jamTimer: 0,
      runnerX: 0,
      finished: false,
      rank: 0,
      livePos: 0,
      sweepProgress: 0,
    };
  }

  function setLaneBadge(laneSlot, posNum, labelText) {
    const node = posNodes[laneSlot];
    const lane = state.lanes[laneSlot];
    if (!node || !lane) return;
    if (lane.livePos !== posNum || node.textContent !== labelText) {
      lane.livePos = posNum;
      node.dataset.pos = String(posNum);
      node.textContent = labelText;
      node.dataset.flip = node.dataset.flip === 'a' ? 'b' : 'a';
    }
  }

  function setupSeedAndLanes() {
    const barCount = getBarCount();
    state.baseArray = generateArray(state.seed, state.powerMode, barCount);
    const analysis = analyzeArrayAndOdds(state.baseArray, state.powerMode);
    state.odds = analysis.odds;
    state.estOps = analysis.estOps;
    state.finishOrder = [];
    state.winnerLaneIdx = -1;
    state.raceSpend = 0;
    state.movesUsed = 0;
    state.boostUsed = false;
    state.jamUsed = false;

    const seedText = '#' + String(state.seed).padStart(4, '0');
    seedVal.textContent = seedText;
    hudSeed.textContent = seedText;
    seedMode.textContent = analysis.modeLabel;
    seedInv.textContent = analysis.inversions + ' inversions';

    // Determine 3 active fighters for the 3 race lanes
    if (state.selectedFighter === 3) {
      state.activeLineup = [0, 1, 3];
    } else if (state.unlockedHeap && state.level === 3 && state.selectedFighter !== 2) {
      state.activeLineup = [0, 1, 3];
    } else {
      state.activeLineup = [0, 1, 2];
    }

    state.lanes = state.activeLineup.map((fId, slot) =>
      createLaneRuntime(slot, fId, state.baseArray)
    );

    for (let i = 0; i < 4; i++) {
      oddsNodes[i].textContent = state.odds[i].toFixed(1);
      if (i === 3 && !state.unlockedHeap) {
        estNodes[i].textContent = 'Reach 2,000 CR to unlock';
      } else {
        estNodes[i].textContent = '~' + state.estOps[i] + ' ops expected';
      }
    }

    for (let slot = 0; slot < 3; slot++) {
      const lane = state.lanes[slot];
      laneArticles[slot].dataset.state = 'run';
      laneArticles[slot].dataset.fighter = String(lane.fighterId);
      laneNames[slot].textContent = lane.fighter.name;
      laneFxNodes[slot].textContent = '';
      laneFxNodes[slot].removeAttribute('data-fx');
      posNodes[slot].dataset.pos = '0';
      posNodes[slot].textContent = state.odds[lane.fighterId].toFixed(1) + '×';
      updateLaneTelemetryDOM(lane);
    }

    syncHudAndControls();
    requestTick();
  }

  function syncHudAndControls() {
    if (state.credits >= UNLOCK_HEAP_AT && !state.unlockedHeap) {
      state.unlockedHeap = true;
      saveProgression();
      announce('Unlocked 4th fighter: Heapforge!');
    }

    const barCount = getBarCount();
    hudLevel.textContent = 'LVL ' + state.level + ' · N=' + barCount;
    levelPills.forEach((pill) => {
      pill.setAttribute(
        'aria-pressed',
        String(Number(pill.dataset.level) === state.level)
      );
    });

    fighterBtns[3].dataset.locked = state.unlockedHeap ? 'false' : 'true';
    key3.textContent = state.unlockedHeap ? '4' : 'LOCK';
    flavor3.textContent = state.unlockedHeap
      ? 'Sifts the binary heap in steady O(n log n).'
      : 'Unlocks at 2,000 CR. Crushes worst-case traps.';
    if (state.unlockedHeap) {
      estNodes[3].textContent = '~' + state.estOps[3] + ' ops expected';
    }

    const wager = state.phase === 'idle' ? getActiveWager() : state.lockedWager;
    const mult = getStreakMultiplier();
    const effOdds = getEffectiveFighterOdds(state.selectedFighter);
    const estPayout = Math.round(wager * effOdds * mult);
    const multStr =
      mult % 1 === 0 ? '×' + mult.toFixed(1) : '×' + mult.toFixed(2).replace(/0$/, '');

    hudCredits.textContent = Math.round(state.displayCredits).toLocaleString('en-US');
    hudWager.textContent =
      (wager + state.raceSpend).toLocaleString('en-US') + ' CR';
    hudFighter.textContent = FIGHTERS[state.selectedFighter].name;
    hudFighter.style.color = FIGHTERS[state.selectedFighter].color;
    hudMult.textContent = multStr;
    resultMult.textContent = multStr;
    selectPayout.textContent = estPayout.toLocaleString('en-US') + ' CR';

    for (let i = 0; i < 4; i++) {
      const lit = i < state.streak ? 'true' : 'false';
      if (hudPips[i]) hudPips[i].dataset.lit = lit;
      if (resultMeter[i]) resultMeter[i].dataset.lit = lit;
    }

    for (let i = 0; i < 4; i++) {
      const picked = i === state.selectedFighter;
      fighterBtns[i].setAttribute('aria-pressed', String(picked));
    }

    for (let slot = 0; slot < 3; slot++) {
      const lane = state.lanes[slot];
      if (!lane) continue;
      const isPlayerLane = lane.fighterId === state.selectedFighter;
      laneArticles[slot].dataset.bet = String(isPlayerLane);
    }

    chipBtns.forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.wager === state.wagerMode));
    });

    modNearly.setAttribute('aria-pressed', String(state.powerMode === 'nearly'));
    modReverse.setAttribute('aria-pressed', String(state.powerMode === 'reverse'));

    // Sync mid-race Boost & Jam buttons
    const playerLane = state.lanes.find((l) => l.fighterId === state.selectedFighter);
    const boostedNow = playerLane && playerLane.boostTimer > 0;
    const jammedLane = state.lanes.find((l) => l.jamTimer > 0);
    const canAfford = state.credits >= TACTIC_COST && state.phase === 'racing';

    if (boostedNow) {
      boostBtn.dataset.state = 'active';
      boostBtn.disabled = true;
      boostState.textContent = playerLane.boostTimer.toFixed(1) + 's';
    } else if (state.boostUsed) {
      boostBtn.dataset.state = 'used';
      boostBtn.disabled = true;
      boostState.textContent = 'USED';
    } else {
      boostBtn.dataset.state = 'ready';
      boostBtn.disabled = !canAfford;
      boostState.textContent = TACTIC_COST + ' CR';
    }

    if (jammedLane) {
      jamBtn.dataset.state = 'active';
      jamBtn.disabled = true;
      jamState.textContent = jammedLane.jamTimer.toFixed(1) + 's';
    } else if (state.jamUsed) {
      jamBtn.dataset.state = 'used';
      jamBtn.disabled = true;
      jamState.textContent = 'USED';
    } else {
      jamBtn.dataset.state = 'ready';
      jamBtn.disabled = !canAfford;
      jamState.textContent = TACTIC_COST + ' CR';
    }
  }

  function updateLaneTelemetryDOM(lane) {
    const slot = lane.slot;
    opsNodes[slot].textContent = String(lane.totalOps);
    splitNodes[slot].textContent =
      lane.compares + ' cmp · ' + lane.swaps + ' swp';

    const rate = Math.round(lane.opsRateSmoothed);
    rateNodes[slot].textContent = rate + '/s';
    const litCount = Math.min(8, Math.ceil((rate / 180) * 8));
    const segs = gaugeSegs[slot];
    for (let s = 0; s < segs.length; s++) {
      segs[s].dataset.on = s < litCount ? 'true' : 'false';
    }

    if (lane.boostTimer > 0) {
      laneFxNodes[slot].dataset.fx = 'boost';
      laneFxNodes[slot].textContent = 'BOOST 2×';
    } else if (lane.jamTimer > 0) {
      laneFxNodes[slot].dataset.fx = 'jam';
      laneFxNodes[slot].textContent = 'JAMMED';
    } else {
      laneFxNodes[slot].textContent = '';
      laneFxNodes[slot].removeAttribute('data-fx');
    }
  }

  function getLaneProgress(lane) {
    if (lane.finished) return 1;
    const barCount = lane.bars.length;
    const sorted = countSortedAdjacent(lane.bars) / Math.max(1, barCount - 1);
    const estProg = Math.min(
      0.96,
      lane.totalOps / Math.max(30, state.estOps[lane.fighterId])
    );
    return Math.min(0.98, sorted * 0.65 + estProg * 0.35);
  }

  function updateLivePositions() {
    const scores = state.lanes.map((lane) => {
      if (lane.finished) {
        return { slot: lane.slot, score: 1000 - lane.rank * 100 };
      }
      return { slot: lane.slot, score: getLaneProgress(lane) };
    });
    scores.sort((a, b) => b.score - a.score);
    const labels = ['1ST', '2ND', '3RD'];
    scores.forEach((item, idx) => {
      const lane = state.lanes[item.slot];
      const rankNum = lane.finished ? lane.rank : idx + 1;
      setLaneBadge(item.slot, rankNum, labels[rankNum - 1]);
    });
  }

  function triggerBoost() {
    if (state.phase !== 'racing' || state.boostUsed || state.credits < TACTIC_COST) {
      return;
    }
    const playerLane = state.lanes.find((l) => l.fighterId === state.selectedFighter);
    if (!playerLane || playerLane.finished) return;

    state.boostUsed = true;
    state.movesUsed++;
    state.raceSpend += TACTIC_COST;
    state.credits -= TACTIC_COST;
    state.displayCredits = state.credits;
    playerLane.boostTimer = 2.0;

    sfx.playTactic(true);
    syncHudAndControls();
    updateLaneTelemetryDOM(playerLane);
    announce('Activated Boost 2x on ' + playerLane.fighter.name + ' for 40 CR.');
  }

  function triggerJam() {
    if (state.phase !== 'racing' || state.jamUsed || state.credits < TACTIC_COST) {
      return;
    }
    const rivals = state.lanes.filter(
      (l) => l.fighterId !== state.selectedFighter && !l.finished
    );
    if (rivals.length === 0) return;

    rivals.sort((a, b) => getLaneProgress(b) - getLaneProgress(a));
    const target = rivals[0];

    state.jamUsed = true;
    state.movesUsed++;
    state.raceSpend += TACTIC_COST;
    state.credits -= TACTIC_COST;
    state.displayCredits = state.credits;
    target.jamTimer = 1.5;

    sfx.playTactic(false);
    syncHudAndControls();
    updateLaneTelemetryDOM(target);
    announce('Jammed rival ' + target.fighter.name + ' for 1.5 seconds.');
  }

  function startCreditCountUp(targetCredits, payoutDelta, signStr) {
    state.creditAnimFrom = state.displayCredits;
    state.creditAnimTo = targetCredits;
    state.credits = targetCredits;
    state.payoutAnimTo = Math.abs(payoutDelta || 0);
    state.payoutSign = signStr || '+';
    state.creditAnimT = reducedMotion ? 1 : 0;

    if (reducedMotion) {
      state.displayCredits = targetCredits;
      hudCredits.textContent = Math.round(targetCredits).toLocaleString('en-US');
      resultBalance.textContent = Math.round(targetCredits).toLocaleString('en-US') + ' CR';
      resultPayout.textContent =
        state.payoutSign + state.payoutAnimTo.toLocaleString('en-US');
    }
  }

  function spawnCoinBurst() {
    if (reducedMotion) return;
    const count = 26;
    const originX = fxViewport.w * 0.72;
    const originY = fxViewport.h * 0.44;
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI * 0.85 + Math.random() * Math.PI * 0.7;
      const speed = 220 + Math.random() * 420;
      state.coins.push({
        x: originX + (Math.random() - 0.5) * 60,
        y: originY + (Math.random() - 0.5) * 24,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 140,
        size: 16 + Math.floor(Math.random() * 2) * 8,
        life: 0.9 + Math.random() * 0.45,
        age: 0,
      });
    }
  }

  function triggerCountdownNumber(text, kind) {
    countdown.dataset.on = 'true';
    countdown.dataset.kind = kind || 'num';
    countdownNum.textContent = text;
    countdownNum.dataset.beat = countdownNum.dataset.beat === 'a' ? 'b' : 'a';
  }

  function triggerRoundStart() {
    if (
      state.phase === 'countdown' ||
      state.phase === 'racing' ||
      state.phase === 'hitstop'
    ) {
      return;
    }

    setupSeedAndLanes();

    const wager = getActiveWager();
    state.lockedWager = wager;
    startCreditCountUp(state.credits - wager, wager, '-');

    for (let slot = 0; slot < 3; slot++) {
      laneArticles[slot].dataset.state = 'run';
    }

    setScene('race');

    if (reducedMotion) {
      beginRacePhase();
      return;
    }

    state.phase = 'countdown';
    state.countdownStep = 3;
    state.countdownTimer = 0.34;
    triggerCountdownNumber('3', 'num');
    sfx.playCountdown(false);
    syncHudAndControls();
    requestTick();
  }

  function beginRacePhase() {
    state.phase = 'racing';
    countdown.dataset.on = 'false';
    updateLivePositions();
    syncHudAndControls();
    announce('Sorting race started.');
    requestTick();
  }

  function enterGameOverScene(winnerFighter) {
    state.phase = 'gameover';
    state.continueTimer = 9.99;
    continueCount.textContent = '9';
    gameOverSub.textContent =
      winnerFighter.name +
      ' took 1st and wiped out your remaining credits.';
    setScene('gameover');
    continueBtn.focus({ preventScroll: true });
    announce('Game over. 0 credits remaining. Press Space to continue.');
    requestTick();
  }

  function triggerContinueFromGameOver() {
    state.streak = 0;
    state.level = 1;
    saveProgression();
    startCreditCountUp(STARTING_CREDITS, 0, '+');
    state.seed = ((state.seed * 1664525 + 1013904223) % 9000) + 100;
    state.phase = 'idle';
    setupSeedAndLanes();
    setScene('select');
    startBtn.focus({ preventScroll: true });
    announce('Continued with 1,000 credits.');
  }

  function resolveRaceFinish() {
    state.phase = 'finish';
    countdown.dataset.on = 'false';

    const winLane = state.lanes[state.winnerLaneIdx];
    const winner = winLane.fighter;
    const playerLane = state.lanes.find((l) => l.fighterId === state.selectedFighter);
    const playerWon = winLane.fighterId === state.selectedFighter;
    const wager = state.lockedWager || 100;
    const totalOutlay = wager + state.raceSpend;

    for (let slot = 0; slot < 3; slot++) {
      const isWin = slot === state.winnerLaneIdx;
      laneArticles[slot].dataset.state = isWin ? 'winner' : 'loser';
    }

    resultKicker.textContent =
      winner.name + ' finishes 1st in ' + winLane.totalOps + ' ops';

    if (playerWon) {
      const mult = getStreakMultiplier();
      const effOdds = getEffectiveFighterOdds(state.selectedFighter);
      const payout = Math.round(wager * effOdds * mult);
      state.streak = Math.min(4, state.streak + 1);
      const nextCredits = state.credits + payout;

      // Advance level N=16 -> 32 -> 64 on win
      const prevLevel = state.level;
      if (state.level < 3) {
        state.level++;
      }
      if (nextCredits >= UNLOCK_HEAP_AT) {
        state.unlockedHeap = true;
      }
      saveProgression();

      resultPanel.dataset.outcome = 'win';
      resultHead.textContent = 'WIN';
      const spendNote =
        state.raceSpend > 0
          ? ' (' + effOdds.toFixed(1) + '× after ' + state.raceSpend + ' CR tactics)'
          : ' at ' + effOdds.toFixed(1) + '×';
      const levelNote =
        state.level > prevLevel
          ? ' · Level up to N=' + LEVEL_SIZES[state.level] + '!'
          : '';
      resultSub.textContent =
        winner.name + ' paid' + spendNote + levelNote;

      startCreditCountUp(nextCredits, payout, '+');
      spawnCoinBurst();
      saveHighScore(winner.upper, state.seed, nextCredits);
      announce(
        winner.name +
          ' won! Payout +' +
          payout +
          ' credits. Balance ' +
          nextCredits +
          ' credits.'
      );
    } else {
      state.streak = 0;
      const pickRank = playerLane ? playerLane.rank : 3;

      if (state.credits <= 0) {
        sfx.playFinish(false);
        syncHudAndControls();
        enterGameOverScene(winner);
        return;
      }

      resultPanel.dataset.outcome = 'ko';
      resultHead.textContent = 'KO';
      resultSub.textContent =
        FIGHTERS[state.selectedFighter].name +
        ' finished #' +
        pickRank +
        ' behind ' +
        winner.name +
        '.';
      startCreditCountUp(state.credits, totalOutlay, '-');
      announce(
        winner.name + ' took first. Your pick finished #' + pickRank + '.'
      );
    }

    sfx.playFinish(playerWon);
    syncHudAndControls();
    setScene('result');
    nextBtn.focus({ preventScroll: true });
  }

  function returnToSelectForNextRound() {
    state.seed = ((state.seed * 1664525 + 1013904223) % 9000) + 100;
    state.phase = 'idle';
    countdown.dataset.on = 'false';
    setupSeedAndLanes();
    setScene('select');
    startBtn.focus({ preventScroll: true });
  }

  function stepLaneSimulation(lane, dt) {
    if (lane.finished) {
      lane.opsRateSmoothed *= Math.pow(0.05, dt);
      updateLaneTelemetryDOM(lane);
      return;
    }

    if (lane.boostTimer > 0) {
      lane.boostTimer = Math.max(0, lane.boostTimer - dt);
    }
    if (lane.jamTimer > 0) {
      lane.jamTimer = Math.max(0, lane.jamTimer - dt);
      lane.opsRateSmoothed = 0;
      updateLaneTelemetryDOM(lane);
      return;
    }

    const barCount = lane.bars.length;
    const levelScale = barCount === 64 ? 1.35 : barCount === 16 ? 0.42 : 0.8;
    const baseOpsPerSec = (reducedMotion ? 320 : 58) * levelScale;
    const boostMult = lane.boostTimer > 0 ? 2.0 : 1.0;
    const rate = baseOpsPerSec * lane.fighter.clockRate * boostMult;
    lane.stepBudget += rate * dt;
    const stepsToRun = Math.floor(lane.stepBudget);
    lane.stepBudget -= stepsToRun;

    let executed = 0;
    for (let s = 0; s < stepsToRun; s++) {
      const res = lane.generator.next();
      if (res.done) {
        lane.finished = true;
        lane.activeA = -1;
        lane.activeB = -1;
        lane.pivotIdx = -1;
        lane.boostTimer = 0;
        lane.jamTimer = 0;
        state.finishOrder.push(lane.slot);
        lane.rank = state.finishOrder.length;
        setLaneBadge(
          lane.slot,
          lane.rank,
          lane.rank === 1 ? '1ST' : lane.rank === 2 ? '2ND' : '3RD'
        );

        if (lane.rank === 1) {
          state.winnerLaneIdx = lane.slot;
          if (!reducedMotion) {
            state.phase = 'hitstop';
            state.hitStopTimer = 0.12;
            triggerCountdownNumber('KO · ' + lane.fighter.upper, 'ko');
            sfx.playHitStop();
          }
        }
        break;
      }

      const step = res.value;
      executed++;
      lane.totalOps++;
      if (step.type === 'compare') {
        lane.compares++;
      } else {
        lane.swaps++;
      }

      lane.activeA = step.a;
      lane.activeB = step.b;
      lane.pivotIdx = step.pivot ?? -1;

      const snap = step.snapshot;
      for (let k = 0; k < barCount; k++) {
        const bar = lane.bars[k];
        const nextVal = snap[k];
        if (bar.val !== nextVal) {
          if (nextVal > bar.peakHold) {
            bar.peakHold = nextVal;
          }
          bar.val = nextVal;
          if (!reducedMotion) {
            bar.yVel = -125;
          } else {
            bar.visualVal = nextVal;
          }
          bar.heat = 1;
        }
      }

      if (step.a >= 0 && step.a < barCount) {
        lane.bars[step.a].heat = Math.max(lane.bars[step.a].heat, 0.85);
      }
      if (step.b >= 0 && step.b < barCount) {
        lane.bars[step.b].heat = Math.max(lane.bars[step.b].heat, 0.85);
        sfx.playStep(lane.bars[step.b].val, barCount, step.type === 'swap');
      }

      if (state.phase === 'hitstop') {
        break;
      }
    }

    const instantRate = dt > 0 ? executed / dt : 0;
    lane.opsRateSmoothed = lane.opsRateSmoothed * 0.8 + instantRate * 0.2;
    updateLaneTelemetryDOM(lane);
  }

  function updateBarPhysics(dt) {
    let anyActive = false;

    for (let l = 0; l < 3; l++) {
      const lane = state.lanes[l];
      if (!lane) continue;
      const barCount = lane.bars.length;

      // Smoothly advance character runner X toward sort progress
      const targetProg = getLaneProgress(lane);
      const progDiff = targetProg - lane.runnerX;
      if (Math.abs(progDiff) > 0.002) {
        lane.runnerX += progDiff * Math.min(1, dt * 14);
        anyActive = true;
      } else {
        lane.runnerX = targetProg;
      }

      if (
        state.phase === 'finish' &&
        lane.slot === state.winnerLaneIdx &&
        lane.sweepProgress < barCount
      ) {
        const prevIdx = Math.floor(lane.sweepProgress);
        lane.sweepProgress = Math.min(
          barCount,
          lane.sweepProgress + (reducedMotion ? barCount : dt * barCount * 2.4)
        );
        const currIdx = Math.floor(lane.sweepProgress);
        for (let k = prevIdx; k < currIdx && k < barCount; k++) {
          lane.bars[k].locked = true;
          if (!reducedMotion) {
            lane.bars[k].yVel = -145;
            lane.bars[k].heat = 1;
          }
        }
        anyActive = true;
      }

      for (let k = 0; k < barCount; k++) {
        const bar = lane.bars[k];
        const diff = bar.val - bar.visualVal;
        if (Math.abs(diff) > 0.01) {
          bar.visualVal += diff * Math.min(1, dt * 26);
          anyActive = true;
        } else {
          bar.visualVal = bar.val;
        }

        if (bar.peakHold > bar.visualVal) {
          bar.peakHold = Math.max(bar.visualVal, bar.peakHold - dt * 14);
          anyActive = true;
        }

        if (!reducedMotion && (Math.abs(bar.yOffset) > 0.05 || Math.abs(bar.yVel) > 0.5)) {
          const springForce = -320 * bar.yOffset - 17 * bar.yVel;
          bar.yVel += springForce * dt;
          bar.yOffset += bar.yVel * dt;
          anyActive = true;
        } else {
          bar.yOffset = 0;
          bar.yVel = 0;
        }

        if (bar.heat > 0.01) {
          bar.heat = Math.max(0, bar.heat - dt * 4.2);
          anyActive = true;
        } else {
          bar.heat = 0;
        }
      }
    }

    return anyActive;
  }

  function updateAndDrawCoins(dt) {
    if (!fxCtx) return false;
    fxCtx.save();
    fxCtx.setTransform(1, 0, 0, 1, 0, 0);
    fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
    fxCtx.restore();

    if (state.coins.length === 0) return false;

    for (let i = state.coins.length - 1; i >= 0; i--) {
      const c = state.coins[i];
      c.age += dt;
      if (c.age >= c.life) {
        state.coins.splice(i, 1);
        continue;
      }
      c.vy += 680 * dt;
      c.x += c.vx * dt;
      c.y += c.vy * dt;

      const alpha = Math.max(0, 1 - c.age / c.life);
      fxCtx.globalAlpha = alpha;
      fxCtx.drawImage(
        coinSpriteCanvas,
        Math.round(c.x),
        Math.round(c.y),
        c.size,
        c.size
      );
    }
    fxCtx.globalAlpha = 1;
    return state.coins.length > 0;
  }

  function drawLaneCanvas(laneSlot, nowMs) {
    const ctx = ctxs[laneSlot];
    const vp = viewports[laneSlot];
    const lane = state.lanes[laneSlot];
    if (!ctx || !lane) return;

    const w = vp.w;
    const h = vp.h;
    if (w < 20 || h < 20) return;
    const fighter = lane.fighter;
    const barCount = lane.bars.length;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvases[laneSlot].width, canvases[laneSlot].height);
    ctx.restore();

    const padX = 12;
    const innerW = Math.max(80, w - padX * 2);

    // 1. Character Runner Track along top of lane canvas.
    // 12px sprites drawn at 4x on tall lanes, 2x on short stacked mobile lanes.
    const spriteSize = h >= 260 ? 48 : 24;
    const trackY = spriteSize + 8;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(padX, trackY, innerW, 2);

    // Progress fill along runner track
    const maxRunX = Math.max(0, innerW - spriteSize);
    const runnerPx = Math.round(padX + lane.runnerX * maxRunX);
    ctx.fillStyle = fighter.color;
    ctx.globalAlpha = 0.55;
    ctx.fillRect(padX, trackY, Math.max(0, runnerPx - padX + spriteSize / 2), 2);
    ctx.globalAlpha = 1;

    // Finish line checkered post at right end of runner track
    const finishX = padX + innerW - 4;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(finishX, 8, 2, trackY - 8);

    // Choose character sprite frame (runA/runB during race, win celebration or lose slump at finish)
    const spriteSet = RUNNER_SPRITES[lane.fighterId] || RUNNER_SPRITES[0];
    const px = spriteSize / 12;
    const groundY = trackY - spriteSize + Math.round(px / 2);
    let spriteImg = spriteSet.runA;
    let spriteY = groundY;

    if (lane.finished) {
      if (lane.rank === 1) {
        spriteImg = spriteSet.win;
        if (!reducedMotion) {
          spriteY = groundY - Math.abs(Math.round(Math.sin((nowMs || 0) * 0.012) * 2)) * px;
        }
      } else {
        spriteImg = spriteSet.lose;
        spriteY = groundY + px;
      }
    } else if (state.phase === 'racing') {
      spriteImg = Math.floor(lane.totalOps / 3) % 2 === 0 ? spriteSet.runA : spriteSet.runB;
    }

    // Boost trail afterimage
    ctx.imageSmoothingEnabled = false;
    if (lane.boostTimer > 0 && !reducedMotion) {
      ctx.globalAlpha = 0.32;
      ctx.drawImage(spriteImg, Math.max(padX, runnerPx - spriteSize / 2), spriteY, spriteSize, spriteSize);
      ctx.globalAlpha = 0.14;
      ctx.drawImage(spriteImg, Math.max(padX, runnerPx - spriteSize), spriteY, spriteSize, spriteSize);
      ctx.globalAlpha = 1;
    }

    ctx.drawImage(spriteImg, runnerPx, spriteY, spriteSize, spriteSize);

    // Jammed freeze bracket around character
    if (lane.jamTimer > 0) {
      ctx.strokeStyle = '#ff7e6b';
      ctx.lineWidth = 2;
      ctx.strokeRect(runnerPx - 2, spriteY - 1, spriteSize + 4, spriteSize + 2);
    }

    // 2. Bar Field below the runner track
    const topPad = trackY + 12;
    const bottomPad = 12;
    const usableH = Math.max(40, h - topPad - bottomPad);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    for (let q = 1; q <= 3; q++) {
      const gy = Math.round(topPad + (usableH * q) / 4);
      ctx.fillRect(0, gy, w, 1);
    }

    const stepX = innerW / barCount;
    const barW = Math.max(1, Math.floor(stepX - (barCount >= 64 ? 1 : 2)));

    if (lane.activeA >= 0 && lane.activeB >= 0 && state.phase !== 'idle') {
      const xa = Math.round(padX + lane.activeA * stepX + barW / 2);
      const xb = Math.round(padX + lane.activeB * stepX + barW / 2);
      const leftX = Math.min(xa, xb);
      const spanW = Math.max(2, Math.abs(xb - xa));

      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(xa - 1, topPad, 2, usableH);
      ctx.fillRect(xb - 1, topPad, 2, usableH);

      ctx.fillStyle = fighter.color;
      ctx.fillRect(leftX, topPad - 4, spanW, 2);
    }

    for (let k = 0; k < barCount; k++) {
      const bar = lane.bars[k];
      const norm = bar.visualVal / barCount;
      const barH = Math.max(4, Math.round(norm * usableH));
      const x = Math.round(padX + k * stepX);
      const springY = Math.max(-10, Math.min(6, Math.round(bar.yOffset)));
      const y = Math.round(topPad + usableH - barH + springY);

      const isCompared = k === lane.activeA || k === lane.activeB;
      const isPivot = k === lane.pivotIdx;

      if (bar.locked) {
        ctx.fillStyle = fighter.colorHi;
      } else if (isCompared) {
        ctx.fillStyle = '#ffffff';
      } else if (bar.heat > 0.35) {
        ctx.fillStyle = fighter.colorHi;
      } else if (isPivot) {
        ctx.fillStyle = '#ffffff';
      } else {
        ctx.fillStyle = fighter.color;
      }

      ctx.globalAlpha = bar.locked || isCompared ? 1 : 0.36 + norm * 0.58;
      ctx.fillRect(x, y + 3, barW, Math.max(1, barH - 3));

      ctx.globalAlpha = 1;
      ctx.fillStyle = isCompared ? '#ffffff' : fighter.colorHi;
      ctx.fillRect(x, y, barW, 2);

      if (bar.peakHold > bar.visualVal + 0.6) {
        const peakH = Math.round((bar.peakHold / barCount) * usableH);
        const peakY = Math.round(topPad + usableH - peakH);
        ctx.fillStyle = fighter.color;
        ctx.globalAlpha = 0.5;
        ctx.fillRect(x, peakY, barW, 1);
        ctx.globalAlpha = 1;
      }
    }

    // Status pixel tag along runner track (shifts left at finish so runner sprite is unobstructed)
    let rightHud = 'N=' + barCount;
    let rightColor = 'rgba(243, 245, 248, 0.5)';
    if (lane.finished) {
      rightHud = lane.rank === 1 ? 'WINNER 1ST!' : 'FINISH #' + lane.rank;
      rightColor = lane.rank === 1 ? fighter.colorHi : 'rgba(243, 245, 248, 0.55)';
    } else if (lane.jamTimer > 0) {
      rightHud = 'JAMMED ' + lane.jamTimer.toFixed(1) + 'S';
      rightColor = '#ff7e6b';
    } else if (lane.boostTimer > 0) {
      rightHud = 'BOOST 2X';
      rightColor = fighter.colorHi;
    }
    const rw = pixelTextWidth(rightHud, 2);
    const hudX = lane.finished || lane.runnerX > 0.22 ? 16 : w - rw - 20;
    drawPixelText(ctx, rightHud, hudX, Math.round(trackY / 2 - 5), rightColor, 2);
  }

  function countSortedAdjacent(bars) {
    let count = 0;
    for (let i = 0; i < bars.length - 1; i++) {
      if (bars[i].val <= bars[i + 1].val) count++;
    }
    return count;
  }

  // Single requestAnimationFrame loop with off-screen & visibility pause
  let rafId = 0;
  let lastFrameTime = 0;
  let stageIntersecting = true;

  function frame(now) {
    rafId = 0;
    const dt = Math.max(0, Math.min(0.05, (now - lastFrameTime) / 1000));
    lastFrameTime = now;

    let keepRunning = false;

    if (state.creditAnimT < 1) {
      state.creditAnimT = Math.min(1, state.creditAnimT + dt / 0.65);
      const eased =
        state.creditAnimT === 1 ? 1 : 1 - Math.pow(2, -10 * state.creditAnimT);
      state.displayCredits =
        state.creditAnimFrom + (state.creditAnimTo - state.creditAnimFrom) * eased;
      const curPayout = Math.round(state.payoutAnimTo * eased);
      hudCredits.textContent = Math.round(state.displayCredits).toLocaleString('en-US');
      resultBalance.textContent =
        Math.round(state.displayCredits).toLocaleString('en-US') + ' CR';
      resultPayout.textContent =
        state.payoutSign + curPayout.toLocaleString('en-US');
      keepRunning = true;
    }

    if (state.shakeStep > 0) {
      state.shakeTimer -= dt;
      if (state.shakeTimer <= 0) {
        state.shakeStep--;
        state.shakeTimer = 0.032;
        stage.dataset.shake = String(state.shakeStep);
      }
      keepRunning = true;
    }

    if (state.phase === 'countdown') {
      state.countdownTimer -= dt;
      if (state.countdownTimer <= 0) {
        state.countdownStep--;
        if (state.countdownStep > 0) {
          state.countdownTimer = 0.34;
          triggerCountdownNumber(String(state.countdownStep), 'num');
          sfx.playCountdown(false);
        } else if (state.countdownStep === 0) {
          state.countdownTimer = 0.24;
          triggerCountdownNumber('GO!', 'go');
          sfx.playCountdown(true);
        } else {
          beginRacePhase();
        }
      }
      keepRunning = true;
    } else if (state.phase === 'hitstop') {
      state.hitStopTimer -= dt;
      if (state.hitStopTimer <= 0) {
        countdown.dataset.on = 'false';
        state.phase = 'racing';
        if (!reducedMotion) {
          state.shakeStep = 3;
          state.shakeTimer = 0.032;
          stage.dataset.shake = '3';
        }
      }
      keepRunning = true;
    } else if (state.phase === 'racing') {
      for (let slot = 0; slot < 3; slot++) {
        stepLaneSimulation(state.lanes[slot], dt);
        if (state.phase === 'hitstop') break;
      }
      updateLivePositions();
      syncHudAndControls();
      if (state.phase === 'racing' && state.lanes.every((l) => l.finished)) {
        resolveRaceFinish();
      }
      keepRunning = true;
    } else if (state.phase === 'gameover') {
      state.continueTimer -= dt;
      const shown = Math.max(0, Math.floor(state.continueTimer));
      if (continueCount.textContent !== String(shown)) {
        continueCount.textContent = String(shown);
      }
      if (state.continueTimer <= 0) {
        triggerContinueFromGameOver();
      } else {
        keepRunning = true;
      }
    }

    if (updateBarPhysics(dt)) {
      keepRunning = true;
    }

    if (
      state.phase === 'finish' &&
      !reducedMotion &&
      state.scene === 'result'
    ) {
      // Keep animating winning sprite celebration bounce while Result scene is visible
      keepRunning = true;
    }

    if (updateAndDrawCoins(dt)) {
      keepRunning = true;
    }

    if (state.scene === 'race' || state.scene === 'result') {
      for (let slot = 0; slot < 3; slot++) {
        drawLaneCanvas(slot, now);
      }
    }

    if (keepRunning && stageIntersecting && !document.hidden) {
      rafId = requestAnimationFrame(frame);
    }
  }

  function requestTick() {
    if (rafId || !stageIntersecting || document.hidden) return;
    lastFrameTime = performance.now();
    rafId = requestAnimationFrame(frame);
  }

  const resizeObserver = new ResizeObserver((entries) => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    for (const entry of entries) {
      if (entry.target === fxCanvas) {
        const fw = Math.max(300, Math.round(entry.contentRect.width));
        const fh = Math.max(300, Math.round(entry.contentRect.height));
        fxViewport.w = fw;
        fxViewport.h = fh;
        fxViewport.dpr = dpr;
        fxCanvas.width = Math.round(fw * dpr);
        fxCanvas.height = Math.round(fh * dpr);
        if (fxCtx) {
          fxCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
          fxCtx.imageSmoothingEnabled = false;
        }
        continue;
      }

      const idx = canvases.indexOf(entry.target);
      if (idx === -1) continue;
      const cssW = Math.round(entry.contentRect.width);
      const cssH = Math.round(entry.contentRect.height);
      if (cssW < 10 || cssH < 10) continue;
      viewports[idx] = { w: cssW, h: cssH, dpr };
      const canvas = canvases[idx];
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      const ctx = ctxs[idx];
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.imageSmoothingEnabled = false;
      }
    }
    requestTick();
  });

  canvases.forEach((c) => resizeObserver.observe(c));
  resizeObserver.observe(fxCanvas);

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      stageIntersecting = entry ? entry.isIntersecting : true;
      if (stageIntersecting) {
        requestTick();
      } else if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    },
    { threshold: 0.05 }
  );
  intersectionObserver.observe(stage);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    } else if (!document.hidden) {
      requestTick();
    }
  });

  // UI Event Listeners
  levelPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const lvl = Number(pill.dataset.level) || 1;
      state.level = lvl;
      saveProgression();
      setupSeedAndLanes();
      announce('Selected Level ' + lvl + ' (N=' + getBarCount() + ' bars).');
    });
  });

  fighterBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      if (idx === 3 && !state.unlockedHeap) {
        announce('Heapforge unlocks at 2,000 credits.');
        return;
      }
      state.selectedFighter = idx;
      setupSeedAndLanes();
      announce(
        'Selected ' +
          FIGHTERS[idx].name +
          ' at ' +
          state.odds[idx].toFixed(1) +
          'x odds.'
      );
    });
  });

  chipBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      state.wagerMode = btn.dataset.wager || '100';
      syncHudAndControls();
    });
  });

  function togglePowerUp(mode) {
    state.powerMode = state.powerMode === mode ? 'none' : mode;
    setupSeedAndLanes();
    announce(
      state.powerMode === 'none'
        ? 'Power-up cleared.'
        : 'Activated ' + mode + ' seed modifier.'
    );
  }

  modNearly.addEventListener('click', () => togglePowerUp('nearly'));
  modReverse.addEventListener('click', () => togglePowerUp('reverse'));

  rerollBtn.addEventListener('click', () => {
    state.seed = ((state.seed * 22695477 + 1) % 9000) + 100;
    setupSeedAndLanes();
    announce('Rerolled seed #' + String(state.seed).padStart(4, '0'));
  });

  startBtn.addEventListener('click', () => {
    triggerRoundStart();
  });

  boostBtn.addEventListener('click', () => {
    triggerBoost();
  });

  jamBtn.addEventListener('click', () => {
    triggerJam();
  });

  nextBtn.addEventListener('click', () => {
    returnToSelectForNextRound();
  });

  continueBtn.addEventListener('click', () => {
    triggerContinueFromGameOver();
  });

  sfxBtn.addEventListener('click', () => {
    const on = sfx.toggle();
    sfxBtn.setAttribute('aria-pressed', String(on));
    sfxState.textContent = on ? 'on' : 'off';
  });

  helpBtn.addEventListener('click', () => {
    if (typeof helpDialog.showModal === 'function') {
      helpDialog.showModal();
    } else {
      helpDialog.setAttribute('open', '');
    }
  });

  helpClose.addEventListener('click', () => {
    if (typeof helpDialog.close === 'function') {
      helpDialog.close();
    } else {
      helpDialog.removeAttribute('open');
    }
  });

  helpDialog.addEventListener('click', (e) => {
    if (e.target === helpDialog) {
      helpDialog.close();
    }
  });

  resetBankBtn.addEventListener('click', () => {
    state.streak = 0;
    startCreditCountUp(STARTING_CREDITS, 0, '+');
    syncHudAndControls();
    requestTick();
    if (helpDialog.open) helpDialog.close();
  });

  window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (helpDialog.open) {
      if (e.key === 'Escape') {
        helpDialog.close();
      }
      return;
    }

    if (e.key === '?') {
      e.preventDefault();
      helpBtn.click();
      return;
    }

    if (state.scene === 'select' && state.phase === 'idle') {
      if (e.code === 'Digit1') {
        state.selectedFighter = 0;
        setupSeedAndLanes();
      } else if (e.code === 'Digit2') {
        state.selectedFighter = 1;
        setupSeedAndLanes();
      } else if (e.code === 'Digit3') {
        state.selectedFighter = 2;
        setupSeedAndLanes();
      } else if (e.code === 'Digit4' && state.unlockedHeap) {
        state.selectedFighter = 3;
        setupSeedAndLanes();
      } else if (e.code === 'KeyQ') {
        togglePowerUp('nearly');
      } else if (e.code === 'KeyW') {
        togglePowerUp('reverse');
      } else if (e.code === 'KeyR') {
        rerollBtn.click();
      } else if (
        (e.code === 'Space' || e.code === 'Enter') &&
        (document.activeElement === document.body ||
          document.activeElement === startBtn)
      ) {
        e.preventDefault();
        triggerRoundStart();
      }
    } else if (state.scene === 'race' && state.phase === 'racing') {
      if (e.code === 'KeyB') {
        e.preventDefault();
        triggerBoost();
      } else if (e.code === 'KeyJ') {
        e.preventDefault();
        triggerJam();
      }
    } else if (
      state.scene === 'result' &&
      (e.code === 'Space' || e.code === 'Enter') &&
      (document.activeElement === document.body ||
        document.activeElement === nextBtn)
    ) {
      e.preventDefault();
      returnToSelectForNextRound();
    } else if (
      state.scene === 'gameover' &&
      (e.code === 'Space' || e.code === 'Enter')
    ) {
      e.preventDefault();
      triggerContinueFromGameOver();
    }
  });

  // Initialize
  loadProgression();
  state.highScores = loadHighScores();
  renderHighScores();
  setupSeedAndLanes();
})();
