/**
 * OrderBubble
 *
 * Compact Cooking-Madness-style customer order ticket.
 *
 * Responsibilities:
 *   - Display the food(s) requested by one customer.
 *   - Show remaining quantities.
 *   - Visually distinguish urgent orders.
 *   - Support partially served orders.
 *   - Remain completely data-driven from backend Food/Order data.
 *
 * UI principle:
 *   Food names are intentionally hidden.
 *   The food image + quantity is enough for the player to understand
 *   the order while keeping the customer area compact.
 *
 * This component is purely presentational.
 */

import { motion } from "framer-motion";

import {
  orderBubbleTransition,
  orderBubbleVariants,
  ticketClipPath,
} from "../animations/orderAnimations";


// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OrderBubbleLine {

  foodId: string;

  foodName: string;

  foodImage: string;

  quantity: number;

  quantityServed: number;

}


export interface OrderBubbleProps {

  lines: OrderBubbleLine[];

  /** Highlights an order when the customer's patience is low. */
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

  /*
   * Food image is normally supplied by the backend/admin configuration.
   *
   * Keep a fallback so a missing image never breaks the order ticket.
   */

  if (!line.foodImage) {

    return (

      <div
        className="
          flex
          h-9
          w-9
          flex-shrink-0
          items-center
          justify-center
          rounded-xl
          bg-[#E8B75D]
          text-sm
          font-black
          text-[#1F2A24]
          shadow-inner
        "
        aria-label={line.foodName}
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

    <img
      src={line.foodImage}
      alt=""
      aria-hidden="true"
      className="
        h-9
        w-9
        flex-shrink-0
        rounded-xl
        object-cover
        shadow-sm
      "
      draggable={false}
    />

  );

}


// ---------------------------------------------------------------------------
// Quantity badge
// ---------------------------------------------------------------------------

function QuantityBadge({
  remaining,
}: {
  remaining: number;
}) {

  /*
   * The quantity badge sits directly on the food icon.
   *
   * This keeps the order compact even when several food items
   * are requested by the same customer.
   */

  return (

    <span
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
        border
        border-white
        bg-[#2F6F62]
        px-1
        text-[9px]
        font-black
        leading-none
        text-white
        shadow-md
      "
    >

      x{remaining}

    </span>

  );

}


// ---------------------------------------------------------------------------
// Single compact order item
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


  /*
   * Fully served lines should not appear in the active order ticket.
   */

  if (remaining <= 0) {
    return null;
  }


  return (

    <div
      className="
        relative
        flex
        h-9
        w-9
        flex-shrink-0
        items-center
        justify-center
      "
    >

      <LineIcon
        line={line}
      />


      <QuantityBadge
        remaining={remaining}
      />

    </div>

  );

}


// ---------------------------------------------------------------------------
// Main order bubble
// ---------------------------------------------------------------------------

export function OrderBubble({
  lines,
  urgent = false,
}: OrderBubbleProps) {

  if (lines.length === 0) {
    return null;
  }


  /*
   * Only count items that still need to be served.
   */

  const activeLines =
    lines.filter(
      (line) =>
        line.quantity -
          line.quantityServed >
        0
    );


  if (activeLines.length === 0) {
    return null;
  }


  /*
   * Keep the ticket width compact.
   *
   * The ticket grows horizontally as more foods are added instead of
   * becoming a tall vertical card.
   *
   * max-width prevents an unusually large order from covering the
   * customer area. The items will wrap naturally.
   */

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
        max-w-[150px]
        flex-wrap
        items-center
        justify-center
        gap-2
        rounded-[16px]
        border
        px-2
        pb-2
        pt-2
        shadow-xl
        backdrop-blur-sm

        ${
          urgent
            ? `
              border-[#E85D5D]
              bg-[#FFF0EC]/[0.97]
              ring-2
              ring-[#E85D5D]/40
            `
            : `
              border-white/80
              bg-[#FFF8ED]/[0.97]
            `
        }
      `}

      style={{
        clipPath:
          ticketClipPath,
      }}
    >


      {/* =============================================================== */}
      {/* FOOD ICONS                                                       */}
      {/* =============================================================== */}

      {activeLines.map(
        (line) => (

          <OrderLine
            key={
              line.foodId
            }
            line={
              line
            }
          />

        )
      )}


      {/* =============================================================== */}
      {/* URGENT INDICATOR                                                 */}
      {/* =============================================================== */}

      {urgent && (

        <motion.div

          initial={{
            opacity: 0.65,
            scale: 0.9,
          }}

          animate={{
            opacity: [
              0.65,
              1,
              0.65,
            ],
            scale: [
              0.9,
              1,
              0.9,
            ],
          }}

          transition={{
            duration: 0.9,
            repeat: Infinity,
          }}

          className="
            absolute
            -right-2
            -top-2
            flex
            h-6
            w-6
            items-center
            justify-center
            rounded-full
            bg-[#E85D5D]
            text-[11px]
            font-black
            text-white
            shadow-lg
            ring-2
            ring-white
          "

          aria-label="Urgent order"
        >

          !

        </motion.div>

      )}


      {/* =============================================================== */}
      {/* TICKET TAIL                                                      */}
      {/* =============================================================== */}

      <div
        className={`
          absolute
          -bottom-[7px]
          left-1/2
          h-3
          w-3
          -translate-x-1/2
          rotate-45
          border-b
          border-r

          ${
            urgent
              ? "border-[#E85D5D] bg-[#FFF0EC]"
              : "border-[#D8D1C5] bg-[#FFF8ED]"
          }
        `}
        aria-hidden="true"
      />

    </motion.div>

  );

}