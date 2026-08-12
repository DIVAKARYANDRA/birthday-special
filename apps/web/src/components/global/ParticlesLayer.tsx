/**
 * ParticlesLayer — ambient star/firefly/dust particle field.
 *
 * Per docs/01-system-architecture.md, Section 9 and
 * docs/05-frontend-architecture.md, Section 10: ambient/background
 * animation is isolated from the React render tree (Canvas-based) so it
 * NEVER triggers component re-renders — the animation loop lives
 * entirely inside a `requestAnimationFrame` callback closed over plain
 * arrays, untouched by React state.
 *
 * Particle count scales with useDeviceCapability's tier (Part 11,
 * Performance) and drops to a small static handful (no animation loop at
 * all) when reduced motion is preferred (Part 10/accessibility).
 */
import { useEffect, useRef } from "react";

import { useDeviceCapability, PARTICLE_DENSITY } from "@/hooks/useDeviceCapability";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export type ParticleVariant = "stars" | "fireflies" | "dust";

interface ParticlesLayerProps {
  variant: ParticleVariant;
  baseCount?: number;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  driftX: number;
  driftY: number;
  phase: number;
  twinkleSpeed: number;
}

const VARIANT_COLOR: Record<ParticleVariant, string> = {
  stars: "255, 250, 240",
  fireflies: "245, 215, 110",
  dust: "216, 167, 224",
};

function createParticles(count: number, width: number, height: number, variant: ParticleVariant): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: variant === "stars" ? Math.random() * 1.4 + 0.4 : Math.random() * 2.2 + 1,
      driftX: (Math.random() - 0.5) * (variant === "fireflies" ? 0.4 : 0.05),
      driftY: variant === "fireflies" ? (Math.random() - 0.5) * 0.3 : Math.random() * 0.03 + 0.01,
      phase: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.02 + 0.008,
    });
  }
  return particles;
}

export default function ParticlesLayer({ variant, baseCount = 60, className = "" }: ParticlesLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tier = useDeviceCapability();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      if (!canvas) return;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx?.scale(dpr, dpr);
    }
    resize();
    window.addEventListener("resize", resize);

    const count = Math.max(4, Math.round(baseCount * PARTICLE_DENSITY[tier]));
    const particles = createParticles(count, width, height, variant);
    const color = VARIANT_COLOR[variant];

    let animationFrame: number;
    let elapsed = 0;

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        const twinkle = 0.5 + 0.5 * Math.sin(elapsed * p.twinkleSpeed + p.phase);
        ctx.beginPath();
        ctx.fillStyle = `rgba(${color}, ${(variant === "stars" ? 0.5 : 0.7) * twinkle + 0.15})`;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        if (!reducedMotion) {
          p.x += p.driftX;
          p.y -= p.driftY;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < -10) p.y = height + 10;
        }
      }
      elapsed += 1;
      if (!reducedMotion) {
        animationFrame = requestAnimationFrame(draw);
      }
    }
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [variant, baseCount, tier, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
