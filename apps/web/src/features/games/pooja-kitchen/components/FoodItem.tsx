/**
 * FoodItem
 *
 * Reusable food control used by the Pooja Kitchen game.
 *
 * Two contexts are supported:
 *
 *   1. "menu"
 *      Bottom kitchen food tray.
 *      Tapping starts cooking the selected food.
 *
 *   2. "cooking"
 *      Cooking station slot.
 *      Displays cooking progress, ready state, or burnt state.
 *
 * Food identity and images always come from the backend-provided
 * Food object. Nothing here is level-specific.
 */

import { motion } from "framer-motion";

import type {
  CookState,
  Food,
} from "../data/types";

import {
  foodCardTapAnimation,
  foodIdleAnimation,
  foodReadyBob,
} from "../animations/uiAnimations";


// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface FoodItemProps {

  food: Food;

  variant:
    | "menu"
    | "cooking";

  /** Only meaningful for variant="cooking". */
  cookState?: CookState;

  /** 0..1 cooking progress. */
  progress?: number;

  disabled?: boolean;

  onClick?: () => void;

}


// ---------------------------------------------------------------------------
// Food image
// ---------------------------------------------------------------------------

function FoodImage({
  food,
  size = "menu",
}: {
  food: Food;
  size?: "menu" | "cooking";
}) {

  const dimensions =
    size === "menu"
      ? "h-12 w-12"
      : "h-10 w-10";


  if (!food.image) {

    return (

      <div
        className={`
          flex
          ${dimensions}
          items-center
          justify-center
          rounded-2xl
          bg-[#E8B75D]
          font-bold
          text-[#1F2A24]
          shadow-sm
        `}
      >

        {
          food.name
            .trim()
            .charAt(0)
            .toUpperCase() || "?"
        }

      </div>

    );

  }


  return (

    <img
      src={food.image}
      alt={food.name}
      className={`
        ${dimensions}
        rounded-2xl
        object-cover
        shadow-sm
      `}
      draggable={false}
    />

  );

}


// ---------------------------------------------------------------------------
// Cooking progress ring
// ---------------------------------------------------------------------------

function CookProgressRing({
  progress,
}: {
  progress: number;
}) {

  const radius = 23;

  const circumference =
    2 * Math.PI * radius;

  const safeProgress =
    Math.max(
      0,
      Math.min(
        1,
        progress
      )
    );


  return (

    <svg
      className="
        pointer-events-none
        absolute
        -inset-1.5
        h-[calc(100%+12px)]
        w-[calc(100%+12px)]
      "
      viewBox="0 0 54 54"
      aria-hidden="true"
    >

      {/* Background ring */}

      <circle
        cx="27"
        cy="27"
        r={radius}
        fill="none"
        stroke="white"
        strokeOpacity="0.18"
        strokeWidth="3"
      />


      {/* Progress */}

      <circle
        cx="27"
        cy="27"
        r={radius}
        fill="none"
        stroke="#F5C24D"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={
          circumference *
          (1 - safeProgress)
        }
        transform="rotate(-90 27 27)"
      />

    </svg>

  );

}


// ---------------------------------------------------------------------------
// Menu food item
// ---------------------------------------------------------------------------

function MenuFoodItem({
  food,
  disabled,
  onClick,
}: {
  food: Food;
  disabled: boolean;
  onClick?: () => void;
}) {

  return (

    <motion.button
      type="button"

      whileTap={
        disabled
          ? undefined
          : foodCardTapAnimation
      }

      disabled={disabled}

      onClick={onClick}

      className="
        group
        relative
        flex
        min-w-[76px]
        flex-col
        items-center
        justify-center
        gap-1
        rounded-2xl
        border
        border-white/20
        bg-[#FFF8ED]
        px-2
        py-2
        shadow-md
        transition
        active:scale-95
        disabled:cursor-not-allowed
        disabled:opacity-35
      "

      aria-label={`Cook ${food.name}`}
    >

      {/* Food image */}

      <FoodImage
        food={food}
        size="menu"
      />


      {/* Food name */}

      <span
        className="
          max-w-[72px]
          truncate
          text-[10px]
          font-extrabold
          leading-tight
          text-[#1F2A24]
        "
      >
        {food.name}
      </span>


      {/* Reward */}

      <span
        className="
          flex
          items-center
          gap-0.5
          rounded-full
          bg-[#2F6F62]/10
          px-1.5
          py-0.5
          text-[9px]
          font-extrabold
          text-[#2F6F62]
        "
      >

        🪙
        {food.price}

      </span>


      {/* Tap hint */}

      {!disabled && (

        <span
          className="
            pointer-events-none
            absolute
            -right-1
            -top-1
            flex
            h-4
            w-4
            items-center
            justify-center
            rounded-full
            bg-[#F5C24D]
            text-[9px]
            font-black
            text-[#1F2A24]
            opacity-0
            transition-opacity
            group-hover:opacity-100
          "
        >
          +
        </span>

      )}

    </motion.button>

  );

}


// ---------------------------------------------------------------------------
// Cooking food item
// ---------------------------------------------------------------------------

function CookingFoodItem({
  food,
  cookState,
  progress,
  onClick,
}: {
  food: Food;
  cookState: CookState;
  progress: number;
  onClick?: () => void;
}) {

  const isCooking =
    cookState === "cooking";

  const isReady =
    cookState === "ready";

  const isBurnt =
    cookState === "burnt";


  return (

    <motion.button
      type="button"

      whileTap={
        isReady
          ? foodCardTapAnimation
          : undefined
      }

      disabled={!isReady}

      onClick={onClick}

      animate={
        isReady
          ? foodReadyBob.animate
          : foodIdleAnimation
      }

      transition={
        isReady
          ? foodReadyBob.transition
          : {
              duration: 0.2,
            }
      }

      className={`
        relative
        flex
        h-14
        w-14
        items-center
        justify-center
        rounded-2xl
        border
        shadow-lg
        ${
          isReady
            ? "border-[#F5C24D] bg-[#FFF8ED]"
            : isBurnt
              ? "border-[#E85D5D]/60 bg-black/30"
              : "border-white/15 bg-white/80"
        }
      `}

      aria-label={
        isReady
          ? `Collect ${food.name}`
          : `${food.name} cooking`
      }
    >

      {/* Food */}

      <FoodImage
        food={food}
        size="cooking"
      />


      {/* Cooking progress */}

      {isCooking && (

        <CookProgressRing
          progress={progress}
        />

      )}


      {/* Cooking indicator */}

      {isCooking && (

        <span
          className="
            absolute
            -bottom-2
            left-1/2
            -translate-x-1/2
            whitespace-nowrap
            rounded-full
            bg-black/60
            px-2
            py-0.5
            text-[8px]
            font-bold
            text-white
          "
        >
          Cooking
        </span>

      )}


      {/* Ready indicator */}

      {isReady && (

        <span
          className="
            absolute
            -right-1.5
            -top-1.5
            flex
            h-5
            w-5
            items-center
            justify-center
            rounded-full
            bg-[#6FCB9F]
            text-[11px]
            font-black
            text-white
            shadow-md
          "
        >
          ✓
        </span>

      )}


      {/* Ready label */}

      {isReady && (

        <span
          className="
            absolute
            -bottom-2
            left-1/2
            -translate-x-1/2
            whitespace-nowrap
            rounded-full
            bg-[#6FCB9F]
            px-2
            py-0.5
            text-[8px]
            font-black
            text-white
            shadow-sm
          "
        >
          READY
        </span>

      )}


      {/* Burnt indicator */}

      {isBurnt && (

        <span
          className="
            absolute
            -right-1.5
            -top-1.5
            flex
            h-5
            w-5
            items-center
            justify-center
            rounded-full
            bg-[#E85D5D]
            text-[11px]
            font-black
            text-white
            shadow-md
          "
        >
          !
        </span>

      )}


      {/* Burnt label */}

      {isBurnt && (

        <span
          className="
            absolute
            -bottom-2
            left-1/2
            -translate-x-1/2
            whitespace-nowrap
            rounded-full
            bg-[#E85D5D]
            px-2
            py-0.5
            text-[8px]
            font-black
            text-white
            shadow-sm
          "
        >
          BURNT
        </span>

      )}

    </motion.button>

  );

}


// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function FoodItem({

  food,

  variant,

  cookState = "idle",

  progress = 0,

  disabled = false,

  onClick,

}: FoodItemProps) {


  // -------------------------------------------------------------------------
  // Bottom food tray
  // -------------------------------------------------------------------------

  if (
    variant === "menu"
  ) {

    return (

      <MenuFoodItem
        food={food}
        disabled={disabled}
        onClick={onClick}
      />

    );

  }


  // -------------------------------------------------------------------------
  // Cooking slot
  // -------------------------------------------------------------------------

  return (

    <CookingFoodItem
      food={food}
      cookState={cookState}
      progress={progress}
      onClick={onClick}
    />

  );

}