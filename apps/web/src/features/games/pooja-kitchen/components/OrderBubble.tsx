/**
 * OrderBubble
 *
 * A café-ticket-styled bubble shown above a customer, e.g.
 * "Coffee x1". Purely presentational — it receives already-resolved
 * line items so it has no knowledge of the Order/Food data shapes
 * beyond what it needs to render.
 */

import { motion } from 'framer-motion';
import {
  orderBubbleTransition,
  orderBubbleVariants,
  ticketClipPath,
} from '../animations/orderAnimations';

export interface OrderBubbleLine {
  foodId: string;
  foodName: string;
  foodImage: string;
  quantity: number;
  quantityServed: number;
}

export interface OrderBubbleProps {
  lines: OrderBubbleLine[];
  /** Visually flags the ticket as urgent (e.g. customer is low on patience). */
  urgent?: boolean;
}

function LineIcon({ line }: { line: OrderBubbleLine }) {
  if (!line.foodImage) {
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E8B75D] text-[10px] font-bold text-[#1F2A24]">
        {line.foodName.trim().charAt(0).toUpperCase() || '?'}
      </div>
    );
  }
  return (
    <img
      src={line.foodImage}
      alt={line.foodName}
      className="h-6 w-6 rounded-full object-cover"
      draggable={false}
    />
  );
}

export function OrderBubble({ lines, urgent = false }: OrderBubbleProps) {
  if (lines.length === 0) return null;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={orderBubbleVariants}
      transition={orderBubbleTransition}
      className={`
  relative
  flex
  flex-col
  gap-1
  rounded-xl
  border
  border-yellow-300
  px-2
  pb-3
  pt-1.5
  shadow-lg
  ${
    urgent
      ? 'bg-[#FFE9E4] ring-1 ring-[#E85D5D]'
      : 'bg-[#FFF8ED]'
  }
`}
      style={{ clipPath: ticketClipPath, minWidth: '3.5rem' }}
    >
      {lines.map((line) => {
        const remaining = line.quantity - line.quantityServed;
        return (
          <div key={line.foodId} className="flex items-center gap-1">
            <LineIcon line={line} />
            <span className="text-[11px] font-bold text-[#1F2A24]">
              x{remaining}
            </span>
          </div>
        );
      })}
    </motion.div>
  );
}
