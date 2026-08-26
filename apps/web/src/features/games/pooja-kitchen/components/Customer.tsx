/**
 * Customer
 *
 * Renders a single customer at the counter with Framer Motion transitions
 * between lifecycle states. Avatars are always URLs supplied by the
 * parent (ultimately sourced from backend media) — this component never
 * hardcodes an image asset. When a URL is missing (e.g. in mock/dev
 * data) it falls back to a simple initials badge so the layout never
 * breaks on a broken <img>.
 */

import { motion } from 'framer-motion';
import type { CustomerState } from '../data/types';
import {
  customerContainerTransition,
  customerContainerVariants,
  resolveCustomerMotion,
} from '../animations/customerAnimations';

export interface CustomerProps {
  name: string;
  avatar: string;
  happyAvatar: string;
  angryAvatar: string;
  patienceSeconds: number;
  /** Current lifecycle state driving which avatar/animation is shown. */
  state: CustomerState;
  /** Seconds of patience left; used to drive the patience ring. */
  patienceRemaining: number;
  /** Called when this customer is tapped (e.g. to focus their order). */
  onSelect?: () => void;
  /** Called by the parent's AnimatePresence once the exit animation ends. */
  onExitComplete?: () => void;
}

function resolveAvatar(props: CustomerProps): string {
  if (props.state === 'happy') return props.happyAvatar || props.avatar;
  if (props.state === 'angry') return props.angryAvatar || props.avatar;
  return props.avatar;
}

function AvatarImage({ src, name }: { src: string; name: string }) {
  if (!src) {
    const initial = name.trim().charAt(0).toUpperCase() || '?';
    return (
      <div className="flex h-full w-full items-center justify-center rounded-full bg-[#F5C24D] font-[Fredoka,ui-rounded,sans-serif] text-lg font-bold text-[#1F2A24]">
        {initial}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      className="h-full w-full rounded-full object-cover"
      draggable={false}
    />
  );
}

export function Customer(props: CustomerProps) {
  const {
    name,
    patienceSeconds,
    state,
    patienceRemaining,
    onSelect,
    onExitComplete,
  } = props;

  const patienceRatio =
    patienceSeconds > 0
      ? Math.max(0, Math.min(1, patienceRemaining / patienceSeconds))
      : 1;
  const isLowPatience = patienceRatio <= 0.25 && state === 'waiting';

  return (
    <motion.button
      type="button"
      layout
      onClick={onSelect}
      onAnimationComplete={() => {
        if (state === 'leaving') onExitComplete?.();
      }}
      initial="entering"
      animate={state}
      exit="leaving"
      variants={customerContainerVariants}
      transition={customerContainerTransition}
      className="
relative
flex
w-20
h-28
flex-shrink-0
flex-col
items-center

"
      aria-label={`Customer ${name}`}
    >
      <motion.div
        className="
relative
h-14
w-14
-translate-y-4
overflow-visible
rounded-full
ring-2
ring-white/70
"
        {...resolveCustomerMotion(state)}
      >
        <AvatarImage src={resolveAvatar(props)} name={name} />

        {state === 'waiting' && (
          <svg
            className="pointer-events-none absolute -inset-1"
            viewBox="0 0 64 64"
          >
            <circle
              cx="32"
              cy="32"
              r="29"
              fill="none"
              stroke={isLowPatience ? '#E85D5D' : '#2F6F62'}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 29}
              strokeDashoffset={2 * Math.PI * 29 * (1 - patienceRatio)}
              transform="rotate(-90 32 32)"
            />
          </svg>
        )}
      </motion.div>

      <span className="max-w-[8rem] truncate text-[11px] font-semibold text-white drop-shadow">
        {name}
      </span>
    </motion.button>
  );
}
