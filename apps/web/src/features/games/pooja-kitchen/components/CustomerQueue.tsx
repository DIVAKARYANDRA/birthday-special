/**
 * CustomerQueue
 *
 * Renders the horizontal row of customers currently in the kitchen,
 * each with their order ticket floating above them (Cooking-Madness
 * style). Mount/unmount transitions (entering/leaving) are handled by
 * wrapping the list in AnimatePresence here, since Framer Motion exit
 * animations require the animated element's parent to own the
 * AnimatePresence boundary.
 */

import { AnimatePresence } from 'framer-motion';
import { Customer } from './Customer';
import { OrderBubble, type OrderBubbleLine } from './OrderBubble';
import type { Customer as CustomerModel, Food, Order } from '../data/types';

export interface CustomerQueueProps {
  customers: CustomerModel[];
  orders: Order[];
  foods: Food[];
  onSelectCustomer?: (customerInstanceId: string) => void;
  /** Called once a customer's leaving animation has fully finished. */
  onCustomerExited?: (customerInstanceId: string) => void;
}

function buildOrderLines(order: Order | undefined, foods: Food[]): OrderBubbleLine[] {
  if (!order) return [];
  return order.lines
    .filter((line) => line.quantityServed < line.quantity)
    .map((line) => {
      const food = foods.find((f) => f.id === line.foodId);
      return {
        foodId: line.foodId,
        foodName: food?.name ?? 'Unknown',
        foodImage: food?.image ?? '',
        quantity: line.quantity,
        quantityServed: line.quantityServed,
      };
    });
}

export function CustomerQueue({
  customers,
  orders,
  foods,
  onSelectCustomer,
  onCustomerExited,
}: CustomerQueueProps) {
  const visibleCustomers = [...customers].sort((a, b) => a.slot - b.slot);

  return (
    <div
      className="flex w-full items-end gap-4 overflow-x-auto px-3 pb-2 pt-10"
      aria-label="Customer queue"
    >
      <AnimatePresence>
        {visibleCustomers.map((customer) => {
          const order = orders.find((o) => o.id === customer.orderId);
          const lines = buildOrderLines(order, foods);
          const urgent =
            customer.state === 'waiting' &&
            customer.patienceSeconds > 0 &&
            customer.patienceRemaining / customer.patienceSeconds <= 0.25;

          return (
            <div
              key={customer.instanceId}
              className="relative flex flex-shrink-0 flex-col items-center"
            >
              {(customer.state === 'waiting' || customer.state === 'angry') &&
                lines.length > 0 && (
                  <div className="absolute -top-9 left-1/2 -translate-x-1/2">
                    <OrderBubble lines={lines} urgent={urgent} />
                  </div>
                )}
              <Customer
                name={customer.name}
                avatar={customer.avatar}
                happyAvatar={customer.happyAvatar}
                angryAvatar={customer.angryAvatar}
                patienceSeconds={customer.patienceSeconds}
                state={customer.state}
                patienceRemaining={customer.patienceRemaining}
                onSelect={() => onSelectCustomer?.(customer.instanceId)}
                onExitComplete={() => onCustomerExited?.(customer.instanceId)}
              />
            </div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
