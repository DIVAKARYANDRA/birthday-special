/**
 * CustomerQueue
 *
 * Renders the horizontal row of customers currently in the kitchen.
 *
 * Each customer owns their own order ticket, which is positioned directly
 * above that customer — Cooking Madness style.
 *
 * Responsibilities:
 *   - Sort customers by queue slot.
 *   - Resolve customer -> order -> food.
 *   - Render each customer's outstanding order.
 *   - Handle customer selection.
 *   - Handle leaving animation completion.
 *
 * Game rules remain outside this component.
 */

import { AnimatePresence, motion } from "framer-motion";

import { Customer } from "./Customer";
import {
  OrderBubble,
  type OrderBubbleLine,
} from "./OrderBubble";

import type {
  Customer as CustomerModel,
  Food,
  Order,
} from "../data/types";


export interface CustomerQueueProps {

  customers: CustomerModel[];

  orders: Order[];

  foods: Food[];

  onSelectCustomer?: (
    customerInstanceId: string
  ) => void;

  /**
   * Called once a customer's leaving animation
   * has completely finished.
   */
  onCustomerExited?: (
    customerInstanceId: string
  ) => void;

}


// ---------------------------------------------------------------------------
// Build the outstanding food lines for one customer
// ---------------------------------------------------------------------------

function buildOrderLines(
  order: Order | undefined,
  foods: Food[]
): OrderBubbleLine[] {

  if (!order) {
    return [];
  }

  return order.lines

    // Only show food that is still required.
    .filter(
      (line) =>
        line.quantityServed <
        line.quantity
    )

    .map((line) => {

      const food =
        foods.find(
          (item) =>
            item.id === line.foodId
        );

      return {

        foodId:
          line.foodId,

        foodName:
          food?.name ??
          "Unknown",

        foodImage:
          food?.image ??
          "",

        quantity:
          line.quantity,

        quantityServed:
          line.quantityServed,

      };

    });

}


// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function CustomerQueue({

  customers,

  orders,

  foods,

  onSelectCustomer,

  onCustomerExited,

}: CustomerQueueProps) {


  // -------------------------------------------------------------------------
  // Queue order
  // -------------------------------------------------------------------------

  const visibleCustomers =
    [...customers]
      .sort(
        (a, b) =>
          a.slot - b.slot
      );


  return (

    <div
      className="
        relative
        flex
        h-[190px]
        w-full
        items-end
        justify-center
        overflow-visible
        px-2
      "
      aria-label="Customer queue"
    >

      <AnimatePresence
        initial={false}
      >

        {visibleCustomers.map(
          (customer) => {

            // ---------------------------------------------------------------
            // Find this customer's order
            // ---------------------------------------------------------------

            const order =
              orders.find(
                (item) =>
                  item.id ===
                  customer.orderId
              );


            // ---------------------------------------------------------------
            // Find outstanding food
            // ---------------------------------------------------------------

            const lines =
              buildOrderLines(
                order,
                foods
              );


            // ---------------------------------------------------------------
            // Patience / urgency
            // ---------------------------------------------------------------

            const urgent =
              customer.state === "waiting" &&
              customer.patienceSeconds > 0 &&
              (
                customer.patienceRemaining /
                customer.patienceSeconds
              ) <= 0.25;


            // ---------------------------------------------------------------
            // Only show an order ticket while customer is waiting/angry.
            // ---------------------------------------------------------------

            const showOrder =
              (
                customer.state === "waiting" ||
                customer.state === "angry"
              ) &&
              lines.length > 0;


            return (

              <motion.div
                key={
                  customer.instanceId
                }

                layout

                initial={{
                  opacity: 0,
                  x: 40,
                  y: 20,
                  scale: 0.9,
                }}

                animate={{
                  opacity: 1,
                  x: 0,
                  y: 0,
                  scale: 1,
                }}

                exit={{
                  opacity: 0,
                  x: -50,
                  y: 20,
                  scale: 0.9,
                }}

                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                }}

                className="
                  relative
                  flex
                  h-full
                  min-w-[105px]
                  max-w-[140px]
                  flex-shrink-0
                  flex-col
                  items-center
                  justify-end
                "
              >

                {/* ======================================================= */}
                {/* CUSTOMER ORDER TICKET                                   */}
                {/* ======================================================= */}

                <AnimatePresence>

                  {showOrder && (

                    <motion.div
                      key="order"

                      initial={{
                        opacity: 0,
                        y: 10,
                        scale: 0.85,
                      }}

                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}

                      exit={{
                        opacity: 0,
                        y: 6,
                        scale: 0.85,
                      }}

                      transition={{
                        duration: 0.2,
                      }}

                      className="
                        absolute
                        bottom-[88px]
                        left-1/2
                        z-40
                        -translate-x-1/2
                        whitespace-nowrap
                      "
                    >

                      <OrderBubble
                        lines={lines}
                        urgent={urgent}
                      />

                    </motion.div>

                  )}

                </AnimatePresence>


                {/* ======================================================= */}
                {/* CUSTOMER                                                 */}
                {/* ======================================================= */}

                <div
                  className="
                    relative
                    z-20
                    flex
                    items-end
                    justify-center
                  "
                >

                  <Customer
                    name={
                      customer.name
                    }

                    avatar={
                      customer.avatar
                    }

                    happyAvatar={
                      customer.happyAvatar
                    }

                    angryAvatar={
                      customer.angryAvatar
                    }

                    patienceSeconds={
                      customer.patienceSeconds
                    }

                    state={
                      customer.state
                    }

                    patienceRemaining={
                      customer.patienceRemaining
                    }

                    onSelect={() =>
                      onSelectCustomer?.(
                        customer.instanceId
                      )
                    }

                    onExitComplete={() =>
                      onCustomerExited?.(
                        customer.instanceId
                      )
                    }
                  />

                </div>


                {/* ======================================================= */}
                {/* SMALL POINTER FROM TICKET TO CUSTOMER                  */}
                {/* ======================================================= */}

                {showOrder && (

                  <div
                    className="
                      pointer-events-none
                      absolute
                      bottom-[79px]
                      left-1/2
                      z-[39]
                      h-0
                      w-0
                      -translate-x-1/2
                      border-l-[7px]
                      border-r-[7px]
                      border-t-[9px]
                      border-l-transparent
                      border-r-transparent
                      border-t-white/95
                    "
                  />

                )}

              </motion.div>

            );

          }
        )}

      </AnimatePresence>

    </div>

  );

}