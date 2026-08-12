/**
 * ComingSoonScene — the destination for World Map nodes whose real
 * content is explicitly out of this prompt's scope (Game Zone, Birthday
 * Castle, Secret Room — per Prompt 15's exclusions: "Games, Birthday
 * Castle content, Final celebration"). A real, reachable route rather
 * than a dead tap or 404, with a clear back path via Breadcrumb.
 */
import SceneLayout from "@/components/global/SceneLayout";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function ComingSoonScene() {
  return (
    <SceneLayout mode="twilight">
      <Breadcrumb label="Coming Soon" />
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <span aria-hidden="true" className="mb-4 text-4xl">
          ✨
        </span>
        <h1 className="mb-2 font-display text-xl text-white">Something magical is being prepared</h1>
        <p className="max-w-xs text-sm text-white/60">This part of the journey isn&apos;t ready yet — check back soon.</p>
      </div>
    </SceneLayout>
  );
}
