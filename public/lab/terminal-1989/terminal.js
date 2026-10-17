(() => {
"use strict";

var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var COARSE = window.matchMedia("(pointer: coarse)").matches;

var cabinet = document.getElementById("cabinet");
var screenEl = document.getElementById("screen");
var crtWrap = document.getElementById("crtWrap");
var canvas = document.getElementById("crt");
var powerBtn = document.getElementById("powerSwitch");
var led = document.getElementById("led");
var kbd = document.getElementById("kbd");
var chipsEl = document.getElementById("chips");
var srlive = document.getElementById("srlive");

if (!cabinet || !screenEl || !canvas) return;

var PAL = {
  bg: "#04120b",
  p: "#8ef3a6", d: "#4e9a70", a: "#ffcf87", h: "#eefff4", k: "#c9f7d6"
};
var GLOW = {
  p: "rgba(110,255,170,0.85)", d: "rgba(110,255,170,0.22)",
  a: "rgba(255,205,120,0.8)", h: "rgba(190,255,220,0.95)", k: "rgba(150,255,190,0.4)"
};

var lines = [];
var typed = "";
var hist = [];
var histAt = -1;
var mode = "off";
var caretOn = true;
var textDirty = true;
var glDirty = true;
var scrollBack = 0;
var queuedCmd = null;
var degauss = 0;

var cols = 80, rows = 26, charW = 10, lineH = 22, fs = 16, padX = 12, padY = 12;
var bufferW = 0, bufferH = 0;

var textCanvas = document.createElement("canvas");
var tctx = textCanvas.getContext("2d");
var inkCanvas = document.createElement("canvas");
var ictx = inkCanvas.getContext("2d");
var bloomCanvas = document.createElement("canvas");
var bctx = bloomCanvas.getContext("2d");
var ghostCanvas = document.createElement("canvas");
var ghostReady = false;
var ghostOn = false;
var bloomFilter = "none";
var fctx = null;
var gl = null, prog = null, glLocs = null, glTex = null;
var useGL = false;
var startedAt = performance.now();

function fontStr() {
  return "600 " + fs.toFixed(2) + "px 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
}

function layout() {
  var r = screenEl.getBoundingClientRect();
  var w = Math.max(1, r.width), h = Math.max(1, r.height);
  var dpr = Math.min(2, window.devicePixelRatio || 1);
  var bw = Math.min(1180, Math.max(320, Math.round(w * dpr)));
  var bh = Math.max(240, Math.round(bw * h / w));
  bufferW = bw; bufferH = bh;
  canvas.width = bw; canvas.height = bh;
  textCanvas.width = bw; textCanvas.height = bh;
  inkCanvas.width = bw; inkCanvas.height = bh;
  bloomCanvas.width = Math.max(80, bw >> 2); bloomCanvas.height = Math.max(60, bh >> 2);
  bloomFilter = "blur(" + Math.max(1.2, fs * 0.11).toFixed(1) + "px)";
  try { bctx.filter = bloomFilter; if (bctx.filter !== bloomFilter) bloomFilter = "none"; bctx.filter = "none"; } catch (e) { bloomFilter = "none"; }
  fs = Math.max(10, Math.round(bw / 80 / 0.6));
  tctx.font = fontStr();
  charW = tctx.measureText("M").width || fs * 0.6;
  charW = bw / Math.max(60, Math.round(bw / charW));
  lineH = Math.round(fs * 1.42);
  padX = Math.round(fs * 0.9); padY = Math.round(fs * 0.72);
  cols = Math.max(36, Math.floor((bw - padX * 2) / charW));
  rows = Math.max(10, Math.floor((bh - padY * 2) / lineH));
  if (lines.length > rows - 1) lines = lines.slice(lines.length - (rows - 1));
  scrollBack = Math.min(scrollBack, Math.max(0, lines.length - (rows - 1)));
  if (bootCtl) resetBootRows();
  textDirty = true; glDirty = true;
}

function seg(c, t) { return { t: t, c: c }; }
function line1(c, t) { return { s: [seg(c, t)] }; }
function blank() { return { s: [] }; }
function trim() { if (lines.length > 160) lines = lines.splice(lines.length - 160); }
function outOf(s) { var x = ""; for (var i = 0; i < s.length; i++) x += s[i].t; return x; }

function addLine(c, t) { lines.push(line1(c, t)); trim(); }
function addObj(o) { lines.push(o); trim(); }
function addMany(arr, c) {
  for (var i = 0; i < arr.length; i++) addLine(c, arr[i]);
}

function paint() {
  var t = tctx;
  var a = ictx;
  a.setTransform(1, 0, 0, 1, 0, 0);
  a.clearRect(0, 0, bufferW, bufferH);
  a.font = fontStr();
  a.textBaseline = "top";
  var vis = rows - 1;
  var end = lines.length - scrollBack;
  var first = Math.max(0, end - vis);
  var sy = padY;
  for (var i = first; i < end; i++) {
    var o = lines[i];
    var y = sy + (i - first) * lineH;
    var x = padX;
    if (!o.s.length) continue;
    for (var j = 0; j < o.s.length; j++) {
      var sg = o.s[j];
      var cl = PAL[sg.c] ? sg.c : "p";
      a.fillStyle = PAL[cl];
      a.shadowColor = GLOW[cl];
      a.shadowBlur = cl === "d" ? fs * 0.22 : fs * 0.36;
      a.fillText(sg.t, x, y);
      x += sg.t.length * charW;
    }
  }
  if (scrollBack === 0 && (mode === "prompt" || mode === "boot")) {
    var prow = Math.min(end - first, vis);
    var py = sy + prow * lineH;
    var ptxt = "> " + typed;
    a.fillStyle = PAL.k; a.shadowColor = GLOW.k; a.shadowBlur = fs * 0.36;
    a.fillText(ptxt, padX, py);
    if (caretOn) {
      a.fillStyle = PAL.k;
      a.fillRect(padX + ptxt.length * charW, py + fs * 0.06, charW, fs * 1.04);
    }
  }
  a.shadowBlur = 0;
  t.fillStyle = PAL.bg;
  t.fillRect(0, 0, bufferW, bufferH);
  if (ghostOn && ghostReady) {
    t.globalAlpha = 0.06;
    t.drawImage(ghostCanvas, 0, 0);
    t.globalAlpha = 1;
  }
  t.drawImage(inkCanvas, 0, 0);
  bctx.setTransform(1, 0, 0, 1, 0, 0);
  bctx.clearRect(0, 0, bloomCanvas.width, bloomCanvas.height);
  bctx.filter = bloomFilter;
  bctx.drawImage(inkCanvas, 0, 0, bloomCanvas.width, bloomCanvas.height);
  bctx.filter = "none";
  t.globalCompositeOperation = "lighter";
  t.globalAlpha = 0.5;
  t.drawImage(bloomCanvas, 0, 0, bufferW, bufferH);
  t.globalAlpha = 0.3;
  t.drawImage(bloomCanvas, -fs * 0.3, -fs * 0.3, bufferW + fs * 0.6, bufferH + fs * 0.6);
  t.globalAlpha = 1;
  t.globalCompositeOperation = "source-over";
  textDirty = false; glDirty = true;
}

function captureGhost() {
  if (!ghostCanvas.width) { ghostCanvas.width = bufferW; ghostCanvas.height = bufferH; }
  if (ghostCanvas.width !== bufferW || ghostCanvas.height !== bufferH) {
    ghostCanvas.width = bufferW; ghostCanvas.height = bufferH;
  }
  var g = ghostCanvas.getContext("2d");
  g.clearRect(0, 0, bufferW, bufferH);
  g.drawImage(textCanvas, 0, 0);
  ghostReady = true;
}

function uploadGL() {
  gl.bindTexture(gl.TEXTURE_2D, glTex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  glDirty = false;
}

var MIT_CRT = "Adapted from the threeui CRT WebGL shader, MIT License, © threeui contributors (barrel curvature, aperture grille, scanlines, rolling bar, vignette, hash noise) — original: threeui repo src/shaders/crt";
var VERT = "attribute vec2 aPos;void main(){ gl_Position=vec4(aPos,0.0,1.0); }";
/* Fragment shader follows the MIT-licensed threeui CRT shader: " + MIT_CRT */
var FRAG = [
  "precision highp float;",
  "uniform sampler2D uTex;uniform vec2 uRes;uniform float uTime;uniform float uMotion;uniform float uDegauss;",
  "float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }",
  "vec2 curve(vec2 uv){ uv=uv*2.0-1.0; vec2 o=uv.yx*uv.yx; uv+=uv*o*vec2(0.085,0.125); return uv*0.5+0.5; }",
  "void main(){",
  "  vec2 fuv=gl_FragCoord.xy/uRes;",
  "  vec2 uv=curve(fuv);",
  "  uv.x+=sin(uv.y*36.0+uTime*26.0)*0.005*uDegauss;",
  "  vec2 inb=step(vec2(0.0),uv)*step(uv,vec2(1.0));",
  "  float inside=inb.x*inb.y;",
  "  vec2 ed=min(uv,1.0-uv);",
  "  inside*=smoothstep(0.0,0.020,min(ed.x,ed.y));",
  "  vec2 dir=uv-0.5; float d2=dot(dir,dir);",
  "  vec2 ao=dir*(0.0011+0.009*d2);",
  "  vec3 col;",
  "  col.r=mix(texture2D(uTex,uv+ao).r,texture2D(uTex,uv).g,0.42);",
  "  col.g=texture2D(uTex,uv).g;",
  "  col.b=mix(texture2D(uTex,uv-ao).b,texture2D(uTex,uv).g,0.42);",
  "  float lines=uRes.y*0.92;",
  "  float sl=sin(uv.y*3.14159265*lines+uTime*4.0*uMotion);",
  "  col*=mix(0.70,1.0,sl*sl);",
  "  float gx=gl_FragCoord.x*(6.2831853/3.0);",
  "  vec3 grille=0.66+0.34*cos(gx+vec3(0.0,2.094,4.188));",
  "  col*=grille*1.34;",
  "  float bar=fract(uv.y*0.5-uTime*0.07*uMotion);",
  "  bar=smoothstep(0.0,0.05,bar)*smoothstep(0.18,0.05,bar);",
  "  col+=bar*0.045*uMotion;",
  "  float sheen=smoothstep(0.55,0.0,distance(uv,vec2(0.50,0.15)));",
  "  col+=sheen*0.030*vec3(0.55,1.0,0.72);",
  "  float vig=smoothstep(0.98,0.30,length((uv-0.5)*vec2(1.05,1.0)));",
  "  col*=mix(0.42,1.0,vig);",
  "  col*=1.0-0.028*uMotion*sin(uTime*8.0);",
  "  col+=(hash(fuv+fract(uTime*0.37))-0.5)*0.022;",
  "  float spill=smoothstep(0.85,0.18,length(fuv-0.5))*0.05;",
  "  vec3 room=vec3(0.012,0.03,0.022)+vec3(0.0,spill*0.6,spill*0.42);",
  "  col=mix(room,col,inside);",
  "  col=max(col,vec3(0.004,0.010,0.008));",
  "  gl_FragColor=vec4(col,1.0);",
  "}"
].join("\n");

function compile(glx, type, src) {
  var sh = glx.createShader(type);
  glx.shaderSource(sh, src);
  glx.compileShader(sh);
  if (!glx.getShaderParameter(sh, glx.COMPILE_STATUS)) throw new Error("shader");
  return sh;
}

function freshCanvas() {
  var n = document.createElement("canvas");
  n.id = "crt";
  n.setAttribute("aria-hidden", "true");
  canvas.parentNode.replaceChild(n, canvas);
  canvas = n;
}

function glProbe() {
  try {
    var pc = document.createElement("canvas");
    pc.width = 4; pc.height = 4;
    var g = pc.getContext("webgl");
    if (!g) return false;
    compile(g, g.VERTEX_SHADER, VERT);
    compile(g, g.FRAGMENT_SHADER, FRAG);
    return true;
  } catch (e) {
    return false;
  }
}

function initGL() {
  if (REDUCED || !glProbe()) return false;
  try {
    var g = canvas.getContext("webgl", { antialias: false, alpha: false, depth: false });
    if (!g) return false;
    var vs = compile(g, g.VERTEX_SHADER, VERT);
    var fsx = compile(g, g.FRAGMENT_SHADER, FRAG);
    var p = g.createProgram();
    g.attachShader(p, vs); g.attachShader(p, fsx); g.linkProgram(p);
    if (!g.getProgramParameter(p, g.LINK_STATUS)) throw new Error("link");
    g.useProgram(p);
    var buf = g.createBuffer();
    g.bindBuffer(g.ARRAY_BUFFER, buf);
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW);
    var aPos = g.getAttribLocation(p, "aPos");
    g.enableVertexAttribArray(aPos);
    g.vertexAttribPointer(aPos, 2, g.FLOAT, false, 0, 0);
    glTex = g.createTexture();
    g.bindTexture(g.TEXTURE_2D, glTex);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
    glLocs = {
      uTex: g.getUniformLocation(p, "uTex"),
      uRes: g.getUniformLocation(p, "uRes"),
      uTime: g.getUniformLocation(p, "uTime"),
      uMotion: g.getUniformLocation(p, "uMotion"),
      uDegauss: g.getUniformLocation(p, "uDegauss")
    };
    g.uniform1i(glLocs.uTex, 0);
    g.uniform1f(glLocs.uMotion, 1);
    g.uniform1f(glLocs.uDegauss, 0);
    gl = g; prog = p; useGL = true;
    return true;
  } catch (e) {
    gl = null; useGL = false;
    freshCanvas();
    return false;
  }
}

function flatSetup() {
  canvas.width = bufferW; canvas.height = bufferH;
  fctx = canvas.getContext("2d");
  if (!fctx) return false;
  screenEl.classList.add("screen--flat");
  paint();
  fctx.drawImage(textCanvas, 0, 0);
  return true;
}

glDirty = false;
function paintNow() {
  paint();
  if (useGL) { uploadGL(); gl.useProgram(prog); gl.uniform2f(glLocs.uRes, bufferW, bufferH); gl.viewport(0, 0, bufferW, bufferH); gl.uniform1f(glLocs.uTime, 0.02); gl.drawArrays(gl.TRIANGLES, 0, 3); }
  else if (fctx) fctx.drawImage(textCanvas, 0, 0);
}

var bootCtl = null;
var MEM_TOTAL_K = 8192;
var MEM_LINE = line1("p", "");
var HEAD = [
  line1("h", "VANTAGE SYSTEMS VX/86 ROM BIOS  v2.31"),
  line1("d", "HALCYON MICRO SYSTEMS HX-88 · SN V1R2-0104-88"),
  blank(),
  line1("p", "CPU      NSV V8 @ 16 MHz        [ OK ]"),
  line1("p", "CACHE    32 KB SYNC BURST      [ OK ]"),
  MEM_LINE,
  line1("p", "DRIVE A  1.44 MB FLOPPY · NO MEDIA"),
  line1("p", "DRIVE X  SCHRAM TILE 8x8       [ LOADED ]"),
  line1("d", "QUEUE    64 SPRITES · BANKS 4 · TAIL WATCH"),
  blank(),
  line1("p", "BOOT     VX/86 0.9.4 · BUILD 1138 · 14 OCT 1989"),
  line1("d", "TASKS    44 LOADED · 7680K EXTENDED"),
  blank(),
  line1("h", "VXFIX 0.9.4 COMMAND SHELL READY"),
  line1("d", "TYPE HELP · TRY: CAT DEBUG.LOG · RUN SPRITE")
];
var TAIL = HEAD.length - 10;
var MEM_OK = "MEM      8192K · 4 BANKS · PARITY SOFT";

function startBoot() {
  mode = "boot";
  lines = []; typed = ""; histAt = -1;
  scrollBack = 0;
  MEM_LINE.s = [seg("p", "MEM      [" + "·".repeat(18) + "] 0000K")];
  textDirty = true;
  ghostOn = ghostReady;
  if (REDUCED) {
    MEM_LINE.s = [seg("p", MEM_OK)];
    lines = HEAD.slice();
    bootCtl = null;
    ghostOn = false;
    finishBoot();
    paintNow();
    return;
  }
  degauss = 0.9;
  var i;
  for (i = 0; i < 2; i++) lines.push(HEAD[i]);
  lines.push(MEM_LINE);
  bootCtl = { phase: "mem", t: 0, nextIdx: 2, delay: 0.55 };
  textDirty = true;
}
function resetBootRows() {
  if (lines.length > rows - 1) lines = lines.slice(lines.length - (rows - 1));
}
function easeOutExpo(p) { return p >= 1 ? 1 : 1 - Math.pow(2, -10 * p); }

function stepBoot(dt) {
  var b = bootCtl;
  if (!b) return;
  if (b.phase === "mem") {
    b.t += dt;
    var p = Math.min(1, b.t / 1.3);
    var v = Math.round(MEM_TOTAL_K * easeOutExpo(p));
    var bar = "";
    var fill = Math.round((v / MEM_TOTAL_K) * 18);
    for (var i = 0; i < 18; i++) bar += i < fill ? "#" : "·";
    MEM_LINE.s = [seg("p", "MEM      [" + bar + "] " + String(v).padStart(4, "0") + "K")];
    textDirty = true;
    if (p >= 1) {
      MEM_LINE.s = [seg("p", MEM_OK)];
      b.phase = "lines";
      b.delay = 0.14;
    }
  } else if (b.phase === "lines") {
    b.delay -= dt;
    if (b.delay > 0) return;
    if (b.nextIdx < HEAD.length) {
      if (b.nextIdx === 5) b.nextIdx++;
      if (b.nextIdx < HEAD.length) {
        lines.push(HEAD[b.nextIdx++]);
        b.delay = 0.085 + (b.nextIdx % 3) * 0.03;
        textDirty = true;
      }
      if (b.nextIdx >= HEAD.length) finishBoot();
    } else {
      finishBoot();
    }
  }
}
function finishBoot() {
  bootCtl = null;
  mode = "prompt";
  ghostOn = false;
  caretOn = true;
  textDirty = true;
  blinkAt = performance.now();
  srlive.textContent = "System booted. Command shell ready. Available commands: help, ls, cat, run, clear, date, exit.";
  if (queuedCmd) {
    var c = queuedCmd;
    queuedCmd = null;
    runChip(c);
  }
}
function skipBoot() {
  if (bootCtl) {
    MEM_LINE.s = [seg("p", MEM_OK)];
    lines = HEAD.slice();
    bootCtl = null;
    scrollBack = 0;
    finishBoot();
    textDirty = true;
  }
}

var FILES = {
  "README.1ST": [
    "VX/86 0.9.4 · BUILD 1138 · 14 OCT 1989",
    "--------------------------------------",
    "This is the release candidate that never",
    "shipped. SCHRAM, the swapped-tile memory",
    "overlay, passed every test alone. Under",
    "load it stole one byte per frame from the",
    "sprite queue. We knew why. We could not",
    "catch it.",
    "Marketing had a booth booked and a box of",
    "brochures printed. We had a debug session",
    "and a weekend.",
    "The booth stayed empty. The box stayed",
    "shut.",
    "TRY:  CAT DEBUG.LOG  ·  RUN SPRITE"
  ],
  "DEBUG.LOG": [
    "SESSION 0247 · ZX TERMINAL SHADOW CAGE",
    "(DBG) 002511  queue length 63 to 62 to 62 ?!",
    "(DBG) 002512  losing exactly 1 byte per frame",
    "(DBG) 002546  blitter suspect · 40-frame clear",
    "(DBG) 002601  prefetch touches bank 3, not blit",
    "(DBG) 002642  fix #7: stagger prefetch, half row",
    "(DBG) 002643  FAILED · phantom byte home at +2",
    "(MSG) 002644  punch-card time: rewrite QUEUE64",
    "(MSG) 002691  going home · it will be here monday"
  ],
  "STARTUP.CFG": [
    "CLOCK=16MHZ   BANKS=4      SCHRAM=ON",
    "TILES=8X8     QUEUE=64     PARITY=SOFT",
    "SHELLED=1     BUILDFLAG=1138",
    "EOF"
  ],
  "NOTES.TXT": [
    "- never schedule a release the same week as a holiday",
    "- the phantom byte is a prefetch, not a blip.",
    "  found this out twice: once in june, once today.",
    "- if we ever ship, we call the shell VANTAGE ONE.",
    "  typed with love and at most 640k of respect."
  ]
};
var COMMANDS = ["HELP", "LS", "CAT", "RUN", "CLEAR", "DATE", "EXIT"];
var EXECF = ["WORM.COM", "SPRITE.EXE"];

var captured = null;
function OUT(c, t) {
  addLine(c, t);
  if (captured) captured.push(t);
}
function cx_help() {
  captured = captured || [];
  OUT("h", "VXFIX COMMANDS  (VX/86 0.9.4)");
  OUT("p", "  HELP        list commands");
  OUT("p", "  LS          list runtime files");
  OUT("p", "  CAT FILE    print one · try CAT DEBUG.LOG");
  OUT("p", "  RUN PROG    play WORM.COM or SPRITE.EXE");
  OUT("p", "  CLEAR       wipe the screen");
  OUT("p", "  DATE        machine clock (fictional)");
  OUT("p", "  EXIT        end the session");
  OUT("d", "TIP    TAB completes · UP/DOWN recalls");
  OUT("d", "ANY KEY skips boot · ^L clears fast");
}

function cx_ls() {
  OUT("p", "NAME             SIZE        NAME             SIZE");
  OUT("p", "README.1ST       2048 B      DEBUG.LOG        6213 B");
  OUT("p", "STARTUP.CFG       410 B      NOTES.TXT        1958 B");
  OUT("p", "WORM.COM         3072 B      SPRITE.EXE       5120 B");
  OUT("d", "6 FILES · 88,320 B FREE ON DEVICE X");
}

function cx_cat(a) {
  if (!a) { OUT("a", "VXFIX: CAT NEEDS A FILE · TRY LS"); return; }
  var f = a.toUpperCase();
  if (FILES[f]) {
    OUT("d", "---- " + f + " ----");
    var body = FILES[f];
    for (var i = 0; i < body.length; i++) {
      var cls = body[i].indexOf("TRY:") === 0 || body[i].indexOf("(MSG)") === 0 ? "d" : "p";
      OUT(cls, body[i]);
    }
    OUT("d", "---- EOF ----");
  } else {
    OUT("a", "VXFIX: NO SUCH FILE: " + f + " · TRY LS");
  }
}

function cx_date() {
  OUT("p", "MACHINE DATE   SAT 14 OCT 1989 · 23:47 LOCAL");
  OUT("p", "SESSION UPTIME 00:03 · VXFIX CLOCK IS FICTIONAL");
  OUT("d", "(PINNED TO THE TAPE THIS CONCEPT WAS RECORDED FROM)");
}

function cx_clear() {
  lines = [];
  scrollBack = 0;
  textDirty = true;
}

function cx_exit() {
  OUT("a", "VXFIX: LOGGING OFF · SESSION 1 CLOSED");
  lines.push(blank()); trim();
  mode = "dead";
  addLine("h", "— SESSION TERMINATED —");
  addLine("d", "CLICK THE SCREEN OR FLIP POWER TO RESTART");
  lines.push(blank()); trim();
  caretOn = false;
  textDirty = true;
  srlive.textContent = "Session ended. Flip the power switch or click the screen to restart.";
}

function exec(raw) {
  var parts = raw.trim().split(/\s+/);
  var w0 = (parts[0] || "").toUpperCase();
  captured = [];
  if (w0 === '') { }
  else if (w0 === "HELP") cx_help();
  else if (w0 === "LS" || w0 === "DIR") cx_ls();
  else if (w0 === "CAT" || w0 === "TYPE") cx_cat(parts.slice(1).join(" "));
  else if (w0 === "DATE") cx_date();
  else if (w0 === "CLEAR" || w0 === "CLS") cx_clear();
  else if (w0 === "RUN") cx_run(parts.slice(1).join(" "));
  else if (w0 === "EXIT" || w0 === "QUIT") cx_exit();
  else OUT("a", "VXFIX: UNKNOWN " + raw.trim().slice(0, 18) + " · TYPE HELP");
  var txt = (raw ? "> " + raw : ">") + (captured.length ? "\n" + captured.join("\n") : "");
  if (txt.replace(/\s+/g, "").length > 1) srlive.textContent = txt.slice(0, 700);
  captured = [];
}

function cx_run(a) {
  var t = (a || "").toUpperCase();
  if (!t) { OUT("a", "VXFIX: RUN NEEDS A PROGRAM · WORM OR SPRITE"); return; }
  if (t.indexOf("WORM") === 0) startProgram("WORM");
  else if (t.indexOf("SPRITE") === 0) startProgram("SPRITE");
  else OUT("a", "VXFIX: NO ENTRY POINT FOR " + t + " · WORM OR SPRITE");
}

var pr = null;

function perimeter(w, h) {
  var path = [], i;
  for (i = 0; i < w; i++) path.push([i, 0]);
  for (i = 1; i < h; i++) path.push([w - 1, i]);
  for (i = w - 2; i >= 0; i--) path.push([i, h - 1]);
  for (i = h - 2; i > 0; i--) path.push([0, i]);
  return path;
}

function segize(row, map) {
  var s = [], cur = "", cc = null, i, ch, c;
  for (i = 0; i < row.length; i++) {
    ch = row[i];
    c = map[ch] || "p";
    if (c === cc) cur += ch;
    else { if (cur) s.push(seg(cc, cur)); cur = ch; cc = c; }
  }
  if (cur) s.push(seg(cc, cur));
  return s;
}
var WMAP = { "@": "h", "o": "a", "#": "d", "·": "d" };

function wormFrame(i, w, h) {
  var path = perimeter(w, h);
  var len = Math.min(path.length, 4 + Math.floor(i / 3) * 2);
  var head = (i * 2 + 2) % path.length;
  var occ = new Array(w * h);
  for (var k = 0; k < len; k++) {
    var c = path[(head - k + path.length * 4) % path.length];
    occ[c[1] * w + c[0]] = k === 0 ? "@" : "o";
  }
  var rowsOut = [];
  for (var y = 0; y < h; y++) {
    var s = "";
    for (var x = 0; x < w; x++) {
      var q = occ[y * w + x];
      s += q ? q : (x === 0 || x === w - 1 || y === 0 || y === h - 1) ? "#" : "·";
    }
    rowsOut.push(s);
  }
  return rowsOut;
}

var FACES = ["o_o", "0_0", "o_O", "^_^"];

function spriteFrame(i, mx, marks) {
  var y = Math.round((1 - Math.abs(Math.cos(i / 5))) * 3);
  var spriteRow = 3 - y;
  var face = FACES[i % FACES.length];
  var body = y === 0 ? "[" + face + "]" : "[ " + face + " ]";
  var col = Math.round(Math.abs(Math.sin(i / 7)) * (mx - body.length));
  if (y === 0) marks[Math.min(mx - 1, col + Math.floor(body.length / 2))] = true;
  var out = [], r, x;
  for (r = 0; r < 4; r++) {
    var s = "";
    if (r === spriteRow) {
      for (x = 0; x < mx; x++) {
        if (x >= col && x < col + body.length) s += body[x - col];
        else s += (x % 4 === 0) ? "·" : " ";
      }
    } else {
      for (x = 0; x < mx; x++) s += (x % 4 === 0) ? "·" : " ";
    }
    out.push(s);
  }
  out.push(sFloor(mx, marks));
  return out;
}
function sFloor(mx, marks) {
  var s = "";
  for (var x = 0; x <= mx; x++) {
    if (marks[x]) s += "^";
    else s += (x % 4 === 0) ? "·" : " ";
  }
  return s;
}

function drawFrames(frs, map) {
  lines = lines.slice(0, prBase);
  for (var i = 0; i < frs.length; i++) {
    addObj({ s: segize(frs[i], map || WMAP) });
  }
  textDirty = true;
}

var prBase = 0;

function startProgram(name) {
  scrollBack = 0;
  if (lines.length > rows - 10) { lines = lines.slice(lines.length - (rows - 10)); }
  prBase = lines.length;
  lines.push(blank()); trim();
  var tot;
  if (name === "WORM") {
    addLine("d", "WORM.COM · PERIMETER RUNNER · 12 FPS SIM");
    pr = { name: name, i: 0, n: 34, tick: 0.11, next: REDUCED ? 0 : 0.3, next2: performance.now() };
    tot = 34;
  } else {
    addLine("d", "SPRITE.EXE · BOUNCE TEST · HAND-SET FRAMES");
    pr = { name: name, i: 0, n: 40, tick: 0.095, next: REDUCED ? 0 : 0.3, next2: performance.now(), marks: {}, mx: Math.min(cols - 4, 56) };
    tot = 40;
  }
  mode = "run";
  caretOn = false;
  textDirty = true;
  srlive.textContent = "Running " + (name === "WORM" ? "WORM.COM" : "SPRITE.EXE") + ". Press any key to skip.";
}

function progFrame() {
  if (pr.name === "WORM") drawFrames(wormFrame(pr.i, Math.min(56, cols - 4), 7), WMAP);
  else drawFrames(spriteFrame(pr.i, pr.mx, pr.marks), { "·": "d", "^": "a", "[": "p", "]": "p" });
}
function progEnd(early) {
  var done = pr.i >= pr.n;
  var n = pr.name;
  if (n === "WORM") {
    drawFrames(wormFrame(Math.max(pr.i, 0), Math.min(56, cols - 4), 7), WMAP);
    OUT("a", done ? "WORM.COM · 34 STEPS · BOUNDARY REACHED · HALTED CLEAN" : "WORM.COM · INTERRUPTED AT STEP " + pr.i);
    OUT("d", "never learned to turn · 8 bytes tail lost to nobody ");
  } else {
    drawFrames(spriteFrame(pr.i, pr.mx, pr.marks), { "·": "d", "^": "a", "[": "p", "]": "p" });
    OUT("a", done ? "SPRITE.EXE · 40 FRAMES · 0 BYTES LOST · QUEUE 64/64" : "SPRITE.EXE · INTERRUPTED AT FRAME " + pr.i);
    OUT("d", "the phantom byte stayed home this time.");
  }
  lines.push(blank()); trim();
  pr = null;
  mode = "prompt";
  caretOn = true;
  textDirty = true;
  if (early) srlive.textContent = "Program interrupted.";
  else srlive.textContent = "Program finished. The prompt is ready.";
}
function stepProg(dt) {
  if (!pr) return;
  pr.next -= dt;
  if (pr.next > 0) return;
  progFrame();
  pr.i++;
  pr.next = pr.tick;
  if (pr.i >= pr.n) progEnd(false);
}

var running = false;
var rafId = 0;
var lastNow = performance.now();
var inView = true;
var blinkAt = 0;

function loop(now) {
  if (!running) return;
  var dt = Math.min(0.06, (now - lastNow) / 1000);
  lastNow = now;
  if (mode === "boot") stepBoot(dt);
  else if (mode === "run" && pr) stepProg(dt);
  if (mode === "prompt") {
    if (now - blinkAt > 530) { caretOn = !caretOn; blinkAt = now; textDirty = true; }
  }
  if (textDirty) paint();
  if (useGL) {
    if (glDirty) uploadGL();
    gl.useProgram(prog);
    gl.uniform1f(glLocs.uTime, (now - startedAt) / 1000);
    if (degauss > 0) {
      degauss = Math.max(0, degauss - dt);
      var amp = Math.pow(degauss / 0.9, 2) * 0.85;
      gl.uniform1f(glLocs.uDegauss, amp);
    } else if (glLocs.uDegauss) {
      gl.uniform1f(glLocs.uDegauss, 0);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  } else if (fctx && glDirty) {
    fctx.drawImage(textCanvas, 0, 0);
    glDirty = false;
  }
  rafId = requestAnimationFrame(loop);
}
function setRunning(on) {
  if (on === running) return;
  running = on;
  if (on) { lastNow = performance.now(); rafId = requestAnimationFrame(loop); }
  else if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
}
function syncLoop() {
  if (REDUCED) { setRunning(false); return; }
  setRunning(!document.hidden && inView && mode !== "off");
}
document.addEventListener("visibilitychange", syncLoop);
if ("IntersectionObserver" in window) {
  new IntersectionObserver(function (e) {
    inView = e[0].isIntersecting;
    syncLoop();
  }, { threshold: 0.04 }).observe(screenEl);
} else {
  inView = true;
}
window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", function (ev) {
  REDUCED = ev.matches;
  syncLoop();
});

var suggest = null, suggestAt = 0;
function complete() {
  var m = typed.match(/(\S*)$/);
  var tok = (m ? m[1] : "").toUpperCase();
  var cands;
  var head = typed.slice(0, typed.length - tok.length).toUpperCase();
  if (head.indexOf("CAT ") === 0 || head.indexOf("TYPE ") === 0) cands = Object.keys(FILES);
  else if (head.indexOf("RUN ") === 0) cands = EXECF;
  else if (tok.length) cands = COMMANDS.concat(EXECF);
  else cands = COMMANDS;
  var pool = cands.filter(function (c) { return c.indexOf(tok) === 0; });
  if (!pool.length) return;
  var key = pool.join("|");
  if (suggest !== key) { suggest = key; suggestAt = 0; }
  else suggestAt = (suggestAt + 1) % pool.length;
  typed = typed.slice(0, typed.length - tok.length) + pool[suggestAt];
  textDirty = true;
  srlive.textContent = "Completed to: " + typed;
}
function submit() {
  var raw = typed;
  typed = "";
  lines.push({ s: [seg("d", "> "), seg("k", raw)] });
  trim();
  if (raw.trim()) {
    hist.push(raw);
    if (hist.length > 40) hist.shift();
  }
  histAt = -1;
  exec(raw);
  textDirty = true;
}
function powerOn() {
  if (mode !== "off") return;
  powerBtn.setAttribute("aria-checked", "true");
  led.classList.add("on");
  cabinet.classList.remove("is-off", "is-collapsing");
  startBoot();
  syncLoop();
  if (REDUCED) paintNow();
}
function powerOff() {
  if (mode === "off") return;
  skipBoot();
  captureGhost();
  pr = null;
  mode = "off";
  lines = []; typed = "";
  scrollBack = 0;
  caretOn = false;
  textDirty = true;
  powerBtn.setAttribute("aria-checked", "false");
  if (!REDUCED) {
    cabinet.classList.add("is-collapsing");
    setTimeout(function () {
      cabinet.classList.remove("is-collapsing");
      cabinet.classList.add("is-off");
      led.classList.remove("on");
      syncLoop();
      paintNow();
    }, 300);
  } else {
    cabinet.classList.add("is-off");
    led.classList.remove("on");
  }
  paintNow();
  srlive.textContent = "Station powered off.";
}
powerBtn.addEventListener("click", function () {
  if (mode === "off") powerOn(); else powerOff();
});

var fsBtn = document.getElementById("fsToggle");
function fsEl() {
  return document.fullscreenElement || document.webkitFullscreenElement || null;
}
function fsSupported() {
  return !!(cabinet.requestFullscreen || cabinet.webkitRequestFullscreen);
}
function syncFS() {
  var on = !!fsEl();
  if (fsBtn) {
    fsBtn.setAttribute("aria-pressed", String(on));
    fsBtn.setAttribute("aria-label", on ? "Exit fullscreen" : "Enter fullscreen");
  }
  cabinet.classList.toggle("is-fs", on);
}
function toggleFS() {
  if (!fsEl()) {
    var rq = cabinet.requestFullscreen || cabinet.webkitRequestFullscreen;
    if (!rq) return;
    try {
      var p = rq.call(cabinet);
      if (p && p.catch) p.catch(function () { });
    } catch (e) { }
  } else {
    var ex = document.exitFullscreen || document.webkitExitFullscreen;
    if (ex) ex.call(document);
  }
}
if (fsBtn) {
  if (fsSupported()) fsBtn.addEventListener("click", toggleFS);
  else { fsBtn.style.display = "none"; fsBtn.disabled = true; }
  document.addEventListener("fullscreenchange", syncFS);
  document.addEventListener("webkitfullscreenchange", syncFS);
}
function reboot() {
  captureGhost();
  cabinet.classList.remove("is-off", "is-collapsing");
  mode = "off";
  lines = [];
  textDirty = true;
  powerOn();
}
function focusTerminal() {
  if (mode === "dead") { reboot(); }
  try { kbd.focus({ preventScroll: true }); } catch (e) { try { kbd.focus(); } catch (e2) { } }
}
screenEl.addEventListener("click", focusTerminal);

kbd.addEventListener("focus", function () { cabinet.classList.add("is-focused"); });
kbd.addEventListener("blur", function () { cabinet.classList.remove("is-focused"); });

function handleKey(e) {
  if (e.metaKey) return;
  if (mode === "off") { powerOn(); return; }
  if (mode === "dead") {
    if (e.key.length === 1 || e.key === "Enter" || e.key === " ") { e.preventDefault(); reboot(); }
    return;
  }
  if (mode === "boot") { skipBoot(); return; }
  if (mode === "run") {
    e.preventDefault();
    scrollBack = 0;
    if (pr) progEnd(true);
    return;
  }
  switch (e.key) {
    case "Enter": e.preventDefault(); scrollBack = 0; submit(); return;
    case "Backspace": e.preventDefault(); scrollBack = 0; typed = typed.slice(0, -1); textDirty = true; return;
    case "Tab": e.preventDefault(); scrollBack = 0; complete(); return;
    case "ArrowUp":
      e.preventDefault();
      scrollBack = 0;
      if (!hist.length) return;
      if (histAt < 0) histAt = hist.length;
      histAt = Math.max(0, histAt - 1);
      typed = hist[histAt]; textDirty = true; return;
    case "ArrowDown":
      e.preventDefault();
      scrollBack = 0;
      if (histAt < 0) return;
      histAt++;
      if (histAt >= hist.length) { histAt = -1; typed = ""; }
      else typed = hist[histAt];
      textDirty = true; return;
    case "Escape": e.preventDefault(); typed = ""; textDirty = true; return;
  }
  if (e.ctrlKey && (e.key === "l" || e.key === "L")) {
    e.preventDefault(); cx_clear(); scrollBack = 0; textDirty = true;
    srlive.textContent = "Screen cleared.";
    return;
  }
  if (e.ctrlKey || e.altKey) return;
  if (e.key.length === 1) {
    scrollBack = 0;
    if (typed.length < 36) typed += e.key;
    e.preventDefault();
    textDirty = true;
  }
}
kbd.addEventListener("keydown", handleKey);

var FALLBACK_KEYS = /^[a-zA-Z0-9 .,\/:?!\-'"]$|(Enter|ArrowUp|ArrowDown|Backspace|Tab)/;
document.addEventListener("keydown", function (e) {
  if (e.target === kbd) return;
  var t = e.target;
  if (t && (t.tagName === "BUTTON" || t.tagName === "A" || t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
  if (mode === "dead") {
    if (e.key.length === 1 || e.key === "Enter" || e.key === " ") { e.preventDefault(); reboot(); }
    return;
  }
  if (mode === "run" && (e.key.length === 1 || e.key === "Enter" || e.key === "Escape")) {
    e.preventDefault();
    scrollBack = 0;
    if (pr) progEnd(true);
    return;
  }
  if (mode !== "prompt") return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key.length === 1 || FALLBACK_KEYS.test(e.key)) {
    e.preventDefault();
    scrollBack = 0;
    try { kbd.focus({ preventScroll: true }); } catch (err) { }
    handleKey(e);
  }
});

screenEl.addEventListener("wheel", function (e) {
  if (mode !== "prompt" && mode !== "dead" && mode !== "run") return;
  var maxScroll = Math.max(0, lines.length - (rows - 1));
  if (!maxScroll) return;
  e.preventDefault();
  var step = Math.max(1, Math.round(Math.abs(e.deltaY) / 60));
  scrollBack = Math.max(0, Math.min(maxScroll, scrollBack + (e.deltaY > 0 ? -step : step)));
  textDirty = true;
}, { passive: false });

function runChip(cmd) {
  scrollBack = 0;
  kbd.focus({ preventScroll: true });
  lines.push({ s: [seg("d", "> "), seg("k", cmd)] });
  trim();
  exec(cmd);
  textDirty = true;
  if (REDUCED) paintNow();
}

Array.prototype.forEach.call(chipsEl.querySelectorAll("button"), function (b) {
  b.addEventListener("click", function () {
    var cmd = b.getAttribute("data-cmd");
    if (mode === "off") { queuedCmd = cmd; powerOn(); return; }
    if (mode === "dead") { queuedCmd = cmd; reboot(); return; }
    if (mode === "boot") { queuedCmd = cmd; skipBoot(); return; }
    if (mode === "run" && pr) { scrollBack = 0; progEnd(true); }
    runChip(cmd);
  });
});

function renderStaticFrame() { if (REDUCED || !running) paintNow(); }

var didInit = false;
function init() {
  if (didInit) return;
  didInit = true;
  layout();
  initGL();
  if (!useGL) flatSetup();
  else glDirty = false;
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      layout();
      if (useGL) paintNow();
      else { paint(); fctx.drawImage(textCanvas, 0, 0); }
    });
  }
  var rzT = 0;
  window.addEventListener("resize", function () {
    clearTimeout(rzT);
    rzT = setTimeout(function () {
      layout();
      if (useGL) paintNow();
      else renderStaticFrame();
    }, 140);
  });
  initGsap();
  setTimeout(function () { if (mode === "off") powerOn(); }, REDUCED ? 500 : 1500);
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();

function initGsap() {
  var hasGSAP = typeof window.gsap !== "undefined";
  if (!hasGSAP || REDUCED) return;
  if (typeof window.ScrollTrigger !== "undefined") window.gsap.registerPlugin(window.ScrollTrigger);
  var g = window.gsap;
  g.from(cabinet, { y: 30, opacity: 0, duration: 0.95, ease: "power3.out", delay: 0.1, clearProps: "transform,opacity" });
  g.from(".deckhint", { opacity: 0, y: 10, duration: 0.6, ease: "power2.out", delay: 0.45, clearProps: "all" });
  if (typeof window.ScrollTrigger !== "undefined") {
    g.from(".about h2, .about p", {
      opacity: 0, y: 22, duration: 0.75, ease: "power2.out", stagger: 0.09,
      scrollTrigger: { trigger: "#about", start: "top 78%" },
      clearProps: "all"
    });
  }
}
})();
