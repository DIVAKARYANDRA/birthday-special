/**
 * FoodItem
 *
 * Renders a single food item in one of two contexts:
 *   - "menu": a tappable card used to start cooking that food.
 *   - "cooking": the state of a station's slot while an item is
 *     cooking/ready/burnt, with a radial progress indicator.
 *
 * Images always come from `food.image` (a backend media URL) — never
 * hardcoded — with a graceful fallback when it's empty (mock/dev data).
 */

import { motion } from 'framer-motion';
import type { CookState, Food } from '../data/types';
import {
  foodCardTapAnimation,
  foodIdleAnimation,
  foodReadyBob,
} from '../animations/uiAnimations';

export interface FoodItemProps {
  food: Food;
  variant: 'menu' | 'cooking';
  /** Only meaningful for variant="cooking". */
  cookState?: CookState;
  /** 0..1 cook progress, only meaningful for variant="cooking". */
  progress?: number;
  disabled?: boolean;
  onClick?: () => void;
}

function FoodImage({ food }: { food: Food }) {
  if (!food.image) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8B75D] text-sm font-bold text-[#1F2A24]">
        {food.name.trim().charAt(0).toUpperCase() || '?'}
      </div>
    );
  }
  return (
    <img
      src={food.image}
      alt={food.name}
      className="h-10 w-10 rounded-xl object-cover"
      draggable={false}
    />
  );
}

function CookProgressRing({ progress }: { progress: number }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  return (
    <svg className="pointer-events-none absolute -inset-1.5" viewBox="0 0 48 48">
      <circle
        cx="24"
        cy="24"
        r={radius}
        fill="none"
        stroke="#F5C24D"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - Math.max(0, Math.min(1, progress)))}
        transform="rotate(-90 24 24)"
      />
    </svg>
  );
}

export function FoodItem({
  food,
  variant,
  cookState = 'idle',
  progress = 0,
  disabled = false,
  onClick,
}: FoodItemProps) {
  if (variant === 'menu') {
    return (
      <motion.button
        type="button"
        whileTap={foodCardTapAnimation}
        disabled={disabled}
        onClick={onClick}
        className="flex flex-col items-center gap-0.5 rounded-2xl bg-[#FFF8ED] px-2 py-2 shadow-sm disabled:opacity-40"
        aria-label={`Cook ${food.name}`}
      >
        <FoodImage food={food} />
        <span className="text-[10px] font-bold text-[#1F2A24]">{food.name}</span>
        <span className="text-[10px] font-semibold text-[#2F6F62]">
          +{food.price}
        </span>
      </motion.button>
    );
  }

  const isReady = cookState === 'ready';
  const isBurnt = cookState === 'burnt';

  return (
    <motion.button
      type="button"
      whileTap={isReady ? foodCardTapAnimation : undefined}
      disabled={!isReady}
      onClick={onClick}
      animate={isReady ? foodReadyBob.animate : foodIdleAnimation}
      transition={isReady ? foodReadyBob.transition : { duration: 0.2 }}
      className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-transparent disabled:cursor-default"
      aria-label={
        isReady ? `Collect ${food.name}` : `${food.name} cooking`
      }
    >
      <FoodImage food={food} />
      {cookState === 'cooking' && <CookProgressRing progress={progress} />}
      {isReady && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#6FCB9F] text-[10px] font-bold text-white">
          ✓
        </span>
      )}
      {isBurnt && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E85D5D] text-[10px] font-bold text-white">
          !
        </span>
      )}
    </motion.button>
  );
}
