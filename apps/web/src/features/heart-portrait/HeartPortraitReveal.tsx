/**
 * HeartPortraitReveal
 *
 * A magical tap-to-reveal moment for "The Journey To My Heart": floating
 * heart/sparkle/dot particles drift upward over a dark romantic
 * backdrop; on tap they implode toward the center, then re-emerge as a
 * cloud of hundreds of small colored particles that settle into the
 * shape of a portrait sampled from `imageSrc`. Once settled, touch/mouse
 * gently pushes nearby particles away; they spring back to their
 * portrait position on their own.
 *
 * Everything is driven by a single canvas + requestAnimationFrame loop.
 * No animation libraries — particle physics and drawing are hand-rolled
 * (spring-return + radial repulsion, ~30 lines total), and the button/
 * title use plain Tailwind transition utilities, not a JS animation
 * runtime.
 *
 * ─────────────────────────────────────────────────────────────────────
 * HOW THE PORTRAIT IS BUILT (read this before touching sampleImageToSeeds)
 * ─────────────────────────────────────────────────────────────────────
 * There's no face-detection model here (that would pull in a heavy
 * dependency for a single decorative effect). Instead the sampler uses a
 * cheap, well-known trick — edge-weighted stippling:
 *   1. Draw the source image into a small offscreen canvas (analysis
 *      resolution is fixed and independent of display size, so sampling
 *      cost never grows with screen size).
 *   2. For every pixel, estimate local contrast against its right/below
 *      neighbor (a 2-tap Sobel-lite). High-contrast pixels sit on edges
 *      — which is exactly where a face's outline, eyes, smile line, and
 *      hairline live — so they're kept with much higher probability
 *      than flat mid-tone regions (cheeks, background), and are drawn as
 *      glowing "sparkle" particles. This alone is what makes the result
 *      read as a recognizable portrait instead of a random color cloud.
 *   3. Near-white, low-contrast pixels are thinned aggressively (assumed
 *      background), dark low-contrast pixels become small glow "dots"
 *      (hair mass, shadows), everything else becomes a "heart" (skin,
 *      clothes, midtones) — tying the shape back to the birthday theme.
 *   4. Each kept pixel's own RGB becomes its particle's fill color, so
 *      the portrait is colored directly from the photo, per the brief.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
} from 'react';

// ───────────────────────────────────────────────────────────────────────
// Public API
// ───────────────────────────────────────────────────────────────────────

export interface HeartPortraitRevealProps {
  /** Cloudinary (or any) image URL — never hardcoded, always supplied by the caller. */
  imageSrc: string;
  /** Optional caption that fades in under the portrait once it settles. */
  title?: string;
  /** Fires once, the moment the portrait finishes forming. */
  onRevealComplete?: () => void;
  /** Optional extra classes for the outer container, for embedding flexibility. */
  className?: string;
}

// ───────────────────────────────────────────────────────────────────────
// Shared types
// ───────────────────────────────────────────────────────────────────────

type ParticleKind = 'heart' | 'sparkle' | 'dot';
type Phase = 'idle' | 'gathering' | 'forming' | 'revealed';

interface AmbientParticle {
  x: number;
  y: number;
  vy: number;
  size: number;
  kind: ParticleKind;
  color: string;
  alpha: number;
  glow: boolean;
  swayPhase: number;
  swaySpeed: number;
}

interface PortraitSeed {
  normX: number;
  normY: number;
  color: string;
  kind: ParticleKind;
  glow: boolean;
  size: number;
  delay: number;
}

interface PortraitParticle extends PortraitSeed {
  x: number;
  y: number;
  vx: number;
  vy: number;
  homeX: number;
  homeY: number;
  twinklePhase: number;
}

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PointerState {
  x: number;
  y: number;
  active: boolean;
}

// ───────────────────────────────────────────────────────────────────────
// Tunables
// ───────────────────────────────────────────────────────────────────────
const GATHER_DURATION_MS = 650;
const FORM_DURATION_MS = 1700;
const ANALYSIS_WIDTH = 260; // fixed sampling resolution, independent of display size
const MIN_BUDGET = 800;
const MAX_BUDGET = 1200;
const AMBIENT_COUNT = 42;
const ATMOSPHERE_COUNT = 16;
const REPULSE_RADIUS = 64;
const SPRING_K = 0.07;
const SPRING_DAMPING = 0.8;

const AMBIENT_PALETTE = ['#ff5da2', '#ff8fc7', '#c084fc', '#f6c945', '#ffffff'];

// Precomputed unit heart outline (parametric heart curve, normalized to
// roughly [-1, 1]) — built once at module load, reused by every particle
// every frame, so drawing a heart is just a cheap transform + fill.
const HEART_POINTS: ReadonlyArray<readonly [number, number]> = (() => {
  const steps = 16;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const hx = 16 * Math.sin(t) ** 3;
    const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    pts.push([hx / 16, hy / 17]);
  }
  return pts;
})();

// ───────────────────────────────────────────────────────────────────────
// Small pure helpers
// ───────────────────────────────────────────────────────────────────────

function drawImageContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  width: number,
  height: number
) {

  const imageRatio =
    img.naturalWidth / img.naturalHeight;

  const canvasRatio =
    width / height;


  let drawWidth = width;
  let drawHeight = height;

  let x = 0;
  let y = 0;


  if (imageRatio > canvasRatio) {

    // image is wider
    drawHeight =
      width / imageRatio;

    y =
      (height - drawHeight) / 2;

  } 
  else {

    // image is taller
    drawWidth =
      height * imageRatio;

    x =
      (width - drawWidth) / 2;

  }


  ctx.clearRect(
    0,
    0,
    width,
    height
  );


  ctx.drawImage(
    img,
    x,
    y,
    drawWidth,
    drawHeight
  );

}

function easeOutCubic(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return 1 - (1 - c) ** 3;
}

function easeOutBack(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  const s = 1.70158;
  return 1 + (s + 1) * (c - 1) ** 3 + s * (c - 1) ** 2;
}

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number;
}

/** Static device heuristic: cores + memory + pixel density → 800-1200. */
function resolveStaticBudget(): number {
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as NavigatorWithMemory).deviceMemory ?? 4;
  const dpr = window.devicePixelRatio || 1;

  let budget = MAX_BUDGET;
  if (cores <= 4) budget -= 200;
  if (memory <= 4) budget -= 150;
  if (dpr >= 3) budget -= 50;
  return Math.min(MAX_BUDGET, Math.max(MIN_BUDGET, budget));
}

function computePortraitBox(
  width:number,
  height:number,
  aspect:number
):Box {


  // Mobile optimized portrait area
  const maxW =
    Math.min(width * 0.92, 520);


const maxH =
    height * 0.90;



  let boxW=maxW;

  let boxH=
    boxW / aspect;



  if(boxH > maxH){

    boxH=maxH;

    boxW=
      boxH * aspect;

  }


  return {

    x:
      (width-boxW)/2,


    y:
(height-boxH)/2,


    width:
      boxW,


    height:
      boxH,

  };

}

function createAmbientParticle(width: number, height: number, dim = false): AmbientParticle {
  const kinds: ParticleKind[] = ['heart', 'heart', 'sparkle', 'dot'];
  return {
    x: Math.random() * width,
    y: height + Math.random() * height * 0.4,
    vy: -(0.25 + Math.random() * 0.5),
    size: 3 + Math.random() * (dim ? 3.5 : 5),
    kind: kinds[Math.floor(Math.random() * kinds.length)],
    color: AMBIENT_PALETTE[Math.floor(Math.random() * AMBIENT_PALETTE.length)],
    alpha: dim ? 0.12 + Math.random() * 0.18 : 0.28 + Math.random() * 0.5,
    glow: Math.random() < (dim ? 0.15 : 0.3),
    swayPhase: Math.random() * Math.PI * 2,
    swaySpeed: 0.6 + Math.random() * 0.8,
  };
}

/**
 * Edge-weighted pixel sampler — see the file-level doc comment above for
 * the reasoning. Returns normalized (0..1) seeds; actual pixel homes are
 * computed later against whatever the current canvas box happens to be,
 * so the same seed set survives resizes/orientation changes untouched.
 */
function sampleImageToSeeds(img: HTMLImageElement, budget: number): PortraitSeed[] {
  const sampleW = ANALYSIS_WIDTH;
  const sampleH = Math.max(1, Math.round(sampleW * (img.naturalHeight / img.naturalWidth)));

  const offscreen = document.createElement('canvas');
  offscreen.width = sampleW;
  offscreen.height = sampleH;
  const octx = offscreen.getContext('2d', { willReadFrequently: true });
  if (!octx) return [];

  drawImageContain(
  octx,
  img,
  sampleW,
  sampleH
);
  const { data } = octx.getImageData(0, 0, sampleW, sampleH);

  const luma = (i: number) => 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

  interface Candidate {
    nx: number;
    ny: number;
    r: number;
    g: number;
    b: number;
    edge: number;
  }
  const candidates: Candidate[] = [];

  for (let py = 0; py < sampleH; py++) {
    for (let px = 0; px < sampleW; px++) {
      const i = (py * sampleW + px) * 4;
      const alpha = data[i + 3];
      if (alpha < 40) continue; // transparent (PNG cutout) background

      let edge = 0;
      if (px < sampleW - 1) edge += Math.abs(luma(i) - luma(i + 4));
      if (py < sampleH - 1) edge += Math.abs(luma(i) - luma(i + sampleW * 4));

      const l = luma(i);
      const likelyBackground = edge < 6 && l > 225;
      if (likelyBackground && Math.random() > 0.05) continue;

      const keepProbability = Math.min(1, 0.16 + edge / 90);
      if (Math.random() > keepProbability) continue;

      candidates.push({ nx: px / sampleW, ny: py / sampleH, r: data[i], g: data[i + 1], b: data[i + 2], edge });
    }
  }

  let pool = candidates;
  if (pool.length > budget) {
    pool = pool
      .map((c) => ({ c, score: c.edge + Math.random() * 20 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, budget)
      .map((s) => s.c);
  }

  const edgeSorted = [...pool].sort((a, b) => a.edge - b.edge);
  const edgeCutoff = edgeSorted[Math.floor(edgeSorted.length * 0.85)]?.edge ?? Infinity;

  return pool.map((c) => {
    const isEdge = c.edge >= edgeCutoff && c.edge > 10;
    const l = 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
    let kind: ParticleKind;
    let glow: boolean;
    if (isEdge) {
      kind = 'sparkle';
      glow = true;
    } else if (l < 70) {
      kind = 'dot';
      glow = Math.random() < 0.06;
    } else {
      kind = 'heart';
      glow = Math.random() < 0.1;
    }
    return {
      normX: c.nx,
      normY: c.ny,
      color: `rgb(${c.r}, ${c.g}, ${c.b})`,
      kind,
      glow,
      size: 2.3 + Math.random() * 2.3,
      delay: Math.random() * 450 + Math.hypot(c.nx - 0.5, c.ny - 0.5) * 260,
    };
  });
}

// ───────────────────────────────────────────────────────────────────────
// Draw primitives — all glow via ctx.shadowBlur, gated by particle.glow
// so only a bounded fraction of ~1000+ particles ever pay the (fairly
// expensive) shadow-blur cost per frame; the rest render as flat fills.
// ───────────────────────────────────────────────────────────────────────

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha: number, glow: boolean) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.shadowBlur = glow ? size * 1.4 : 0;
  ctx.shadowColor = glow ? color : 'transparent';
  ctx.beginPath();
  for (let i = 0; i < HEART_POINTS.length; i++) {
    const [hx, hy] = HEART_POINTS[i];
    const px = x + hx * size;
    const py = y + hy * size;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function drawSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha: number, glow: boolean) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.shadowBlur = glow ? size * 1.8 : 0;
  ctx.shadowColor = glow ? color : 'transparent';
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.quadraticCurveTo(x + size * 0.15, y - size * 0.15, x + size, y);
  ctx.quadraticCurveTo(x + size * 0.15, y + size * 0.15, x, y + size);
  ctx.quadraticCurveTo(x - size * 0.15, y + size * 0.15, x - size, y);
  ctx.quadraticCurveTo(x - size * 0.15, y - size * 0.15, x, y - size);
  ctx.closePath();
  ctx.fill();
}

function drawDot(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha: number, glow: boolean) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.shadowBlur = glow ? size * 2.2 : 0;
  ctx.shadowColor = glow ? color : 'transparent';
  ctx.beginPath();
  ctx.arc(x, y, size * 0.55, 0, Math.PI * 2);
  ctx.fill();
}

function drawParticle(ctx: CanvasRenderingContext2D, kind: ParticleKind, x: number, y: number, size: number, color: string, alpha: number, glow: boolean) {
  if (alpha <= 0.01) return;
  if (kind === 'heart') drawHeart(ctx, x, y, size, color, alpha, glow);
  else if (kind === 'sparkle') drawSparkle(ctx, x, y, size, color, alpha, glow);
  else drawDot(ctx, x, y, size, color, alpha, glow);
}

// ───────────────────────────────────────────────────────────────────────
// Component
// ───────────────────────────────────────────────────────────────────────

export function HeartPortraitReveal({ imageSrc, title, onRevealComplete, className }: HeartPortraitRevealProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const sizeRef = useRef({ width: 0, height: 0 });
  const boxRef = useRef<Box>({ x: 0, y: 0, width: 0, height: 0 });
  const aspectRef = useRef(1);

  const ambientRef = useRef<AmbientParticle[]>([]);
  const portraitRef = useRef<PortraitParticle[]>([]);
  const seedsRef = useRef<PortraitSeed[] | null>(null);

  const phaseRef = useRef<Phase>('idle');
  const [phase, setPhase] = useState<Phase>('idle');

  const gatherStartRef = useRef(0);
  const formStartRef = useRef(0);
  const perfSamplesRef = useRef<number[]>([]);
  const lastIdleFrameTimeRef = useRef<number | null>(null);
  const revealFiredRef = useRef(false);

  const pointerRef = useRef<PointerState>({ x: 0, y: 0, active: false });

  const [imageReady, setImageReady] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [sampleFailed, setSampleFailed] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);

  // ---- image load + background sampling ---------------------------------

  useEffect(() => {
    let cancelled = false;
    setImageReady(false);
    setImageError(false);
    setSampleFailed(false);
    seedsRef.current = null;
    loadedImageRef.current = null;

    // A new image means any in-progress or already-completed reveal is
    // stale — reset cleanly back to the floating-hearts idle state so
    // this component stays correct if a parent reuses it for a
    // different photo rather than always remounting it.
    portraitRef.current = [];
    revealFiredRef.current = false;
    phaseRef.current = 'idle';
    setPhase('idle');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (cancelled) return;
      loadedImageRef.current = img;
      aspectRef.current = img.naturalWidth / img.naturalHeight || 1;
      try {
        seedsRef.current = sampleImageToSeeds(img, resolveStaticBudget());
      } catch {
        // Most likely a canvas security error from a non-CORS-enabled
        // host. Degrade gracefully: the reveal still works, it just
        // fades the real photo in behind the implosion instead of
        // reconstructing it from particles.
        seedsRef.current = [];
        setSampleFailed(true);
      }
      setImageReady(true);
    };
    img.onerror = () => {
      if (!cancelled) setImageError(true);
    };
    img.src = imageSrc;

    return () => {
      cancelled = true;
    };
  }, [imageSrc]);

  // ---- canvas sizing (responsive + high-DPI + orientation changes) ------

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 3);

    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    console.log(rect.width,rect.height)

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctxRef.current = ctx;
    }

    sizeRef.current = { width: rect.width, height: rect.height };
    boxRef.current = computePortraitBox(rect.width, rect.height, aspectRef.current);

    // Re-home existing portrait particles against the new box so a
    // rotation/resize mid-reveal doesn't require re-sampling.
    for (const p of portraitRef.current) {
      p.homeX = boxRef.current.x + p.normX * boxRef.current.width;
      p.homeY = boxRef.current.y + p.normY * boxRef.current.height;
    }
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('orientationchange', resizeCanvas);
    };
  }, [resizeCanvas]);

  // Recompute the box (and re-home particles) whenever the image's own
  // aspect ratio becomes known, even without a viewport resize.
  useEffect(() => {
    if (!imageReady) return;
    const { width, height } = sizeRef.current;
    if (width && height) {
      boxRef.current = computePortraitBox(width, height, aspectRef.current);
    }
  }, [imageReady]);

  // ---- ambient particle pool ---------------------------------------------

  useEffect(() => {
    const { width, height } = sizeRef.current;
    ambientRef.current = Array.from({ length: AMBIENT_COUNT }, () =>
      createAmbientParticle(width || 320, height || 480)
    );
  }, []);

  // ---- pointer/touch interaction (post-reveal repulsion) -----------------

  const canvasPointFromClient = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  const handlePointerActive = useCallback(
    (clientX: number, clientY: number) => {
      const p = canvasPointFromClient(clientX, clientY);
      pointerRef.current = { x: p.x, y: p.y, active: true };
    },
    [canvasPointFromClient]
  );

  const handlePointerInactive = useCallback(() => {
    pointerRef.current.active = false;
  }, []);

  const onTouchStart = (e: ReactTouchEvent<HTMLCanvasElement>) => {
    const t = e.touches[0];
    if (t) handlePointerActive(t.clientX, t.clientY);
  };
  const onTouchMove = (e: ReactTouchEvent<HTMLCanvasElement>) => {
    const t = e.touches[0];
    if (t) handlePointerActive(t.clientX, t.clientY);
  };
  const onTouchEnd = () => handlePointerInactive();
  const onMouseDown = (e: ReactMouseEvent<HTMLCanvasElement>) => handlePointerActive(e.clientX, e.clientY);
  const onMouseMove = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    if (pointerRef.current.active) handlePointerActive(e.clientX, e.clientY);
  };
  const onMouseUp = () => handlePointerInactive();
  const onMouseLeave = () => handlePointerInactive();

  // ---- reveal trigger ------------------------------------------------------

  const beginPortraitFormation = useCallback(() => {
    const box = boxRef.current;
    const cx = sizeRef.current.width / 2;
    const cy = sizeRef.current.height / 2;

    let seeds = seedsRef.current ?? [];

    // Adaptive perf trim: if the idle-phase frame times suggest the
    // device is struggling, thin the portrait further than the static
    // device-heuristic budget already did.
    const samples = perfSamplesRef.current;
    if (samples.length > 10) {
      const avgMs = samples.reduce((a, b) => a + b, 0) / samples.length;
      if (avgMs > 22 && seeds.length > MIN_BUDGET) {
        const target = Math.max(MIN_BUDGET, Math.round(seeds.length * 0.7));
        seeds = [...seeds].sort(() => Math.random() - 0.5).slice(0, target);
      }
    }

    portraitRef.current = seeds.map((seed) => ({
      ...seed,
      x: cx + (Math.random() - 0.5) * 24,
      y: cy + (Math.random() - 0.5) * 24,
      vx: 0,
      vy: 0,
      homeX: box.x + seed.normX * box.width,
      homeY: box.y + seed.normY * box.height,
      twinklePhase: Math.random() * Math.PI * 2,
    }));

    ambientRef.current = Array.from({ length: ATMOSPHERE_COUNT }, () =>
      createAmbientParticle(sizeRef.current.width, sizeRef.current.height, true)
    );

    revealFiredRef.current = false;
    formStartRef.current = performance.now();
    phaseRef.current = 'forming';
    setPhase('forming');
  }, []);

  const handleReveal = useCallback(() => {
    if (phaseRef.current !== 'idle' || !imageReady) return;
    gatherStartRef.current = performance.now();
    phaseRef.current = 'gathering';
    setPhase('gathering');
  }, [imageReady]);

  // ---- main animation loop ------------------------------------------------

  useEffect(() => {
    let rafId = 0;

    const loop = (now: number) => {
      const ctx = ctxRef.current;
      const { width, height } = sizeRef.current;

      if (phaseRef.current === 'idle') {
        const last = lastIdleFrameTimeRef.current;
        if (last !== null) {
          const samples = perfSamplesRef.current;
          samples.push(now - last);
          if (samples.length > 90) samples.shift();
        }
        lastIdleFrameTimeRef.current = now;
      } else {
        lastIdleFrameTimeRef.current = null;
      }

      if (ctx && width > 0 && height > 0) {
        ctx.clearRect(0, 0, width, height);

        // Soft romantic vignette glow behind everything — one gradient
        // per frame, not per particle, so this is effectively free.
        const vignette = ctx.createRadialGradient(
          width / 2,
          height * 0.42,
          0,
          width / 2,
          height * 0.42,
          Math.max(width, height) * 0.65
        );
        vignette.addColorStop(0, 'rgba(147, 51, 234, 0.16)');
        vignette.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);

        updateAndDrawAmbient(ctx, now, width, height);
        if (phaseRef.current === 'forming' || phaseRef.current === 'revealed') {
          updateAndDrawPortrait(ctx, now);
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }

      rafId = requestAnimationFrame(loop);
    };

    function updateAndDrawAmbient(ctx: CanvasRenderingContext2D, now: number, width: number, height: number) {
      const particles = ambientRef.current;

      if (phaseRef.current === 'gathering') {
        const elapsed = now - gatherStartRef.current;
        const progress = easeOutCubic(elapsed / GATHER_DURATION_MS);
        const cx = width / 2;
        const cy = height / 2;
        for (const p of particles) {
          p.x += (cx - p.x) * progress * 0.22;
          p.y += (cy - p.y) * progress * 0.22;
          p.alpha *= 0.94;
          p.size = Math.max(0.5, p.size * 0.97);
          drawParticle(ctx, p.kind, p.x, p.y, p.size, p.color, p.alpha, p.glow);
        }
        if (elapsed >= GATHER_DURATION_MS) {
          beginPortraitFormation();
        }
        return;
      }

      for (const p of particles) {
        p.y += p.vy;
        p.x += Math.sin(now / 1000 * p.swaySpeed + p.swayPhase) * 0.4;
        if (p.y < -20) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        drawParticle(ctx, p.kind, p.x, p.y, p.size, p.color, p.alpha, p.glow);
      }
    }

    function updateAndDrawPortrait(ctx: CanvasRenderingContext2D, now: number) {
      const particles = portraitRef.current;
      const forming = phaseRef.current === 'forming';
      const elapsed = now - formStartRef.current;
      const pointer = pointerRef.current;
      let settledCount = 0;

      for (const p of particles) {
        if (forming) {
          const localElapsed = elapsed - p.delay;
          if (localElapsed <= 0) {
            drawParticle(ctx, p.kind, p.x, p.y, p.size * 0.4, p.color, 0, false);
            continue;
          }
          const progress = easeOutBack(localElapsed / (FORM_DURATION_MS - p.delay || 1));
          p.x = p.x + (p.homeX - p.x) * Math.min(1, progress * 0.5 + 0.05);
          p.y = p.y + (p.homeY - p.y) * Math.min(1, progress * 0.5 + 0.05);
          const alpha = Math.min(1, localElapsed / 220);
          drawParticle(ctx, p.kind, p.x, p.y, p.size, p.color, alpha, p.glow);
          continue;
        }

        // Revealed: spring toward home, with soft repulsion from an
        // active pointer, plus a gentle per-particle twinkle offset.
        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist = Math.hypot(dx, dy) || 0.001;
          if (dist < REPULSE_RADIUS) {
            const force = (1 - dist / REPULSE_RADIUS) * 5.5;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        const ax = (p.homeX - p.x) * SPRING_K;
        const ay = (p.homeY - p.y) * SPRING_K;
        p.vx = (p.vx + ax) * SPRING_DAMPING;
        p.vy = (p.vy + ay) * SPRING_DAMPING;
        p.x += p.vx;
        p.y += p.vy;

        const dHome = Math.hypot(p.x - p.homeX, p.y - p.homeY);
        if (dHome < 0.6) settledCount++;

        const twinkle = 1 + Math.sin(now / 700 + p.twinklePhase) * 0.06;
        drawParticle(ctx, p.kind, p.x, p.y, p.size * twinkle, p.color, 0.92, p.glow);
      }

      if (forming && elapsed >= FORM_DURATION_MS + 250) {
        for (const p of particles) {
          p.x = p.homeX;
          p.y = p.homeY;
          p.vx = 0;
          p.vy = 0;
        }
        phaseRef.current = 'revealed';
        setPhase('revealed');
      }

      if (!forming && !revealFiredRef.current && (particles.length === 0 || settledCount === particles.length)) {
        revealFiredRef.current = true;
        onRevealComplete?.();
      }
    }

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
    // Deliberately run once: every mutable value the loop touches lives
    // in a ref, so re-running this effect per render would just restart
    // the clock for no benefit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beginPortraitFormation, onRevealComplete]);

  // Fade the title in shortly after the portrait settles.
  useEffect(() => {
    if (phase !== 'revealed') {
      setShowTitle(false);
      return;
    }
    const id = window.setTimeout(() => setShowTitle(true), 200);
    return () => window.clearTimeout(id);
  }, [phase]);

  const canReveal = phase === 'idle' && imageReady && !imageError;

  const buttonLabel = useMemo(() => {
    if (imageError) return 'Could not load your photo';
    if (!imageReady) return 'Preparing your surprise…';
    return 'Tap to Reveal Your Surprise ✨';
  }, [imageError, imageReady]);

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden bg-gradient-to-b from-[#120821] via-[#1a0b2e] to-[#05010a] ${className ?? ''}`}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        role="img"
        aria-label={phase === 'revealed' ? title ?? 'A birthday surprise portrait' : 'Floating hearts'}
      />

      {/* Fallback for hosts that block canvas pixel sampling (rare, but
          graceful): fade the real photo in behind the particle field so
          the reveal still lands even without per-pixel reconstruction. */}
      {sampleFailed && (phase === 'forming' || phase === 'revealed') && (
        <img
          src={imageSrc}
          alt={title ?? 'Birthday surprise'}
          className={`pointer-events-none absolute left-1/2 top-1/2 max-h-[70%] max-w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-2xl object-cover shadow-[0_0_60px_20px_rgba(236,72,153,0.25)] transition-opacity duration-700 ${
            phase === 'revealed' ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {canReveal || (!imageReady && !imageError) ? (
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <button
            type="button"
            onClick={handleReveal}
            disabled={!canReveal}
            className="animate-pulse rounded-full bg-gradient-to-br from-pink-400 via-fuchsia-400 to-purple-400 px-7 py-3.5 text-sm font-semibold tracking-wide text-white shadow-[0_0_45px_12px_rgba(236,72,153,0.4)] transition-transform duration-200 hover:scale-105 active:scale-95 disabled:cursor-wait disabled:opacity-80 sm:text-base"
          >
            {buttonLabel}
          </button>
        </div>
      ) : null}

      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
          <p className="text-sm text-pink-100/80">
            We couldn&apos;t load your photo — double-check the image link and try again.
          </p>
        </div>
      )}

      {title && (
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-6 flex justify-center px-6 transition-opacity duration-700 sm:bottom-8 ${
            showTitle ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <p className="rounded-full bg-black/25 px-4 py-1.5 text-center text-sm font-medium text-pink-50 backdrop-blur-sm sm:text-base">
            {title}
          </p>
        </div>
      )}
    </div>
  );
}

export default HeartPortraitReveal;
