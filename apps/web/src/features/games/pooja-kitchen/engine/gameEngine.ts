/**
 * Pooja Kitchen game engine.
 *
 * Framework-agnostic: this class knows nothing about React. It owns the
 * authoritative game state (timer, score, coins, customers, orders,
 * cooking slots) for a single level attempt and mutates it in response
 * to explicit actions (start, cookFood, serveCustomer, tick, ...).
 *
 * `usePoojaKitchenGame` is the only consumer expected in this codebase —
 * it instantiates one engine per level attempt, subscribes to state
 * changes, and exposes them as React state. Keeping the engine framework
 * -agnostic means the same class can back a non-React shell (tests, a
 * future native wrapper, etc.) without modification.
 */

import type {
  Customer,
  CustomerState,
  CookingSlot,
  Food,
  GameState,
  Level,
  LevelResult,
  Order,
  OrderLine,
} from '../data/types';

type Listener = (state: GameState) => void;

let instanceCounter = 0;
function nextInstanceId(prefix: string): string {
  instanceCounter += 1;
  return `${prefix}-${instanceCounter}`;
}

const MAX_QUEUE_SLOTS = 3;

function buildOrdersAndCustomers(level: Level): {
  customers: Customer[];
  orders: Order[];
} {
  const customers: Customer[] = level.customers.map((definition, index) => ({
    ...definition,
    instanceId: nextInstanceId('customer'),
    state: 'waiting',
    orderId: null,
    patienceRemaining: definition.patienceSeconds,
    slot: index,
  }));

  const orders: Order[] = level.orderTemplates.map((template, index) => {
    const customer = customers.find(
  (c) => c.id === template.customerId
);
    const lines: OrderLine[] = template.lines.map((line) => ({
      foodId: line.foodId,
      quantity: line.quantity,
      quantityServed: 0,
    }));

    const order: Order = {
      id: nextInstanceId('order'),
      customerInstanceId: customer?.instanceId ?? '',
      lines,
      rewardPoints: template.rewardPoints,
      status: 'pending',
    };

    if (customer) {
      customer.orderId = order.id;
    }

    return order;
  });

  return { customers, orders };
}

function buildCookingSlots(level: Level): CookingSlot[] {
  const slots: CookingSlot[] = [];
  for (const station of level.stations) {
    for (let i = 0; i < station.capacity; i += 1) {
      slots.push({
        id: nextInstanceId('slot'),
        stationId: station.id,
        food: null,
        state: 'idle',
        elapsedMs: 0,
      });
    }
  }
  return slots;
}

export class PoojaKitchenGameEngine {
  private state: GameState;
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.state = {
      status: 'idle',
      level: null,
      timeRemainingSeconds: 0,
      score: 0,
      coins: 0,
      customers: [],
      orders: [],
      cookingSlots: [],
      result: null,
    };
  }

  // --------------------------------------------------------------
  // Subscription
  // --------------------------------------------------------------

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getState(): GameState {
    return this.state;
  }

  private setState(patch: Partial<GameState>): void {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((listener) => listener(this.state));
  }

  // --------------------------------------------------------------
  // Lifecycle
  // --------------------------------------------------------------

  loadLevel(level: Level): void {
    const { customers, orders } = buildOrdersAndCustomers(level);
    const cookingSlots = buildCookingSlots(level);

    this.setState({
      status: 'ready',
      level,
      timeRemainingSeconds: level.timeLimit,
      score: 0,
      coins: 0,
      customers,
      orders,
      cookingSlots,
      result: null,
    });
  }

  start(): void {
    if (this.state.status !== 'ready' && this.state.status !== 'paused') {
      return;
    }
    this.setState({ status: 'playing' });
  }

  pause(): void {
    if (this.state.status !== 'playing') return;
    this.setState({ status: 'paused' });
  }

  resume(): void {
    if (this.state.status !== 'paused') return;
    this.setState({ status: 'playing' });
  }

  /**
   * Advance the simulation by `deltaMs`. Intended to be driven by a
   * requestAnimationFrame/interval loop in the React hook — the engine
   * itself never schedules its own timers, keeping it trivially
   * testable.
   */
  tick(deltaMs: number): void {
    if (this.state.status !== 'playing') return;

    const deltaSeconds = deltaMs / 1000;
    const timeRemainingSeconds = Math.max(
      0,
      this.state.timeRemainingSeconds - deltaSeconds
    );

    const customers = this.state.customers.map((customer) => {
      if (customer.state !== 'waiting') return customer;
      const patienceRemaining = Math.max(
        0,
        customer.patienceRemaining - deltaSeconds
      );
      if (patienceRemaining === 0) {
        return { ...customer, patienceRemaining, state: 'angry' as const };
      }
      return { ...customer, patienceRemaining };
    });

    // Any customer who just went angry expires their order.
    const orders = this.state.orders.map((order) => {
      if (order.status !== 'pending') return order;
      const customer = customers.find(
        (c) => c.instanceId === order.customerInstanceId
      );
      if (customer?.state === 'angry') {
        return { ...order, status: 'expired' as const };
      }
      return order;
    });

    const cookingSlots = this.state.cookingSlots.map((slot) => {
      if (slot.state !== 'cooking' || !slot.food) return slot;
      const elapsedMs = slot.elapsedMs + deltaMs;
      if (elapsedMs >= slot.food.cookTime * 1000) {
        return { ...slot, elapsedMs, state: 'ready' as const };
      }
      return { ...slot, elapsedMs };
    });

    this.setState({ timeRemainingSeconds, customers, orders, cookingSlots });

    if (timeRemainingSeconds === 0) {
      this.endLevel();
      return;
    }

    this.checkAllOrdersResolved();
  }

  // --------------------------------------------------------------
  // Cooking actions
  // --------------------------------------------------------------

  startCooking(slotId: string, food: Food): void {
    if (this.state.status !== 'playing') return;

    const cookingSlots = this.state.cookingSlots.map((slot) =>
      slot.id === slotId && slot.state === 'idle'
        ? { ...slot, food, state: 'cooking' as const, elapsedMs: 0 }
        : slot
    );
    this.setState({ cookingSlots });
  }

  /** Pick up a ready item, freeing the station for the next order. */
  collectFromSlot(slotId: string): Food | null {
    const slot = this.state.cookingSlots.find((s) => s.id === slotId);
    if (!slot || slot.state !== 'ready' || !slot.food) return null;

    const collectedFood = slot.food;
    const cookingSlots = this.state.cookingSlots.map((s) =>
      s.id === slotId ? { ...s, food: null, state: 'idle' as const, elapsedMs: 0 } : s
    );
    this.setState({ cookingSlots });
    return collectedFood;
  }

  // --------------------------------------------------------------
  // Serving / scoring
  // --------------------------------------------------------------

  /** Serve one unit of `foodId` to the customer holding `orderId`. */
  serveOrder(orderId: string, foodId: string): void {
    if (this.state.status !== 'playing') return;

    const order = this.state.orders.find((o) => o.id === orderId);
    if (!order || order.status !== 'pending') return;

    const lineIndex = order.lines.findIndex(
      (line) => line.foodId === foodId && line.quantityServed < line.quantity
    );
    if (lineIndex === -1) return; // this order doesn't want this food (or already fulfilled)

    const updatedLines = order.lines.map((line, index) =>
      index === lineIndex
        ? { ...line, quantityServed: line.quantityServed + 1 }
        : line
    );
    const isFulfilled = updatedLines.every(
      (line) => line.quantityServed >= line.quantity
    );

    const updatedOrder: Order = {
      ...order,
      lines: updatedLines,
      status: isFulfilled ? 'fulfilled' : 'pending',
    };

    const orders = this.state.orders.map((o) =>
      o.id === orderId ? updatedOrder : o
    );

    let { score, coins } = this.state;
    let customers = this.state.customers;

    if (isFulfilled) {
  score += updatedOrder.rewardPoints;
  coins += this.calculateCoinsForOrder(updatedOrder);

  customers = customers.map((customer) =>
    customer.instanceId === updatedOrder.customerInstanceId
      ? {
          ...customer,
          state: 'happy' as const,
        }
      : customer
  );
}

this.setState({
  orders,
  score,
  coins,
  customers,
});


if (isFulfilled) {
  const customerId = updatedOrder.customerInstanceId;

  setTimeout(() => {
    this.advanceCustomer(customerId);

    setTimeout(() => {
      this.removeCustomer(customerId);
    }, 800);

  }, 2000);
}
    this.checkAllOrdersResolved();
  }

  private calculateCoinsForOrder(order: Order): number {
    const level = this.state.level;
    if (!level) return 0;
    return order.lines.reduce((total, line) => {
      const food = level.foods.find((f) => f.id === line.foodId);
      return total + (food ? food.price * line.quantity : 0);
    }, 0);
  }

  /** Transition a customer whose order was fulfilled/expired off screen. */
  advanceCustomer(customerInstanceId: string): void {

  const customers = this.state.customers.map((customer) =>
    customer.instanceId === customerInstanceId
      ? {
          ...customer,
          state: 'leaving' as const,
        }
      : customer
  );

  this.setState({
    customers,
  });
}

  removeCustomer(customerInstanceId: string): void {
    const customers = this.state.customers.filter(
      (customer) => customer.instanceId !== customerInstanceId
    );
    this.setState({ customers });
  }

  // --------------------------------------------------------------
  // Completion
  // --------------------------------------------------------------

  private checkAllOrdersResolved(): void {
    if (this.state.orders.length === 0) return;
    const allResolved = this.state.orders.every(
      (order) => order.status !== 'pending'
    );
    if (allResolved) {
      this.endLevel();
    }
  }

  private endLevel(): void {
    if (
      this.state.status === 'completed' ||
      this.state.status === 'failed'
    ) {
      return;
    }

    const level = this.state.level;
    const ordersTotal = this.state.orders.length;
    const ordersFulfilled = this.state.orders.filter(
      (o) => o.status === 'fulfilled'
    ).length;
    const passed = level ? this.state.score >= level.targetScore * 0.5 : false;

    const result: LevelResult = {
      passed,
      score: this.state.score,
      coinsEarned: this.state.coins,
      ordersFulfilled,
      ordersTotal,
    };

    this.setState({
      status: passed ? 'completed' : 'failed',
      result,
    });
  }

  /** Manually force the level to end (e.g. player quits early). */
  abandonLevel(): void {
    this.endLevel();
  }
}
