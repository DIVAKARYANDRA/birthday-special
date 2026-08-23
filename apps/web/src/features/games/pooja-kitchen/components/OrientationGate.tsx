/**
 * OrientationGate
 *
 * Pooja Kitchen is designed for landscape play (the customer counter and
 * kitchen stations need horizontal room). Rather than fighting portrait
 * layouts, this gate shows a "rotate your device" prompt whenever the
 * viewport is in portrait orientation and only renders the game itself
 * once the device is rotated to landscape.
 *
 * Implemented with Tailwind's built-in `portrait:`/`landscape:` variants
 * (CSS media queries) rather than a JS resize listener — this avoids any
 * flash-of-wrong-content on load and needs no effect/cleanup wiring.
 */

import { motion } from 'framer-motion';

export interface OrientationGateProps {
  children: React.ReactNode;
}

export function OrientationGate({ children }: OrientationGateProps) {
  return (
    <>
      <div className="hidden h-dvh w-full landscape:block">{children}</div>

      <div
        className="flex h-dvh w-full flex-col items-center justify-center gap-4 bg-[#1F4D45] px-8 text-center landscape:hidden"
        aria-live="polite"
      >
        <motion.div
          animate={{ rotate: [0, 90, 90, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, times: [0, 0.5, 0.85, 1] }}
          className="text-5xl"
          aria-hidden="true"
        >
          📱
        </motion.div>
        <p className="font-[Fredoka,ui-rounded,sans-serif] text-xl font-bold text-white">
          Rotate your device
        </p>
        <p className="max-w-[16rem] text-sm text-white/70">
          Pooja Kitchen plays best in landscape — turn your phone
          sideways to start cooking.
        </p>
      </div>
    </>
  );
}
