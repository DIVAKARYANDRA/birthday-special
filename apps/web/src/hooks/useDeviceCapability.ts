/**
 * useDeviceCapability — the adaptive-particle-density / low-end-device
 * signal required by Prompt 15, Part 11 (Performance) and
 * docs/01-system-architecture.md, Section 15: "reduced particle count...
 * detected via device capability checks, not just screen width."
 *
 * Combines three coarse, cheap-to-read signals (no benchmarking, no
 * synthetic workload) into a single tier the ambient/particle layer scales
 * against:
 *   - `navigator.hardwareConcurrency` (logical CPU cores, when exposed)
 *   - `navigator.deviceMemory` (approximate device RAM in GB, Chromium-only,
 *     absent on Safari/Firefox — treated as "unknown" there, not "low")
 *   - reduced-motion preference (via useReducedMotion) — always forces the
 *     lowest tier regardless of hardware, since the visitor has explicitly
 *     asked for less motion
 */
import { useReducedMotion } from "./useReducedMotion";

export type PerformanceTier = "high" | "medium" | "low";

interface NavigatorWithHints extends Navigator {
  deviceMemory?: number;
}

export function useDeviceCapability(): PerformanceTier {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) return "low";

  if (typeof navigator === "undefined") return "medium";

  const nav = navigator as NavigatorWithHints;
  const cores = nav.hardwareConcurrency ?? 4;
  const memoryGb = nav.deviceMemory; // undefined on Safari/Firefox

  if (cores <= 2 || (memoryGb !== undefined && memoryGb <= 2)) return "low";
  if (cores <= 4 || (memoryGb !== undefined && memoryGb <= 4)) return "medium";
  return "high";
}

/** Particle-count multiplier per tier — consumed by ParticlesLayer. */
export const PARTICLE_DENSITY: Record<PerformanceTier, number> = {
  high: 1,
  medium: 0.55,
  low: 0.25,
};
