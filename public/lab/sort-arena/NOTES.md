# Sort Arena — Research Notes
- `lib/pixel.ts:109-145`: 3x5 bitmap glyph matrix (`FONT`) + `drawPixelText` for crisp canvas pixel numerals and lock-in badges.
- `components/RunnerGame.tsx:73-87,183-186,287-295`: Identity-matrix full backing-store `clearRect` and `IntersectionObserver` + `visibilitychange` loop pause.
- `components/StatScreen.module.css:112-128`: Segmented 10-cell bar meter for per-lane ops/sec speed gauges.
- `labs/ui/collection/fullpages/console-motion-template.modulify.website/_next/static/chunks/0hfo3l7exj820.css:2`: Hardware cabinet recessed bezel/keycap inset shadows and scanlines.
- `labs/ui/collection/fullpages/askmaddyy.com/playground/big-o-racer/index.html:230-358`: Multi-lane race track layout, 12-column tick subdivisions, and `tabular-nums` ops telemetry.
- `labs/ui/collection/fullpages/pixels-template.modulify.website/_next/static/chunks/04ljk27dp9~tv.css:1`: Dual-frequency `repeating-linear-gradient` grid and named cubic-bezier easing tokens.
- `labs/ui/collection/fullpages/desk-95-template.modulify.website/index.html:1`: Stepped keyframe timing (`steps(1)`/`steps(2)`) for hard stop-frame countdown and hit-stop punches.
- Rejected: `askmaddyy.com` frosted glass (`backdrop-filter: blur`), `rooster-rush` pastel gradients, and `apexsignal` glowing border beams (clash with crisp dark cabinet hardware).

## v2 Full-Screen Scene Redesign
- `lib/pixel.ts:4-20,78-106`: `PALETTE` + `COIN` string-grid sprite (`spriteCanvas` 1px-per-char scaled with `imageSmoothingEnabled = false`) for 16x16 fighter emblems and win coin-burst particles.
- `labs/ui/collection/fullpages/robot-game-3d/index.html:451-520`: Borderless roster unit cards (`background: var(--glass-face)`) with corner L-brackets (`::before`/`::after`) on active selection instead of full four-sided boxes.
- `labs/ui/collection/fullpages/rooster-rush-template.modulify.website/index.html:1`: Centered modal "How to play" help sheet (`scale-95 opacity-0` transition) and post-round game-over overlay takeover.
- `labs/ui/collection/sources/neuform.ai/examples/faraway-strategic-card-game/DESIGN.md:9-24`: Near-black stage (`#080808` / `rgba(255,255,255,0.05)` surfaces) where scale contrast and negative space group elements without panel borders.
