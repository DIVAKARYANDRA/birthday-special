/**
 * SceneLayout — per docs/01-system-architecture.md, Section 4: owns
 * ambient background + navigation chrome for every scene; individual
 * scenes compose content INSIDE it, never manage their own background.
 *
 * `bottomPadding` reserves space above the safe-area-aware BottomNav
 * (Part 4/10) so scrollable scene content is never hidden behind it —
 * every scene using BottomNav should pass `showBottomNav`.
 */
import type { ReactNode } from "react";

import AmbientBackground, { type AmbientMode } from "./AmbientBackground";
import BottomNav from "./BottomNav";

interface SceneLayoutProps {
  mode?: AmbientMode;
  showMoon?: boolean;
  showFireflies?: boolean;
  showBottomNav?: boolean;
  children: ReactNode;
}

export default function SceneLayout({
  mode = "night",
  showMoon = true,
  showFireflies = false,
  showBottomNav = true,
  children,
}: SceneLayoutProps) {
  return (
    <AmbientBackground mode={mode} showMoon={showMoon} showFireflies={showFireflies}>
      <div
        className="flex min-h-screen w-full flex-col"
        style={{ paddingBottom: showBottomNav ? "calc(4.5rem + env(safe-area-inset-bottom))" : undefined }}
      >
        {children}
      </div>
      {showBottomNav && <BottomNav />}
    </AmbientBackground>
  );
}
