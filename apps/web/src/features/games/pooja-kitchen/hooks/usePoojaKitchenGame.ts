/**
 * usePoojaKitchenGame
 *
 * The single React entry point into the game engine. Owns:
 *   - fetching level data (via api/poojaKitchenApi)
 *   - instantiating and driving a PoojaKitchenGameEngine with a
 *     requestAnimationFrame loop
 *   - exposing engine state as reactive React state
 *   - exposing user-facing actions (cook, serve, pause, resume, retry)
 *   - reporting the level result back to the backend on completion
 *
 * Components should never touch PoojaKitchenGameEngine directly — this
 * hook is the seam between "framework-agnostic game logic" and React.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { PoojaKitchenGameEngine } from '../engine/gameEngine';
import { completeLevel, getLevel } from '../api/poojaKitchenApi';
import type { Food, GameState } from '../data/types';
import { mapBackendLevel } from "../api/levelMapper";
interface UsePoojaKitchenGameOptions {
  /** Called once the backend has acknowledged a completed/failed attempt. */
  onLevelReported?: (levelNumber: number, passed: boolean) => void;
}

interface UsePoojaKitchenGameResult {
  gameState: GameState;
  isLoadingLevel: boolean;
  loadError: string | null;
  loadLevel: (levelNumber: number) => Promise<void>;
  startLevel: () => void;
  pauseLevel: () => void;
  resumeLevel: () => void;
  retryLevel: () => Promise<void>;
  startCooking: (slotId: string, food: Food) => void;
  collectFromSlot: (slotId: string) => Food | null;
  serveOrder: (orderId: string, foodId: string) => void;
  advanceCustomer: (customerInstanceId: string) => void;
  removeCustomer: (customerInstanceId: string) => void;
}

const emptyState: GameState = {
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

export function usePoojaKitchenGame(
  options: UsePoojaKitchenGameOptions = {}
): UsePoojaKitchenGameResult {
  const engineRef = useRef<PoojaKitchenGameEngine | null>(null);
  if (engineRef.current === null) {
    engineRef.current = new PoojaKitchenGameEngine();
  }
  const engine = engineRef.current;

  const [gameState, setGameState] = useState<GameState>(emptyState);
  const [isLoadingLevel, setIsLoadingLevel] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const currentLevelNumberRef = useRef<number | null>(null);
  const hasReportedResultRef = useRef(false);
  const onLevelReportedRef = useRef(options.onLevelReported);
  onLevelReportedRef.current = options.onLevelReported;

  // Subscribe once to engine state changes.
  useEffect(() => {
    const unsubscribe = engine.subscribe((next) => setGameState(next));
    const unsubscribe = engine.subscribe((next)=>{
        console.log("GAME STATE CUSTOMERS", next.customers);
        setGameState(next);
    });
    setGameState(engine.getState());
    return unsubscribe;
  }, [engine]);

  // Drive the engine's tick() from a requestAnimationFrame loop while
  // playing. The loop itself is the only piece of "framework glue" the
  // engine depends on.
  useEffect(() => {
    if (gameState.status !== 'playing') return undefined;

    let rafId: number;
    let lastTimestamp: number | null = null;

    const frame = (timestamp: number) => {
      if (lastTimestamp !== null) {
        const deltaMs = timestamp - lastTimestamp;
        engine.tick(deltaMs);
      }
      lastTimestamp = timestamp;
      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [engine, gameState.status]);

  // Report the outcome to the backend exactly once per attempt.
  useEffect(() => {
    const isFinished =
      gameState.status === 'completed' || gameState.status === 'failed';

    if (
      !isFinished ||
      hasReportedResultRef.current ||
      !gameState.result ||
      currentLevelNumberRef.current === null
    ) {
      return;
    }

    hasReportedResultRef.current = true;
    const levelNumber = currentLevelNumberRef.current;
    const result = gameState.result;

    completeLevel({
      levelNumber,
      score: result.score,
      ordersFulfilled: result.ordersFulfilled,
      timeRemainingSeconds: Math.round(gameState.timeRemainingSeconds),
    })
      .then(() => {
        onLevelReportedRef.current?.(levelNumber, result.passed);
      })
      .catch(() => {
        // Reporting failures shouldn't block the player from seeing
        // their result on screen; a retry/sync strategy belongs in the
        // API layer once the real backend is wired up.
      });
  }, [gameState.status, gameState.result, gameState.timeRemainingSeconds]);

  const loadLevel = useCallback(
    async (levelNumber: number) => {
      setIsLoadingLevel(true);
      setLoadError(null);
      hasReportedResultRef.current = false;
      try {
        const backendLevel = await getLevel(levelNumber);

        const level = mapBackendLevel(
          backendLevel
        );

        currentLevelNumberRef.current = levelNumber;

        engine.loadLevel(level);
        console.log(
          "Loaded level customers:",
          level.customers
        );
      } catch (error) {
        setLoadError(
          error instanceof Error ? error.message : 'Failed to load level'
        );
      } finally {
        setIsLoadingLevel(false);
      }
    },
    [engine]
  );

  const startLevel = useCallback(() => engine.start(), [engine]);
  const pauseLevel = useCallback(() => engine.pause(), [engine]);
  const resumeLevel = useCallback(() => engine.resume(), [engine]);

  const retryLevel = useCallback(async () => {
    const levelNumber = currentLevelNumberRef.current;
    if (levelNumber === null) return;
    await loadLevel(levelNumber);
  }, [loadLevel]);

  const startCooking = useCallback(
    (slotId: string, food: Food) => engine.startCooking(slotId, food),
    [engine]
  );

  const collectFromSlot = useCallback(
    (slotId: string) => engine.collectFromSlot(slotId),
    [engine]
  );

  const serveOrder = useCallback(
    (orderId: string, foodId: string) => engine.serveOrder(orderId, foodId),
    [engine]
  );

  const advanceCustomer = useCallback(
    (customerInstanceId: string) => engine.advanceCustomer(customerInstanceId),
    [engine]
  );

  const removeCustomer = useCallback(
    (customerInstanceId: string) => engine.removeCustomer(customerInstanceId),
    [engine]
  );

  return {
    gameState,
    isLoadingLevel,
    loadError,
    loadLevel,
    startLevel,
    pauseLevel,
    resumeLevel,
    retryLevel,
    startCooking,
    collectFromSlot,
    serveOrder,
    advanceCustomer,
    removeCustomer,
  };
}
