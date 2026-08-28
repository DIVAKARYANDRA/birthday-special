/**
 * OrderBubble
 *
 * Cooking-Madness-style customer order ticket.
 *
 * Responsibilities:
 *   - Clearly display the food(s) requested by one customer.
 *   - Show remaining quantities.
 *   - Visually distinguish urgent orders.
 *   - Show partially served orders.
 *   - Remain completely data-driven from backend Food/Order data.
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
      alt={line.foodName}
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

  return (

    <span
      className="
        flex
        h-6
        min-w-6
        items-center
        justify-center
        rounded-full
        bg-[#2F6F62]
        px-1.5
        text-[11px]
        font-black
        text-white
        shadow-sm
      "
    >

      x{remaining}

    </span>

  );

}


// ---------------------------------------------------------------------------
// Served indicator
// ---------------------------------------------------------------------------

function ServedIndicator({
  served,
}: {
  served: number;
}) {

  if (served <= 0) {
    return null;
  }


  return (

    <span
      className="
        text-[8px]
        font-bold
        text-[#6A756F]
      "
    >

      {served} served

    </span>

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
        flex
        min-w-0
        items-center
        gap-2
      "
    >

      {/* Food */}

      <LineIcon
        line={line}
      />


      {/* Food name + served information */}

      <div
        className="
          flex
          min-w-0
          flex-1
          flex-col
          items-start
          justify-center
        "
      >

        <span
          className="
            max-w-[96px]
            truncate
            text-[11px]
            font-black
            leading-tight
            text-[#1F2A24]
          "
        >

          {line.foodName}

        </span>


        <ServedIndicator
          served={
            line.quantityServed
          }
        />

      </div>


      {/* Remaining quantity */}

      <QuantityBadge
        remaining={
          remaining
        }
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


  const remainingItems =
    lines.reduce(
      (total, line) =>
        total +
        Math.max(
          0,
          line.quantity -
            line.quantityServed
        ),
      0
    );


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
        min-w-[118px]
        max-w-[170px]
        flex-col
        overflow-visible
        rounded-[18px]
        border
        px-2.5
        pb-2.5
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
      {/* TICKET HEADER                                                    */}
      {/* =============================================================== */}

      <div
        className="
          mb-1.5
          flex
          items-center
          justify-between
          gap-2
          border-b
          border-[#D8D1C5]
          pb-1.5
        "
      >

        <span
          className="
            text-[9px]
            font-black
            uppercase
            tracking-[0.08em]
            text-[#6A756F]
          "
        >

          Order

        </span>


        {/* Total remaining */}

        <span
          className={`
            rounded-full
            px-1.5
            py-0.5
            text-[8px]
            font-black

            ${
              urgent
                ? "bg-[#E85D5D] text-white"
                : "bg-[#E8E1D6] text-[#4C5751]"
            }
          `}
        >

          {remainingItems}
          {" "}
          {remainingItems === 1
            ? "item"
            : "items"}

        </span>

      </div>


      {/* =============================================================== */}
      {/* FOOD LINES                                                       */}
      {/* =============================================================== */}

      <div
        className="
          flex
          flex-col
          gap-1.5
        "
      >

        {lines.map(
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

      </div>


      {/* =============================================================== */}
      {/* URGENT INDICATOR                                                 */}
      {/* =============================================================== */}

      {urgent && (

        <motion.div
          initial={{
            opacity: 0.65,
          }}
          animate={{
            opacity: [
              0.65,
              1,
              0.65,
            ],
          }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
          }}
          className="
            absolute
            -right-1.5
            -top-1.5
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