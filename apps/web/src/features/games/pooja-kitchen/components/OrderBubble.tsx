/**
 * OrderBubble
 *
 * Cooking-Madness-style order ticket displayed directly above a customer.
 *
 * Purely presentational:
 *   - Receives already-resolved order lines.
 *   - Does not know about Order, Customer, or Food domain objects.
 *   - Displays only food images and outstanding quantities.
 *
 * The ticket is intentionally visual rather than text-heavy so the player
 * can immediately understand which customer wants which food.
 */

import { motion } from "framer-motion";

import {
  orderBubbleTransition,
  orderBubbleVariants,
  ticketClipPath,
} from "../animations/orderAnimations";


export interface OrderBubbleLine {

  foodId: string;

  foodName: string;

  foodImage: string;

  quantity: number;

  quantityServed: number;

}


export interface OrderBubbleProps {

  lines: OrderBubbleLine[];

  /**
   * Visually flags the ticket when the customer's patience
   * is running low.
   */
  urgent?: boolean;

}


// ---------------------------------------------------------------------------
// Food icon
// ---------------------------------------------------------------------------

function LineIcon({
  line,
}: {
  line: OrderBubbleLine;
}) {

  if (!line.foodImage) {

    return (

      <div
        className="
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-[#E8B75D]
          text-sm
          font-bold
          text-[#1F2A24]
          shadow-sm
        "
      >
        {
          line.foodName
            .trim()
            .charAt(0)
            .toUpperCase() || "?"
        }
      </div>

    );

  }


  return (

    <div
      className="
        relative
        h-11
        w-11
        shrink-0
      "
    >

      <img
        src={line.foodImage}
        alt={line.foodName}
        className="
          h-11
          w-11
          rounded-full
          object-cover
          shadow-sm
        "
        draggable={false}
      />

    </div>

  );

}


// ---------------------------------------------------------------------------
// Quantity badge
// ---------------------------------------------------------------------------

function QuantityBadge({
  quantity,
}: {
  quantity: number;
}) {

  return (

    <div
      className="
        absolute
        -bottom-1
        -right-1
        flex
        h-5
        min-w-5
        items-center
        justify-center
        rounded-full
        border-2
        border-[#FFF8ED]
        bg-[#E85D5D]
        px-1
        text-[9px]
        font-extrabold
        leading-none
        text-white
        shadow-sm
      "
    >
      ×{quantity}
    </div>

  );

}


// ---------------------------------------------------------------------------
// Single order line
// ---------------------------------------------------------------------------

function OrderLine({
  line,
}: {
  line: OrderBubbleLine;
}) {

  const remaining =
    Math.max(
      0,
      line.quantity -
      line.quantityServed
    );


  if (remaining <= 0) {
    return null;
  }


  return (

    <div
      className="
        relative
        flex
        flex-col
        items-center
        justify-center
      "
    >

      <LineIcon
        line={line}
      />

      <QuantityBadge
        quantity={remaining}
      />

    </div>

  );

}


// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function OrderBubble({
  lines,
  urgent = false,
}: OrderBubbleProps) {

  if (lines.length === 0) {
    return null;
  }


  return (

    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"

      variants={
        orderBubbleVariants
      }

      transition={
        orderBubbleTransition
      }

      className={`
        relative
        flex
        min-h-[64px]
        items-center
        justify-center
        gap-3
        rounded-2xl
        border-2
        px-3
        pb-4
        pt-3
        shadow-xl
        backdrop-blur-sm

        ${
          urgent
            ? `
              border-[#E85D5D]
              bg-[#FFE9E4]
              ring-2
              ring-[#E85D5D]/30
            `
            : `
              border-[#F5C24D]
              bg-[#FFF8ED]
            `
        }
      `}

      style={{
        clipPath:
          ticketClipPath,
        minWidth:
          lines.length === 1
            ? "4.75rem"
            : "7rem",
      }}
    >

      {/* ================================================================ */}
      {/* FOOD ITEMS                                                       */}
      {/* ================================================================ */}

      {lines.map(
        (line) => (

          <OrderLine
            key={line.foodId}
            line={line}
          />

        )
      )}


      {/* ================================================================ */}
      {/* SMALL POINTER                                                    */}
      {/* ================================================================ */}

      <div
        className="
          pointer-events-none
          absolute
          -bottom-2
          left-1/2
          h-4
          w-4
          -translate-x-1/2
          rotate-45
          border-b-2
          border-r-2
          border-[#F5C24D]
          bg-[#FFF8ED]
        "
      />

    </motion.div>

  );

}