/* ==========================================================================
   SIGNAL ROOM — the page is the receiver.
   One rAF loop. One scroll read per frame. No layout reads in the loop.
   Noise→resolve is deterministic from scroll: every glyph owns fixed,
   seeded offsets, so scrubbing backwards replays exactly.
   ========================================================================== */

(() => {
  "use strict";

  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const $ = (id) => document.getElementById(id);

  /* Window of the dial over which an entry's type is noise, half-resolved,
     or razor sharp. Tuned against the section heights, in page progress. */
  const INNER = 0.06;
  const OUTER = 0.15;
  /* how much band the page sweeps, in kHz */
  const SPAN = 60;
  /* the lock is a moment, not a band: the needle snaps to the carrier */
  const LOCK_W = 0.022;

  const carriers = [];

  /* --- Chrome clock ------------------------------------------------------- */
  const clockEl = $("clock");

  function tickClock() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    clockEl.textContent = `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} UTC`;
  }

  /* --- Deterministic per-glyph randomness --------------------------------- */
  function hash(n) {
    n = (n ^ 61) ^ (n >>> 16);
    n = n + (n << 3);
    n = n ^ (n >>> 4);
    n = Math.imul(n, 0x27d4eb2d);
    n = n ^ (n >>> 15);
    return (n >>> 0) / 4294967295;
  }

  /* --- Build the noise layer --------------------------------------------- */
  /* The real string stays in the DOM inside .sr so screen readers read it;
     the animated per-glyph layer is an aria-hidden duplicate. */
  let hostSeed = 0;

  function noisify(host) {
    const text = host.textContent.replace(/\s+/g, " ").trim();
    const sr = document.createElement("span");
    sr.className = "sr";
    sr.textContent = text;

    const noise = document.createElement("span");
    noise.className = "noise";
    noise.setAttribute("aria-hidden", "true");

    const words = [];
    const seed = (hostSeed += 977);
    text.split(" ").forEach((word, wi) => {
      if (wi > 0) noise.appendChild(document.createTextNode(" "));
      const w = document.createElement("span");
      w.className = "w";
      for (let gi = 0; gi < word.length; gi++) {
        const g = document.createElement("span");
        g.className = "g";
        g.textContent = word[gi];
        const s = seed + wi * 31 + gi * 7;
        g.style.setProperty("--dx", (hash(s) * 2 - 1).toFixed(2));
        g.style.setProperty("--dy", (hash(s + 101) * 1.2 - 0.6).toFixed(2));
        g.style.setProperty("--dr", (hash(s + 211) * 2 - 1).toFixed(2));
        g.style.setProperty("--drop", (hash(s + 307) * 0.92).toFixed(2));
        w.appendChild(g);
      }
      noise.appendChild(w);
      words.push({ el: w, n: -1, t: 0 });
    });

    host.replaceChildren(sr, noise);
    return words;
  }

  function build() {
    document.querySelectorAll("[data-ci]").forEach((el) => {
      const carrier = {
        el,
        ci: parseFloat(el.dataset.ci),
        freq: el.dataset.freq,
        climax: el.hasAttribute("data-climax"),
        r: -1,
        armed: true,
        words: [],
      };
      /* reduced motion keeps the plain text: nothing is split, nothing moves */
      if (!reduce.matches) {
        el.querySelectorAll("[data-noisify], .passage").forEach((host) => {
          carrier.words.push(...noisify(host));
        });
      }
      const n = carrier.words.length;
      carrier.words.forEach((w, i) => {
        w.t = n > 1 ? 0.04 + 0.72 * (i / (n - 1)) : 0.2;
      });
      carriers.push(carrier);
    });
  }

  /* --- Resolve curve ------------------------------------------------------ */
  function resolveAt(t, ci) {
    const d = Math.abs(t - ci);
    if (d <= INNER) return 1;
    if (d >= OUTER) return 0;
    const k = (OUTER - d) / (OUTER - INNER);
    return k * k * (3 - 2 * k);
  }

  function applyWords(carrier) {
    const r = carrier.r;
    for (let i = 0; i < carrier.words.length; i++) {
      const w = carrier.words[i];
      const wr = r <= w.t ? 0 : r >= 1 ? 1 : (r - w.t) / (1 - w.t);
      const n = Math.round((1 - wr) * 25) / 25;
      if (n !== w.n) {
        w.n = n;
        w.el.style.setProperty("--n", String(n));
      }
    }
  }

  /* --- Geometry (measured, never inside the loop) ------------------------- */
  const m = { max: 1, railW: 1, bandLow: 8388 };

  function measure() {
    m.max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    m.railW = Math.max(1, dialRail.clientWidth);

    /* anchors from the real layout, so the type is razor sharp exactly when
       its passage sits in the clear band between chrome and dial */
    const vh = window.innerHeight;
    const chromeEl = document.querySelector(".chrome");
    const safeCentre = (chromeEl.offsetHeight + (vh - dial.offsetHeight)) / 2;
    for (let i = 0; i < carriers.length; i++) {
      const c = carriers[i];
      const r = c.el.getBoundingClientRect();
      const centre = window.scrollY + r.top + r.height / 2 - safeCentre;
      c.ci = Math.min(1, Math.max(0, centre / m.max));
    }

    /* the band is derived: the carrier reads exactly its authored frequency */
    const pin = carriers.find((c) => c.climax);
    if (pin) {
      m.bandLow = parseFloat(pin.freq) - pin.ci * SPAN;
      dialBand.textContent = `Band ${m.bandLow.toFixed(1)} – ${(m.bandLow + SPAN).toFixed(1)} kHz`;
    }

    syncMarks();
    lastRead = "";
    lastAria = "";
  }

  function freqOf(c) {
    return (m.bandLow + c.ci * SPAN).toFixed(1);
  }

  /* --- Background trace (full-bleed oscilloscope) ------------------------- */
  const trace = $("trace");
  const tctx = trace.getContext("2d");
  const grain = $("grain");
  const gctx = grain.getContext("2d");
  const grainSize = 190;
  let gdata = null;

  function sizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    trace.width = Math.round(w * dpr);
    trace.height = Math.round(h * dpr);
    trace.dataset.w = String(w);
    trace.dataset.h = String(h);
    tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function initGrain() {
    grain.width = grainSize;
    grain.height = grainSize;
    gdata = gctx.createImageData(grainSize, grainSize);
  }

  function paintGrain() {
    const d = gdata.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = hash((i + (performance.now() | 0)) | 0);
      d[i] = 233;
      d[i + 1] = 230;
      d[i + 2] = 223;
      d[i + 3] = v > 0.986 ? 255 : v > 0.955 ? 90 : 0;
    }
    gctx.putImageData(gdata, 0, 0);
  }

  function drawTrace(t, r, accent) {
    const w = Number(trace.dataset.w);
    const h = Number(trace.dataset.h);
    const mid = h * 0.6;
    const amp = h * (0.02 + 0.095 * r) * (accent ? 1.3 : 1);
    const noise = 1 - r;
    const step = 4;
    const path = new Path2D();

    /* clearing the whole viewport each frame costs ~5M pixel writes at DPR 2;
       the trace only ever lives in this band */
    const band = h * 0.2;
    tctx.clearRect(0, mid - band, w, band * 2);

    for (let x = 0; x <= w; x += step) {
      const u = x / w;
      const jitter =
        Math.sin(x * 0.09 + t * 2.3) * 0.6 +
        Math.sin(x * 0.031 - t * 1.7) * 0.3 +
        (Math.random() - 0.5) * 1.1;
      const pulse = 0.28 + 0.72 * Math.pow(Math.max(0, Math.sin(u * Math.PI * 5 - t * 0.6)), 0.4);
      const carrier = Math.sin(x * 0.055 + t * 2.6) * pulse;
      const y = mid + (carrier * r + jitter * noise) * amp;
      if (x === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    }

    const colour = accent ? "255, 176, 0" : "233, 230, 223";
    tctx.lineJoin = "round";
    tctx.lineCap = "round";

    tctx.strokeStyle = `rgba(${colour}, ${0.035 + 0.06 * r})`;
    tctx.lineWidth = 3.5;
    tctx.stroke(path);

    tctx.strokeStyle = `rgba(${colour}, ${0.1 + 0.24 * r + (accent ? 0.26 : 0)})`;
    tctx.lineWidth = 1;
    tctx.stroke(path);

    tctx.strokeStyle = "rgba(233, 230, 223, 0.05)";
    tctx.lineWidth = 1;
    tctx.beginPath();
    tctx.moveTo(0, Math.round(mid) + 0.5);
    tctx.lineTo(w, Math.round(mid) + 0.5);
    tctx.stroke();
  }

  /* --- Dial --------------------------------------------------------------- */
  const dial = $("dial");
  const dialRail = $("dialRail");
  const dialMarks = $("dialMarks");
  const dialNeedle = $("dialNeedle");
  const dialRead = $("dialRead");
  const dialMode = $("dialMode");
  const dialBand = document.querySelector(".dial-band");

  function syncMarks() {
    dialMarks.replaceChildren();
    carriers.forEach((c) => {
      if (!c.el.dataset.entry) return;
      const mark = document.createElement("i");
      mark.style.left = `${c.ci * 100}%`;
      const label = document.createElement("b");
      label.textContent = c.el.dataset.entry;
      const freq = document.createElement("em");
      freq.textContent = ` ${freqOf(c)}`;
      label.appendChild(freq);
      dialMarks.appendChild(mark);
      dialMarks.appendChild(label);
    });
  }

  let lastRead = "";
  let lastMode = "";
  let lastAria = "";

  function updateDial(t, rMax, lock) {
    /* on lock the instrument reports the carrier, not the needle's raw lie */
    const f = lock ? parseFloat(lock.freq) : m.bandLow + t * SPAN;
    const read = `${f.toFixed(1)} kHz`;
    if (read !== lastRead) {
      lastRead = read;
      dialRead.textContent = read;
    }

    const mode = lock
      ? "Carrier lock"
      : t > 0.985
        ? "Band exhausted"
        : rMax >= 0.995
          ? "Signal resolution"
          : rMax > 0.3
            ? "Resolving"
            : "Acquiring";
    if (mode !== lastMode) {
      lastMode = mode;
      dialMode.textContent = mode;
    }

    const aria = `${Math.round(t * 100)} percent — ${read} — ${mode}`;
    if (aria !== lastAria) {
      lastAria = aria;
      dial.setAttribute("aria-valuenow", String(Math.round(t * 100)));
      dial.setAttribute("aria-valuetext", aria);
    }

    const pos = lock ? lock.ci : t;
    dialNeedle.style.transform = `translate3d(${(pos * (m.railW - 1)).toFixed(2)}px,0,0)`;
  }

  /* --- Audio (optional, off by default) ----------------------------------- */
  const audio = (() => {
    const button = $("audioBtn");
    let ctx = null;
    let nodes = null;
    let playing = false;

    function buildAudio() {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      const len = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 240;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.05;
      noise.connect(lp).connect(noiseGain);

      const tone = ctx.createOscillator();
      tone.type = "sine";
      tone.frequency.value = 1200;
      const toneGain = ctx.createGain();
      toneGain.gain.value = 0.006;
      const cadence = ctx.createOscillator();
      cadence.frequency.value = 1 / 4.302;
      const depth = ctx.createGain();
      depth.gain.value = 0.004;
      cadence.connect(depth).connect(toneGain.gain);
      tone.connect(toneGain);

      const master = ctx.createGain();
      master.gain.value = 0;
      noiseGain.connect(master);
      toneGain.connect(master);
      master.connect(ctx.destination);
      noise.start();
      tone.start();
      cadence.start();
      nodes = { master, noiseGain, toneGain };
      return nodes;
    }

    button.addEventListener("click", () => {
      if (!ctx) buildAudio();
      ctx.resume();
      playing = !playing;
      const t = ctx.currentTime;
      nodes.master.gain.cancelScheduledValues(t);
      nodes.master.gain.linearRampToValueAtTime(playing ? 1 : 0, t + 1.1);
      button.setAttribute("aria-pressed", String(playing));
      button.textContent = playing ? "Audio · On" : "Audio · Off";
    });

    return {
      /* the carrier drone tracks the signal; the noise floor tracks the static */
      setSignal(r) {
        if (!nodes || !playing) return;
        nodes.toneGain.gain.value = 0.004 + 0.022 * r;
        nodes.noiseGain.gain.value = 0.018 + 0.06 * (1 - r);
      },
      /* the lock is half a second of near-silence */
      duck() {
        if (!nodes || !playing) return;
        const t = ctx.currentTime;
        nodes.master.gain.cancelScheduledValues(t);
        nodes.master.gain.setValueAtTime(nodes.master.gain.value, t);
        nodes.master.gain.linearRampToValueAtTime(0.02, t + 0.05);
        nodes.master.gain.linearRampToValueAtTime(1, t + 0.56);
      },
    };
  })();

  /* --- The lock ----------------------------------------------------------- */
  const flash = $("flash");
  let silenceUntil = 0;
  let slamTimer = 0;

  function fireLock(carrier) {
    flash.classList.remove("is-on");
    void flash.offsetWidth;
    flash.classList.add("is-on");

    if (carrier) {
      carrier.el.classList.add("is-slam");
      clearTimeout(slamTimer);
      slamTimer = window.setTimeout(() => carrier.el.classList.remove("is-slam"), 700);
    }

    audio.duck();
    silenceUntil = performance.now() + 520;
  }

  /* --- The loop ----------------------------------------------------------- */
  const traceOn = !reduce.matches;
  let raf = 0;
  let lastT = 0;
  let frames = 0;
  let lastGrainOpacity = -1;
  let locked = false;
  let staticDrawn = false;

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - (lastT || now)) / 1000, 0.05);
    lastT = now;
    frames++;

    const t = Math.min(1, Math.max(0, window.scrollY / m.max));

    let rMax = 0;
    let lock = null;
    for (let i = 0; i < carriers.length; i++) {
      const c = carriers[i];
      const r = resolveAt(t, c.ci);
      if (r > rMax) rMax = r;
      if (Math.abs(r - c.r) > 0.0015) {
        c.r = r;
        applyWords(c);
      }
      if (c.climax) {
        const d = Math.abs(t - c.ci);
        if (c.armed && d <= LOCK_W) {
          c.armed = false;
          fireLock(c);
        } else if (!c.armed && d > OUTER) {
          c.armed = true;
        }
        if (d <= LOCK_W) lock = c;
      }
    }

    if (!!lock !== locked) {
      locked = !!lock;
      dial.classList.toggle("is-lock", locked);
      for (let i = 0; i < carriers.length; i++) {
        if (carriers[i].climax) carriers[i].el.classList.toggle("is-lock", locked);
      }
    }

    updateDial(t, rMax, lock);

    if (!traceOn) return;

    const accent = now < silenceUntil;
    drawTrace(now / 1000, rMax, accent);
    audio.setSignal(rMax);

    if (now > silenceUntil && rMax < 0.9 && frames % 8 === 0) paintGrain();
    const g = Math.round((0.03 + 0.12 * (1 - rMax)) * 100) / 100;
    if (g !== lastGrainOpacity) {
      lastGrainOpacity = g;
      grain.style.opacity = String(g);
    }
  }

  /* --- Reduced motion: static but complete -------------------------------- */
  function staticTrace() {
    sizeCanvas();
    drawTrace(0, 1, false);
    grain.style.opacity = "0.04";
    if (!staticDrawn) {
      initGrain();
      paintGrain();
      staticDrawn = true;
    }
  }

  function updateDialOnly() {
    const t = Math.min(1, Math.max(0, window.scrollY / m.max));
    let rMax = 0;
    let lock = null;
    for (let i = 0; i < carriers.length; i++) {
      const r = resolveAt(t, carriers[i].ci);
      if (r > rMax) rMax = r;
      if (carriers[i].climax && Math.abs(t - carriers[i].ci) <= LOCK_W) lock = carriers[i];
    }
    updateDial(t, rMax, lock);
  }

  /* --- Boot --------------------------------------------------------------- */
  function onResize() {
    measure();
    if (reduce.matches) staticTrace();
  }

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(onResize, 150);
  });

  $("toTop").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduce.matches ? "auto" : "smooth" });
  });

  build();
  measure();
  tickClock();
  window.setInterval(tickClock, 1000);

  if (reduce.matches) {
    carriers.forEach((c) => {
      c.r = 1;
    });
    staticTrace();
    measure();
    updateDialOnly();
    window.addEventListener("scroll", updateDialOnly, { passive: true });
  } else {
    sizeCanvas();
    initGrain();
    paintGrain();
    raf = requestAnimationFrame(frame);
    document.fonts.ready.then(measure);
    window.addEventListener("load", measure);
  }
})();
