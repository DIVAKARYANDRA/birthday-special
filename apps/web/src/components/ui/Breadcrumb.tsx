/**
 * Breadcrumb — secondary wayfinding, per Prompt 15, Part 4. Paired with
 * a back button (browser/router history), shown at the top of any scene
 * reached FROM the World Map, so a visitor several taps deep always has
 * a clear way back without relying solely on the bottom nav's flat
 * top-level jumps.
 */
import { useNavigate } from "react-router-dom";

interface BreadcrumbProps {
  label: string;
}

export default function Breadcrumb({ label }: BreadcrumbProps) {
  const navigate = useNavigate();

  return (
    <div
      className="flex items-center gap-2 px-4 pt-3 text-sm text-white/70"
      style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top))" }}
    >
      <button
        onClick={() => navigate("/world")}
        aria-label="Back to World Map"
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-lg active:scale-90"
      >
        ←
      </button>
      <span className="opacity-70">World Map</span>
      <span aria-hidden="true" className="opacity-40">
        /
      </span>
      <span className="font-medium text-white">{label}</span>
    </div>
  );
}
