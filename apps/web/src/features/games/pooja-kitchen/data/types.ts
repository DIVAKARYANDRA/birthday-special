/**
 * Shared data types for the Pooja Kitchen game engine.
 *
 * These types describe the shape of content that will eventually be
 * served by the backend (see services/api/app/domains/pooja_kitchen on
 * the API side) as well as the runtime state the engine/hook manage on
 * the client. Nothing in this file depends on React — it is pure data
 * modelling so it can be shared by the engine, the hook, and components.
 */

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

/** Lifecycle states a customer moves through while in the kitchen. */
export type CustomerState =
  | 'entering'
  | 'waiting'
  | 'happy'
  | 'angry'
  | 'leaving';

/**
 * Static definition of a customer "character" — the shape delivered by
 * backend/media content. Avatars are always URLs; no image is ever
 * hardcoded in a component.
 */
export interface CustomerDefinition {
  id: string;
  name: string;
  /** Default/waiting expression avatar URL. */
  avatar: string;
  /** Avatar URL shown when the order was served in time. */
  happyAvatar: string;
  /** Avatar URL shown when the customer's patience ran out. */
  angryAvatar: string;
  /** How many seconds the customer will wait before leaving angry. */
  patienceSeconds: number;
}

/** Runtime instance of a customer currently present in a level. */
export interface Customer extends CustomerDefinition {
  /** Unique instance id (distinct from the character definition id — the
   * same character can appear more than once in a level/queue). */
  instanceId: string;
  state: CustomerState;
  /** Id of the order this customer is waiting on, once one is assigned. */
  orderId: string | null;
  /** Seconds of patience left. Counts down while state is 'waiting'. */
  patienceRemaining: number;
  /** Position in the visible queue/counter (0 = currently being served). */
  slot: number;
}

// ---------------------------------------------------------------------------
// Foods
// ---------------------------------------------------------------------------

export interface Food {
  id: string;
  name: string;
  /** Image URL sourced from backend media — never hardcoded. */
  image: string;
  /** Seconds required to cook one unit of this food. */
  cookTime: number;
  /** Coins earned for successfully selling/serving this food. */
  price: number;
}

/** Runtime state of a food item as it cooks on a kitchen station. */
export type CookState = 'idle' | 'cooking' | 'ready' | 'burnt';

export interface CookingSlot {
  id: string;
  stationId: string;
  food: Food | null;
  state: CookState;
  /** Milliseconds elapsed cooking the current food item, if any. */
  elapsedMs: number;
}

// ---------------------------------------------------------------------------
// Kitchen stations
// ---------------------------------------------------------------------------

export interface KitchenStation {
  id: string;
  name: string;
  /** Which food ids this station is able to cook. */
  supportedFoodIds: string[];
  /** How many items this station can cook at once. */
  capacity: number;
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export type OrderStatus = 'pending' | 'fulfilled' | 'expired';

/** A single line item within an order (e.g. "Coffee x1"). */
export interface OrderLine {
  foodId: string;
  quantity: number;
  /** How many units of this line have been served so far. */
  quantityServed: number;
}

export interface Order {
  id: string;
  customerInstanceId: string;
  lines: OrderLine[];
  /** Points awarded when every line is fully served before expiry. */
  rewardPoints: number;
  status: OrderStatus;
}

// ---------------------------------------------------------------------------
// Levels
// ---------------------------------------------------------------------------

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface LevelTheme {
  id: string;
  name: string;
  description?: string;
  /** Background scene image URL, sourced from backend media. */
  backgroundImage: string;
}

/**
 * Full level definition as delivered by the backend. The engine consumes
 * this shape directly; nothing about it is specific to any one theme or
 * restaurant, so the same engine drives all 200+ levels.
 */
export interface Level {
  id: string;
  levelNumber: number;
  theme: LevelTheme;
  difficulty: Difficulty;
  /** Total time allowed for the level, in seconds. */
  timeLimit: number;
  targetScore: number;
  customerCount: number;
  /** Stations available for this level. */
  stations: KitchenStation[];
  /** Foods that can be cooked/served in this level. */
  foods: Food[];
  /** Customer characters who will appear in this level, in spawn order. */
  customers: CustomerDefinition[];
  /** Template orders, one per customer, in the same order as `customers`. */
  orderTemplates: Array<{
    customerId: string;
    lines: Array<{ foodId: string; quantity: number }>;
    rewardPoints: number;
  }>;
}

// ---------------------------------------------------------------------------
// Game state
// ---------------------------------------------------------------------------

export type GameStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'completed'
  | 'failed';

export interface GameState {
  status: GameStatus;
  level: Level | null;
  timeRemainingSeconds: number;
  score: number;
  coins: number;
  customers: Customer[];
  orders: Order[];
  cookingSlots: CookingSlot[];
  /** Set once the level ends, describing the outcome. */
  result: LevelResult | null;
}

export interface LevelResult {
  passed: boolean;
  score: number;
  coinsEarned: number;
  ordersFulfilled: number;
  ordersTotal: number;
}

// ---------------------------------------------------------------------------
// Player progress (mirrors the backend ProgressResponse shape)
// ---------------------------------------------------------------------------

export interface PlayerProgress {
  currentLevel: number;
  highestUnlockedLevel: number;
  coins: number;
  totalScore: number;
}
