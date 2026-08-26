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

  name:string;

  avatar:string;

  happyAvatar:string;

  angryAvatar:string;


  /**
   * Maximum patience time for this customer
   */
  patienceSeconds:number;


  /**
   * Current remaining patience time
   */
  patienceRemaining:number;


  /**
   * Current customer mood state
   */
  state:CustomerState;


  onSelect?:()=>void;

  onExitComplete?:()=>void;

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
      className="h-full w-full object-contain"
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

  // const patienceRatio =
  //   patienceSeconds > 0
  //     ? Math.max(0, Math.min(1, patienceRemaining / patienceSeconds))
  //     : 1;

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
w-32
h-44
flex-shrink-0
flex-col
items-center
"
      aria-label={`Customer ${name}`}
    >
      <motion.div
        className="
relative
flex
w-32
h-44
flex-shrink-0
flex-col
items-center



"
        {...resolveCustomerMotion(state)}
      >
        <AvatarImage src={resolveAvatar(props)} name={name} />


      </motion.div>

      <span className="absolute
bottom-0
text-[11px]
font-semibold
text-white
drop-shadow
">
        {name}
      </span>
    </motion.button>
  );
}
