(() => {
  'use strict';

  const BAR_COUNT = 32;
  const HI_STORAGE_KEY = 'bl-sort-arena-hi-v1';
  const STARTING_CREDITS = 1000;

  const FIGHTERS = [
    {
      id: 0,
      name: 'QUICKBLADE',
      algo: 'Quick Sort',
      clockRate: 1.0,
      color: '#5ad1cd',
      colorDim: '#1f4e52',
      colorHi: '#b8f7f5',
      gen: quickSortGen,
    },
    {
      id: 1,
      name: 'MERGETITAN',
      algo: 'Merge Sort',
      clockRate: 1.08,
      color: '#b46eff',
      colorDim: '#3d2459',
      colorHi: '#e5ccff',
      gen: mergeSortGen,
    },
    {
      id: 2,
      name: 'VIPERSHIFT',
      algo: 'Insertion Sort',
      clockRate: 2.25,
      color: '#ed6f5c',
      colorDim: '#572822',
      colorHi: '#ffcdc4',
      gen: insertionSortGen,
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

  // Build reproducible array from seed + active power-up
  function generateArray(seed, powerMode) {
    const rng = mulberry32(seed);
    const arr = Array.from({ length: BAR_COUNT }, (_, i) => i + 1);

    if (powerMode === 'nearly') {
      const localSwaps = 4 + Math.floor(rng() * 4);
      for (let s = 0; s < localSwaps; s++) {
        const idx = Math.floor(rng() * (BAR_COUNT - 3));
        const span = 1 + Math.floor(rng() * 2);
        const tmp = arr[idx];
        arr[idx] = arr[idx + span];
        arr[idx + span] = tmp;
      }
      if (rng() < 0.35) {
        const a = 4 + Math.floor(rng() * 8);
        const b = a + 8 + Math.floor(rng() * 8);
        const tmp = arr[a];
        arr[a] = arr[b];
        arr[b] = tmp;
      }
      return arr;
    }

    if (powerMode === 'reverse') {
      arr.reverse();
      const jitterSwaps = 3 + Math.floor(rng() * 4);
      for (let s = 0; s < jitterSwaps; s++) {
        const idx = Math.floor(rng() * (BAR_COUNT - 4));
        const span = 1 + Math.floor(rng() * 3);
        const tmp = arr[idx];
        arr[idx] = arr[idx + span];
        arr[idx + span] = tmp;
      }
      return arr;
    }

    for (let i = BAR_COUNT - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  // Calculate exact inversions and derive real expected cost & odds
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

    const estOps = [estQuickOps, estMergeOps, estInsertOps];
    const effectiveCycles = estOps.map((ops, idx) => ops / FIGHTERS[idx].clockRate);

    const weights = effectiveCycles.map((cyc) => Math.pow(120 / Math.max(20, cyc), 2.5));
    const weightSum = weights[0] + weights[1] + weights[2];

    const odds = weights.map((w) => {
      const prob = w / weightSum;
      const raw = (0.92 / prob);
      return Math.max(1.2, Math.min(6.5, Math.round(raw * 10) / 10));
    });

    const modeLabel =
      powerMode === 'nearly'
        ? 'NEARLY SORTED SEED'
        : powerMode === 'reverse'
          ? 'REVERSE TRAP SEED'
          : 'RANDOM SHUFFLE';

    return {
      inversions,
      invPct: (invRatio * 100).toFixed(1),
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
    playStep(barVal, isSwap) {
      if (!this.enabled || !this.ctx) return;
      const nowMs = performance.now();
      if (nowMs - this.lastTickAt < 46) return;
      this.lastTickAt = nowMs;
      const freq = 220 + (barVal / BAR_COUNT) * 480;
      this.playTone(freq, isSwap ? 0.035 : 0.02, isSwap ? 'square' : 'triangle', isSwap ? 0.028 : 0.015);
    },
    playCountdown(isGo) {
      this.playTone(isGo ? 880 : 440, isGo ? 0.14 : 0.07, 'square', 0.05);
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

  // DOM Elements
  const cabinetRoot = document.getElementById('cabinetRoot');
  const seedReadout = document.getElementById('seedReadout');
  const newSeedBtn = document.getElementById('newSeedBtn');
  const sfxBtn = document.getElementById('sfxBtn');
  const sfxLabel = document.getElementById('sfxLabel');
  const creditsValue = document.getElementById('creditsValue');
  const creditsDelta = document.getElementById('creditsDelta');
  const wagerReadout = document.getElementById('wagerReadout');
  const payoutReadout = document.getElementById('payoutReadout');
  const streakBadge = document.getElementById('streakBadge');
  const streakPips = [
    document.getElementById('streakPip0'),
    document.getElementById('streakPip1'),
    document.getElementById('streakPip2'),
    document.getElementById('streakPip3'),
  ];
  const statusBanner = document.getElementById('statusBanner');
  const disorderMeta = document.getElementById('disorderMeta');

  const fighterBtns = [
    document.getElementById('fighterBtn0'),
    document.getElementById('fighterBtn1'),
    document.getElementById('fighterBtn2'),
  ];
  const oddsBadges = [
    document.getElementById('oddsBadge0'),
    document.getElementById('oddsBadge1'),
    document.getElementById('oddsBadge2'),
  ];
  const estOpsNodes = [
    document.getElementById('estOps0'),
    document.getElementById('estOps1'),
    document.getElementById('estOps2'),
  ];

  const wagerBtns = Array.from(document.querySelectorAll('.sa-chip-btn[data-wager]'));
  const powerNearlyBtn = document.getElementById('powerNearlyBtn');
  const powerReverseBtn = document.getElementById('powerReverseBtn');
  const startRaceBtn = document.getElementById('startRaceBtn');
  const startBtnText = document.getElementById('startBtnText');

  const arenaStage = document.getElementById('arenaStage');
  const stageOverlay = document.getElementById('stageOverlay');
  const overlayBadge = document.getElementById('overlayBadge');
  const overlaySub = document.getElementById('overlaySub');

  const laneCards = [
    document.getElementById('laneCard0'),
    document.getElementById('laneCard1'),
    document.getElementById('laneCard2'),
  ];
  const opsValNodes = [
    document.getElementById('opsVal0'),
    document.getElementById('opsVal1'),
    document.getElementById('opsVal2'),
  ];
  const speedValNodes = [
    document.getElementById('speedVal0'),
    document.getElementById('speedVal1'),
    document.getElementById('speedVal2'),
  ];
  const gaugeSegs = [
    Array.from(document.querySelectorAll('#gaugeBar0 .sa-seg')),
    Array.from(document.querySelectorAll('#gaugeBar1 .sa-seg')),
    Array.from(document.querySelectorAll('#gaugeBar2 .sa-seg')),
  ];
  const rankPills = [
    document.getElementById('rankPill0'),
    document.getElementById('rankPill1'),
    document.getElementById('rankPill2'),
  ];
  const canvases = [
    document.getElementById('laneCanvas0'),
    document.getElementById('laneCanvas1'),
    document.getElementById('laneCanvas2'),
  ];
  const ctxs = canvases.map((c) => c.getContext('2d'));

  const highScoreList = document.getElementById('highScoreList');
  const resetBankBtn = document.getElementById('resetBankBtn');
  const srLive = document.getElementById('srLive');

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reducedMotion = reducedMotionQuery.matches;
  reducedMotionQuery.addEventListener('change', (e) => {
    reducedMotion = e.matches;
  });

  // Cached canvas metrics (updated only in ResizeObserver, zero layout reads in rAF)
  const viewports = [
    { w: 360, h: 248, dpr: 1 },
    { w: 360, h: 248, dpr: 1 },
    { w: 360, h: 248, dpr: 1 },
  ];

  // Game State
  const state = {
    phase: 'idle', // 'idle' | 'countdown' | 'racing' | 'hitstop' | 'finish'
    seed: 409,
    powerMode: 'none', // 'none' | 'nearly' | 'reverse'
    selectedFighter: 0,
    wagerMode: '100',
    credits: STARTING_CREDITS,
    displayCredits: STARTING_CREDITS,
    creditAnimFrom: STARTING_CREDITS,
    creditAnimTo: STARTING_CREDITS,
    creditAnimT: 1,
    streak: 0,
    baseArray: [],
    odds: [1.9, 2.2, 3.4],
    estOps: [175, 190, 490],
    countdownTimer: 0,
    countdownStep: 3,
    hitStopTimer: 0,
    shakeTimer: 0,
    shakeStep: 0,
    sweepTimer: 0,
    finishOrder: [],
    winnerId: -1,
    lanes: [],
    highScores: [],
  };

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
      if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(0, 5);
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
    state.highScores = state.highScores.slice(0, 5);
    try {
      localStorage.setItem(HI_STORAGE_KEY, JSON.stringify(state.highScores));
    } catch (_e) {
      // Ignore storage write errors
    }
    renderHighScores();
  }

  function renderHighScores() {
    while (highScoreList.firstChild) {
      highScoreList.removeChild(highScoreList.firstChild);
    }
    state.highScores.forEach((entry, idx) => {
      const li = document.createElement('li');
      li.className = 'sa-score-row';

      const rankSpan = document.createElement('span');
      rankSpan.className = 'sa-score-rank';
      rankSpan.textContent = '#' + String(idx + 1).padStart(2, '0');

      const nameSpan = document.createElement('span');
      nameSpan.className = 'sa-score-fighter';
      nameSpan.textContent =
        entry.fighter + ' · SEED #' + String(entry.seed).padStart(4, '0');

      const valSpan = document.createElement('span');
      valSpan.className = 'sa-score-val';
      valSpan.textContent = entry.payout.toLocaleString('en-US') + ' CR';

      li.appendChild(rankSpan);
      li.appendChild(nameSpan);
      li.appendChild(valSpan);
      highScoreList.appendChild(li);
    });
  }

  function announce(msg) {
    if (srLive) srLive.textContent = msg;
  }

  function getStreakMultiplier() {
    return 1 + Math.min(4, state.streak) * 0.25;
  }

  function getActiveWager() {
    if (state.wagerMode === 'max') {
      return Math.max(10, state.credits);
    }
    const numeric = Number(state.wagerMode) || 100;
    return Math.min(state.credits, numeric);
  }

  function createLaneRuntime(fighter, initialArr) {
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
      id: fighter.id,
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
      finished: false,
      rank: 0,
      sweepProgress: 0,
    };
  }

  function setupSeedAndLanes() {
    state.baseArray = generateArray(state.seed, state.powerMode);
    const analysis = analyzeArrayAndOdds(state.baseArray, state.powerMode);
    state.odds = analysis.odds;
    state.estOps = analysis.estOps;
    state.finishOrder = [];
    state.winnerId = -1;

    seedReadout.textContent = '#' + String(state.seed).padStart(4, '0');
    disorderMeta.textContent =
      'INVERSIONS: ' +
      analysis.inversions +
      ' (' +
      analysis.invPct +
      '%) · ' +
      analysis.modeLabel;

    state.lanes = FIGHTERS.map((f) => createLaneRuntime(f, state.baseArray));

    for (let i = 0; i < 3; i++) {
      oddsBadges[i].textContent = state.odds[i].toFixed(1) + '×';
      estOpsNodes[i].textContent = '~' + state.estOps[i] + ' OPS';
      laneCards[i].dataset.state = 'idle';
      rankPills[i].dataset.rank = 'idle';
      rankPills[i].textContent = state.odds[i].toFixed(1) + '×';
      updateLaneTelemetryDOM(state.lanes[i]);
    }

    syncHudAndControls();
    requestTick();
  }

  function syncHudAndControls() {
    const wager = getActiveWager();
    const mult = getStreakMultiplier();
    const activeOdds = state.odds[state.selectedFighter];
    const estPayout = Math.round(wager * activeOdds * mult);

    creditsValue.textContent = Math.round(state.displayCredits).toLocaleString('en-US');
    wagerReadout.textContent = wager.toLocaleString('en-US') + ' CR';
    payoutReadout.textContent = estPayout.toLocaleString('en-US') + ' CR';
    streakBadge.textContent = mult.toFixed(2).replace(/\.00$/, '.0') + '×';

    for (let i = 0; i < 4; i++) {
      streakPips[i].dataset.lit = i < state.streak ? 'true' : 'false';
    }

    for (let i = 0; i < 3; i++) {
      const picked = i === state.selectedFighter;
      fighterBtns[i].setAttribute('aria-pressed', String(picked));
      laneCards[i].dataset.picked = String(picked);
    }

    wagerBtns.forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.wager === state.wagerMode));
    });

    powerNearlyBtn.setAttribute('aria-pressed', String(state.powerMode === 'nearly'));
    powerReverseBtn.setAttribute('aria-pressed', String(state.powerMode === 'reverse'));

    const busy =
      state.phase === 'countdown' ||
      state.phase === 'racing' ||
      state.phase === 'hitstop';

    fighterBtns.forEach((b) => {
      b.disabled = busy;
    });
    wagerBtns.forEach((b) => {
      b.disabled = busy;
    });
    powerNearlyBtn.disabled = busy;
    powerReverseBtn.disabled = busy;
    newSeedBtn.disabled = busy;
    startRaceBtn.disabled = busy;

    if (state.phase === 'idle') {
      startBtnText.textContent = 'START RACE';
    } else if (state.phase === 'finish') {
      startBtnText.textContent = 'NEXT RACE';
    } else {
      startBtnText.textContent = 'RACING...';
    }
  }

  function updateLaneTelemetryDOM(lane) {
    const opsStr = String(lane.totalOps).padStart(3, '0');
    const cmpStr = String(lane.compares).padStart(2, '0');
    const swpStr = String(lane.swaps).padStart(2, '0');
    opsValNodes[lane.id].innerHTML =
      opsStr + ' <small>' + cmpStr + '/' + swpStr + '</small>';

    const rate = Math.round(lane.opsRateSmoothed);
    speedValNodes[lane.id].textContent = String(rate).padStart(3, '0') + '/S';

    const litCount = Math.min(10, Math.ceil((rate / 185) * 10));
    const segs = gaugeSegs[lane.id];
    for (let s = 0; s < 10; s++) {
      segs[s].dataset.on = s < litCount ? 'true' : 'false';
    }
  }

  function startCreditCountUp(targetCredits) {
    state.creditAnimFrom = state.displayCredits;
    state.creditAnimTo = targetCredits;
    state.credits = targetCredits;
    state.creditAnimT = reducedMotion ? 1 : 0;
    if (reducedMotion) {
      state.displayCredits = targetCredits;
      creditsValue.textContent = Math.round(targetCredits).toLocaleString('en-US');
    }
  }

  function triggerRoundStart() {
    if (
      state.phase === 'countdown' ||
      state.phase === 'racing' ||
      state.phase === 'hitstop'
    ) {
      return;
    }

    if (state.phase === 'finish') {
      state.seed = ((state.seed * 1664525 + 1013904223) % 9000) + 100;
      setupSeedAndLanes();
    }

    if (state.credits <= 0) {
      state.credits = 500;
      state.displayCredits = 500;
    }

    const wager = getActiveWager();
    state.lockedWager = wager;
    startCreditCountUp(state.credits - wager);
    creditsDelta.dataset.tone = 'neutral';
    creditsDelta.textContent = '-' + wager + ' CR WAGER';

    if (reducedMotion) {
      beginRacePhase();
      return;
    }

    state.phase = 'countdown';
    state.countdownStep = 3;
    state.countdownTimer = 0.36;
    stageOverlay.dataset.phase = 'count-3';
    overlayBadge.textContent = '3';
    overlaySub.textContent =
      'BET LOCKED ON ' + FIGHTERS[state.selectedFighter].name;
    statusBanner.dataset.tone = 'race';
    statusBanner.textContent = 'COUNTDOWN — LOCKING IN SEED #' + String(state.seed).padStart(4, '0');
    sfx.playCountdown(false);
    syncHudAndControls();
    requestTick();
  }

  function beginRacePhase() {
    state.phase = 'racing';
    stageOverlay.dataset.phase = 'idle';
    statusBanner.dataset.tone = 'race';
    statusBanner.textContent =
      'LIVE RACE // ' + FIGHTERS[state.selectedFighter].name + ' AT ' + state.odds[state.selectedFighter].toFixed(1) + '×';
    for (let i = 0; i < 3; i++) {
      rankPills[i].dataset.rank = 'idle';
      rankPills[i].textContent = 'RUN';
    }
    syncHudAndControls();
    announce('Sorting race started.');
    requestTick();
  }

  function resolveRaceFinish() {
    state.phase = 'finish';
    stageOverlay.dataset.phase = 'idle';

    const winner = FIGHTERS[state.winnerId];
    const playerWon = state.winnerId === state.selectedFighter;
    const wager = state.lockedWager || 100;

    for (let i = 0; i < 3; i++) {
      const isWinLane = i === state.winnerId;
      laneCards[i].dataset.state = isWinLane ? 'winner' : 'loser';
    }

    if (playerWon) {
      const mult = getStreakMultiplier();
      const winOdds = state.odds[state.winnerId];
      const payout = Math.round(wager * winOdds * mult);
      state.streak = Math.min(4, state.streak + 1);
      const nextCredits = state.credits + payout;
      startCreditCountUp(nextCredits);

      creditsDelta.dataset.tone = 'win';
      creditsDelta.textContent = '+' + payout.toLocaleString('en-US') + ' CR WIN!';
      statusBanner.dataset.tone = 'win';
      statusBanner.textContent =
        winner.name + ' WINS! PAYOUT +' + payout.toLocaleString('en-US') + ' CR';
      saveHighScore(winner.name, state.seed, nextCredits);
      announce(
        winner.name +
          ' won the race! You won ' +
          payout +
          ' credits. Balance ' +
          nextCredits +
          ' credits.'
      );
    } else {
      state.streak = 0;
      if (state.credits <= 0) {
        startCreditCountUp(500);
        creditsDelta.dataset.tone = 'loss';
        creditsDelta.textContent = 'HOUSE GRANT +500 CR';
      } else {
        creditsDelta.dataset.tone = 'loss';
        creditsDelta.textContent = 'KO -' + wager + ' CR';
      }
      statusBanner.dataset.tone = 'loss';
      statusBanner.textContent =
        winner.name + ' TAKES 1ST // YOUR PICK FINISHED #' + state.lanes[state.selectedFighter].rank;
      announce(
        winner.name +
          ' won the race. Your pick finished number ' +
          state.lanes[state.selectedFighter].rank +
          '.'
      );
    }

    sfx.playFinish(playerWon);
    syncHudAndControls();
  }

  function stepLaneSimulation(lane, dt) {
    if (lane.finished) {
      lane.opsRateSmoothed *= Math.pow(0.05, dt);
      return;
    }

    const baseOpsPerSec = reducedMotion ? 340 : 78;
    const rate = baseOpsPerSec * lane.fighter.clockRate;
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
        state.finishOrder.push(lane.id);
        lane.rank = state.finishOrder.length;
        rankPills[lane.id].dataset.rank = String(lane.rank);
        rankPills[lane.id].textContent =
          lane.rank === 1 ? '1ST' : lane.rank === 2 ? '2ND' : '3RD';

        if (lane.rank === 1) {
          state.winnerId = lane.id;
          if (!reducedMotion) {
            state.phase = 'hitstop';
            state.hitStopTimer = 0.11;
            stageOverlay.dataset.phase = 'hitstop';
            overlayBadge.textContent = 'KO // ' + lane.fighter.name;
            overlaySub.textContent = 'WINNING SWAP LOCKED AT ' + lane.totalOps + ' OPS';
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
      for (let k = 0; k < BAR_COUNT; k++) {
        const bar = lane.bars[k];
        const nextVal = snap[k];
        if (bar.val !== nextVal) {
          if (nextVal > bar.peakHold) {
            bar.peakHold = nextVal;
          }
          bar.val = nextVal;
          if (!reducedMotion) {
            bar.yVel = -115;
          } else {
            bar.visualVal = nextVal;
          }
          bar.heat = 1;
        }
      }

      if (step.a >= 0 && step.a < BAR_COUNT) {
        lane.bars[step.a].heat = Math.max(lane.bars[step.a].heat, 0.85);
      }
      if (step.b >= 0 && step.b < BAR_COUNT) {
        lane.bars[step.b].heat = Math.max(lane.bars[step.b].heat, 0.85);
        sfx.playStep(lane.bars[step.b].val, step.type === 'swap');
      }

      if (state.phase === 'hitstop') {
        break;
      }
    }

    const instantRate = dt > 0 ? executed / dt : 0;
    lane.opsRateSmoothed = lane.opsRateSmoothed * 0.82 + instantRate * 0.18;
    updateLaneTelemetryDOM(lane);
  }

  function updateBarPhysics(dt) {
    let anyActive = false;

    for (let l = 0; l < 3; l++) {
      const lane = state.lanes[l];
      if (!lane) continue;

      if (state.phase === 'finish' && lane.id === state.winnerId && lane.sweepProgress < BAR_COUNT) {
        const prevIdx = Math.floor(lane.sweepProgress);
        lane.sweepProgress = Math.min(
          BAR_COUNT,
          lane.sweepProgress + (reducedMotion ? BAR_COUNT : dt * 78)
        );
        const currIdx = Math.floor(lane.sweepProgress);
        for (let k = prevIdx; k < currIdx && k < BAR_COUNT; k++) {
          lane.bars[k].locked = true;
          if (!reducedMotion) {
            lane.bars[k].yVel = -135;
            lane.bars[k].heat = 1;
          }
        }
        anyActive = true;
      }

      for (let k = 0; k < BAR_COUNT; k++) {
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

  function drawLaneCanvas(laneIdx) {
    const ctx = ctxs[laneIdx];
    const vp = viewports[laneIdx];
    const lane = state.lanes[laneIdx];
    if (!ctx || !lane) return;

    const w = vp.w;
    const h = vp.h;
    const fighter = lane.fighter;

    // Full backing-store clear (RunnerGame.tsx technique)
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvases[laneIdx].width, canvases[laneIdx].height);
    ctx.restore();

    // Subtle horizontal quartile grid lines
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    const topPad = 26;
    const bottomPad = 14;
    const usableH = Math.max(60, h - topPad - bottomPad);

    for (let q = 1; q <= 3; q++) {
      const gy = Math.round(topPad + (usableH * q) / 4);
      ctx.fillRect(0, gy, w, 1);
    }

    // 12-column vertical tick marks at bottom rail
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let t = 1; t < 12; t++) {
      const tx = Math.round((w * t) / 12);
      ctx.fillRect(tx, h - 6, 1, 6);
    }

    const padX = 12;
    const innerW = Math.max(120, w - padX * 2);
    const stepX = innerW / BAR_COUNT;
    const barW = Math.max(2, Math.floor(stepX - 2));

    // Active compare bracket beam
    if (lane.activeA >= 0 && lane.activeB >= 0 && state.phase !== 'idle') {
      const xa = Math.round(padX + lane.activeA * stepX + barW / 2);
      const xb = Math.round(padX + lane.activeB * stepX + barW / 2);
      const leftX = Math.min(xa, xb);
      const spanW = Math.max(2, Math.abs(xb - xa));

      ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.fillRect(xa - 1, topPad, 2, usableH);
      ctx.fillRect(xb - 1, topPad, 2, usableH);

      ctx.fillStyle = fighter.color;
      ctx.fillRect(leftX, topPad - 6, spanW, 2);
    }

    // Draw 32 bars
    for (let k = 0; k < BAR_COUNT; k++) {
      const bar = lane.bars[k];
      const norm = bar.visualVal / BAR_COUNT;
      const barH = Math.max(4, Math.round(norm * usableH));
      const x = Math.round(padX + k * stepX);
      const springY = Math.max(-10, Math.min(6, Math.round(bar.yOffset)));
      const y = Math.round(topPad + usableH - barH + springY);

      const isCompared = k === lane.activeA || k === lane.activeB;
      const isPivot = k === lane.pivotIdx;

      if (bar.locked) {
        ctx.fillStyle = '#f5c542';
      } else if (isCompared) {
        ctx.fillStyle = '#ffffff';
      } else if (bar.heat > 0.35) {
        ctx.fillStyle = fighter.colorHi;
      } else if (isPivot) {
        ctx.fillStyle = '#f5c542';
      } else {
        ctx.fillStyle = fighter.color;
      }

      // Main column body
      ctx.globalAlpha = bar.locked || isCompared ? 1 : 0.35 + norm * 0.58;
      ctx.fillRect(x, y + 3, barW, Math.max(1, barH - 3));

      // Crisp 2px pixel cap
      ctx.globalAlpha = 1;
      ctx.fillStyle = bar.locked
        ? '#fff3b0'
        : isCompared
          ? '#ffffff'
          : fighter.colorHi;
      ctx.fillRect(x, y, barW, 2);

      // Peak-hold afterimage dot
      if (bar.peakHold > bar.visualVal + 0.6) {
        const peakH = Math.round((bar.peakHold / BAR_COUNT) * usableH);
        const peakY = Math.round(topPad + usableH - peakH);
        ctx.fillStyle = fighter.color;
        ctx.globalAlpha = 0.55;
        ctx.fillRect(x, peakY, barW, 1);
        ctx.globalAlpha = 1;
      }
    }

    // Top-left & Top-right bitmap HUD inside canvas
    const sortedPairs = countSortedAdjacent(lane.bars);
    const pct = Math.round((sortedPairs / (BAR_COUNT - 1)) * 100);
    const leftHud = 'PROGRESS ' + String(pct).padStart(3, ' ') + '%';
    drawPixelText(ctx, leftHud, 12, 8, 'rgba(242, 245, 250, 0.65)', 2);

    let rightHud = 'READY';
    let rightColor = 'rgba(242, 245, 250, 0.5)';
    if (lane.finished) {
      rightHud =
        lane.rank === 1
          ? 'WINNER 1ST!'
          : 'FINISH #' + lane.rank;
      rightColor = lane.rank === 1 ? '#f5c542' : 'rgba(242, 245, 250, 0.55)';
    } else if (lane.activeA >= 0 && lane.activeB >= 0) {
      rightHud =
        'IDX ' +
        String(lane.activeA).padStart(2, '0') +
        ':' +
        String(lane.activeB).padStart(2, '0');
      rightColor = fighter.colorHi;
    }
    const rw = pixelTextWidth(rightHud, 2);
    drawPixelText(ctx, rightHud, w - rw - 12, 8, rightColor, 2);
  }

  function countSortedAdjacent(bars) {
    let count = 0;
    for (let i = 0; i < bars.length - 1; i++) {
      if (bars[i].val <= bars[i + 1].val) count++;
    }
    return count;
  }

  // Single requestAnimationFrame Loop with off-screen & visibility pause
  let rafId = 0;
  let lastFrameTime = 0;
  let stageIntersecting = true;

  function frame(now) {
    rafId = 0;
    const dt = Math.max(0, Math.min(0.05, (now - lastFrameTime) / 1000));
    lastFrameTime = now;

    let keepRunning = false;

    // 1. Credit count-up animation (easeOutExpo)
    if (state.creditAnimT < 1) {
      state.creditAnimT = Math.min(1, state.creditAnimT + dt / 0.62);
      const eased =
        state.creditAnimT === 1 ? 1 : 1 - Math.pow(2, -10 * state.creditAnimT);
      state.displayCredits =
        state.creditAnimFrom + (state.creditAnimTo - state.creditAnimFrom) * eased;
      creditsValue.textContent = Math.round(state.displayCredits).toLocaleString('en-US');
      keepRunning = true;
    }

    // 2. Restrained 3-frame finish shake
    if (state.shakeStep > 0) {
      state.shakeTimer -= dt;
      if (state.shakeTimer <= 0) {
        state.shakeStep--;
        state.shakeTimer = 0.032;
        cabinetRoot.dataset.shake = String(state.shakeStep);
      }
      keepRunning = true;
    }

    // 3. Phase state machine
    if (state.phase === 'countdown') {
      state.countdownTimer -= dt;
      if (state.countdownTimer <= 0) {
        state.countdownStep--;
        if (state.countdownStep > 0) {
          state.countdownTimer = 0.36;
          stageOverlay.dataset.phase = 'count-' + state.countdownStep;
          overlayBadge.textContent = String(state.countdownStep);
          sfx.playCountdown(false);
        } else if (state.countdownStep === 0) {
          state.countdownTimer = 0.24;
          stageOverlay.dataset.phase = 'count-go';
          overlayBadge.textContent = 'GO!';
          overlaySub.textContent = 'EXECUTING GENERATORS';
          sfx.playCountdown(true);
        } else {
          beginRacePhase();
        }
      }
      keepRunning = true;
    } else if (state.phase === 'hitstop') {
      state.hitStopTimer -= dt;
      if (state.hitStopTimer <= 0) {
        stageOverlay.dataset.phase = 'idle';
        state.phase = 'racing';
        if (!reducedMotion) {
          state.shakeStep = 3;
          state.shakeTimer = 0.032;
          cabinetRoot.dataset.shake = '3';
        }
      }
      keepRunning = true;
    } else if (state.phase === 'racing') {
      for (let i = 0; i < 3; i++) {
        stepLaneSimulation(state.lanes[i], dt);
        if (state.phase === 'hitstop') break;
      }
      if (state.phase === 'racing' && state.lanes.every((l) => l.finished)) {
        resolveRaceFinish();
      }
      keepRunning = true;
    }

    // 4. Bar springs & peak hold
    if (updateBarPhysics(dt)) {
      keepRunning = true;
    }

    // 5. Render all 3 lane canvases in this single rAF callback
    for (let i = 0; i < 3; i++) {
      drawLaneCanvas(i);
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

  // ResizeObserver caches canvas dimensions outside the rAF loop
  const resizeObserver = new ResizeObserver((entries) => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    for (const entry of entries) {
      const idx = canvases.indexOf(entry.target);
      if (idx === -1) continue;
      const cssW = Math.max(160, Math.round(entry.contentRect.width));
      const cssH = Math.max(120, Math.round(entry.contentRect.height));
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

  // IntersectionObserver & visibilitychange pause loop when off-screen or hidden
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
  intersectionObserver.observe(arenaStage);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    } else if (!document.hidden) {
      requestTick();
    }
  });

  // Event Listeners
  fighterBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      state.selectedFighter = idx;
      syncHudAndControls();
      announce('Selected fighter ' + FIGHTERS[idx].name + ' at ' + state.odds[idx].toFixed(1) + 'x odds.');
    });
  });

  wagerBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      state.wagerMode = btn.dataset.wager || '100';
      syncHudAndControls();
    });
  });

  function togglePowerUp(mode) {
    state.powerMode = state.powerMode === mode ? 'none' : mode;
    state.phase = 'idle';
    setupSeedAndLanes();
    announce(
      state.powerMode === 'none'
        ? 'Power-up cleared. Standard random shuffle.'
        : 'Activated ' + mode + ' seed power-up. Odds updated.'
    );
  }

  powerNearlyBtn.addEventListener('click', () => togglePowerUp('nearly'));
  powerReverseBtn.addEventListener('click', () => togglePowerUp('reverse'));

  newSeedBtn.addEventListener('click', () => {
    state.seed = ((state.seed * 22695477 + 1) % 9000) + 100;
    state.phase = 'idle';
    setupSeedAndLanes();
    announce('Dealt new seed #' + String(state.seed).padStart(4, '0'));
  });

  startRaceBtn.addEventListener('click', () => {
    triggerRoundStart();
  });

  sfxBtn.addEventListener('click', () => {
    const on = sfx.toggle();
    sfxBtn.setAttribute('aria-pressed', String(on));
    sfxLabel.textContent = on ? 'SFX ON' : 'SFX OFF';
  });

  resetBankBtn.addEventListener('click', () => {
    state.streak = 0;
    startCreditCountUp(STARTING_CREDITS);
    creditsDelta.dataset.tone = 'neutral';
    creditsDelta.textContent = 'BANK RESET';
    syncHudAndControls();
    requestTick();
    announce('Credit bank reset to 1,000 credits.');
  });

  // Keyboard Controls
  window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const busy =
      state.phase === 'countdown' ||
      state.phase === 'racing' ||
      state.phase === 'hitstop';

    if (e.code === 'Digit1' && !busy) {
      state.selectedFighter = 0;
      syncHudAndControls();
    } else if (e.code === 'Digit2' && !busy) {
      state.selectedFighter = 1;
      syncHudAndControls();
    } else if (e.code === 'Digit3' && !busy) {
      state.selectedFighter = 2;
      syncHudAndControls();
    } else if (e.code === 'KeyQ' && !busy) {
      togglePowerUp('nearly');
    } else if (e.code === 'KeyW' && !busy) {
      togglePowerUp('reverse');
    } else if (e.code === 'KeyR' && !busy) {
      newSeedBtn.click();
    } else if (
      (e.code === 'Space' || e.code === 'Enter') &&
      document.activeElement === document.body
    ) {
      e.preventDefault();
      triggerRoundStart();
    }
  });

  // Initialize
  state.highScores = loadHighScores();
  renderHighScores();
  setupSeedAndLanes();
})();
