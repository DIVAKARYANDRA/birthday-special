/**
 * CustomerQueue
 *
 * Renders the customer line and the order ticket belonging to each customer.
 *
 * UI principles:
 *   - Each order ticket is visually anchored to its customer.
 *   - The customer remains the primary visual element.
 *   - Orders can contain multiple food items.
 *   - The layout scales to larger/future levels without knowing anything
 *     about specific customers or foods.
 *
 * Game logic remains outside this component.
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


// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CustomerQueueProps {

  customers: CustomerModel[];

  orders: Order[];

  foods: Food[];

  onSelectCustomer?: (
    customerInstanceId: string
  ) => void;

  /** Called after a customer's leaving animation has completed. */
  onCustomerExited?: (
    customerInstanceId: string
  ) => void;

}


// ---------------------------------------------------------------------------
// Build order lines
// ---------------------------------------------------------------------------

function buildOrderLines(
  order: Order | undefined,
  foods: Food[]
): OrderBubbleLine[] {

  if (!order) {
    return [];
  }


  return order.lines
    .filter(
      (line) =>
        line.quantityServed <
        line.quantity
    )
    .map(
      (line) => {

        const food =
          foods.find(
            (item) =>
              item.id ===
              line.foodId
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

      }
    );

}


// ---------------------------------------------------------------------------
// Customer order wrapper
// ---------------------------------------------------------------------------

function CustomerWithOrder({
  customer,
  lines,
  urgent,
  onSelectCustomer,
  onCustomerExited,
}: {
  customer: CustomerModel;

  lines: OrderBubbleLine[];

  urgent: boolean;

  onSelectCustomer?: (
    customerInstanceId: string
  ) => void;

  onCustomerExited?: (
    customerInstanceId: string
  ) => void;
}) {

  const canServe =
    customer.state === "waiting" &&
    lines.length > 0;


  return (

    <motion.div
      layout
      className="
        relative
        flex
        min-w-0
        flex-shrink-0
        flex-col
        items-center
      "
    >

      {/* =============================================================== */}
      {/* ORDER TICKET                                                    */}
      {/* =============================================================== */}

      <div
        className="
          relative
          z-30
          mb-1
          flex
          min-h-[54px]
          items-end
          justify-center
        "
      >

        {(customer.state === "waiting" ||
          customer.state === "angry") &&
          lines.length > 0 && (

            <div
              className="
                absolute
                bottom-0
                left-1/2
                -translate-x-1/2
              "
            >

              <OrderBubble
                lines={lines}
                urgent={urgent}
              />

            </div>

          )}

      </div>


      {/* =============================================================== */}
      {/* CUSTOMER                                                         */}
      {/* =============================================================== */}

      <div
        className={`
          relative
          rounded-[28px]
          ${
            canServe
              ? "cursor-pointer"
              : ""
          }
        `}
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


      {/* =============================================================== */}
      {/* CUSTOMER → ORDER CONNECTION                                      */}
      {/* =============================================================== */}

      {(customer.state === "waiting" ||
        customer.state === "angry") &&
        lines.length > 0 && (

          <div
            className="
              pointer-events-none
              absolute
              top-[50px]
              z-20
              h-3
              w-[2px]
              bg-white/60
            "
            aria-hidden="true"
          />

        )}


      {/* =============================================================== */}
      {/* ORDER RELATION LABEL                                             */}
      {/* =============================================================== */}

      {canServe && (

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.85,
          }}

          animate={{
            opacity: 1,
            scale: 1,
          }}

          className="
            pointer-events-none
            absolute
            -bottom-5
            z-30
            whitespace-nowrap
            rounded-full
            bg-black/55
            px-2
            py-0.5
            text-[8px]
            font-black
            uppercase
            tracking-wide
            text-white
            backdrop-blur-sm
          "
        >

          Tap to serve

        </motion.div>

      )}

    </motion.div>

  );

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


  /*
   * The game engine already assigns each customer a slot.
   *
   * We sort by slot instead of relying on array order so future levels
   * can freely change customer spawning without changing this component.
   */

  const visibleCustomers =
    [...customers].sort(
      (a, b) =>
        a.slot - b.slot
    );


  return (

    <div
      className="
        relative
        flex
        w-full
        items-end
        justify-center
        overflow-visible
        px-2
      "
      aria-label="Customer queue"
    >

      {/* =============================================================== */}
      {/* CUSTOMER ROW                                                     */}
      {/* =============================================================== */}

      <div
        className="
          flex
          max-w-full
          items-end
          justify-center
          gap-2
          overflow-visible
          px-2
        "
      >

        <AnimatePresence
          initial={false}
          mode="popLayout"
        >

          {visibleCustomers.map(
            (customer) => {

              const order =
                orders.find(
                  (item) =>
                    item.id ===
                    customer.orderId
                );


              const lines =
                buildOrderLines(
                  order,
                  foods
                );


              const patienceRatio =
                customer.patienceSeconds > 0
                  ? customer.patienceRemaining /
                    customer.patienceSeconds
                  : 1;


              const urgent =
                customer.state ===
                  "waiting" &&
                patienceRatio <=
                  0.25;


              return (

                <CustomerWithOrder
                  key={
                    customer.instanceId
                  }

                  customer={
                    customer
                  }

                  lines={
                    lines
                  }

                  urgent={
                    urgent
                  }

                  onSelectCustomer={
                    onSelectCustomer
                  }

                  onCustomerExited={
                    onCustomerExited
                  }
                />

              );

            }
          )}

        </AnimatePresence>

      </div>

    </div>

  );

}