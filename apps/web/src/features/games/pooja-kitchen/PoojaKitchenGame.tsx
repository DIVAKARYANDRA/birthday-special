/**
 * PoojaKitchenGame
 *
 * Top-level screen for a single level attempt. Mobile-landscape only —
 * the layout is a fixed vertical stack (HUD → customer queue/order
 * display → kitchen counter) filling the viewport, wrapped in
 * OrientationGate so it only renders once the device is rotated to
 * landscape (the genre needs the horizontal room for the customer
 * counter and kitchen stations side by side).
 *
 * This component is intentionally "dumb": all game rules live in
 * engine/gameEngine.ts, all state wiring lives in
 * hooks/usePoojaKitchenGame.ts. This file only lays out subsystem
 * components and forwards user taps to hook actions — the one piece of
 * local UI-only state it keeps is which food item the player is
 * currently "carrying" from a station to a customer.
 */

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePoojaKitchenGame } from './hooks/usePoojaKitchenGame';
import { CustomerQueue } from './components/CustomerQueue';
import { Kitchen } from './components/Kitchen';
import { OrientationGate } from './components/OrientationGate';
import { buttonTapAnimation, overlayVariants } from './animations/uiAnimations';
import type { Food } from './data/types';

export interface PoojaKitchenGameProps {
  levelNumber: number;
  onExit?: () => void;
  onLevelReported?: (levelNumber: number, passed: boolean) => void;
}

function formatTime(totalSeconds: number): string {
  const seconds = Math.max(0, Math.ceil(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
}

function HudBadge({
  icon,
  value,
  urgent = false,
}: {
  icon: string;
  value: string | number;
  urgent?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-1 rounded-full px-3 py-1 shadow-sm ${
        urgent ? 'bg-[#E85D5D] text-white' : 'bg-[#FFF8ED] text-[#1F2A24]'
      }`}
    >
      <span aria-hidden="true">{icon}</span>
      <span className="font-[Fredoka,ui-rounded,sans-serif] text-sm font-bold tabular-nums">
        {value}
      </span>
    </div>
  );
}

export function PoojaKitchenGame({
  levelNumber,
  onExit,
  onLevelReported,
}: PoojaKitchenGameProps) {
  const {
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
  } = usePoojaKitchenGame({ onLevelReported });

  const [carriedFood, setCarriedFood] = useState<Food | null>(null);

  const [scale,setScale] = useState(1);

  useEffect(()=>{

const resize = ()=>{

 const width = window.innerWidth;

 const height =
 window.visualViewport?.height ??
 window.innerHeight;


 const scaleX = width / 1280;
 const scaleY = height / 720;


 setScale(
   Math.min(scaleX, scaleY)
 );

};


resize();

window.addEventListener(
"resize",
resize
);


return ()=>window.removeEventListener(
"resize",
resize
);


},[]);

  useEffect(() => {
    loadLevel(levelNumber);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelNumber]);

  // Once an order is fulfilled/expired, walk its customer off screen
  // after a short beat so the happy/angry pose is visible.
  useEffect(() => {
    const timers: number[] = [];
    gameState.customers.forEach((customer) => {
      if (customer.state === 'happy' || customer.state === 'angry') {
        const timerId = window.setTimeout(() => {
          advanceCustomer(customer.instanceId);
        }, 900);
        timers.push(timerId);
      }
    });
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [gameState.customers, advanceCustomer]);

  const handleCollect = (slotId: string) => {
    const food = collectFromSlot(slotId);
    if (food) setCarriedFood(food);
  };

  const handleSelectCustomer = (customerInstanceId: string) => {
    if (!carriedFood) return;
    const customer = gameState.customers.find(
      (c) => c.instanceId === customerInstanceId
    );
    if (!customer?.orderId) return;
    serveOrder(customer.orderId, carriedFood.id);
    setCarriedFood(null);
  };

  const { level, status } = gameState;

  return (
    <OrientationGate>

<div
  className="
    fixed
    inset-0
    overflow-hidden
    flex
    items-center
    justify-center
  "
>

<div
  className="
    relative
    h-[720px]
    w-[1280px]
    origin-center
    overflow-hidden
    bg-gradient-to-b
    from-[#1F4D45]
    to-[#2F6F62]
  "
  style={{
  transform:`scale(${scale})`,
  transformOrigin: "center center",
  }}
>
      {/* Background kitchen scene */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={
          level?.theme.backgroundImage
            ? {
                backgroundImage: `url(${level.theme.backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      />

      {/* HUD: score, coins, timer */}
      <div className="relative z-10 flex items-center justify-between px-3 pt-3">
        <button
          type="button"
          onClick={onExit}
          className="rounded-full bg-black/20 px-3 py-1 text-sm font-bold text-white"
          aria-label="Exit level"
        >
          ✕
        </button>
        <div className="flex gap-2">
          <HudBadge icon="⭐" value={gameState.score} />
          <HudBadge icon="🪙" value={gameState.coins} />
        </div>
        <HudBadge
          icon="⏱"
          value={formatTime(gameState.timeRemainingSeconds)}
          urgent={gameState.timeRemainingSeconds <= 10 && status === 'playing'}
        />
      </div>

      {/* Customer queue + order display area */}
      <div className="relative z-10 mt-2">
        {level && (
          <CustomerQueue
            customers={gameState.customers}
            orders={gameState.orders}
            foods={level.foods}
            onSelectCustomer={handleSelectCustomer}
            onCustomerExited={removeCustomer}
          />
        )}
      </div>

      {/* Carried-food indicator */}
      <AnimatePresence>
        {carriedFood && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="relative z-10 mx-auto mb-1 flex w-fit items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#1F2A24] shadow"
          >
            Carrying {carriedFood.name} — tap a customer to serve
          </motion.div>
        )}
      </AnimatePresence>


      {/* Kitchen counter / cooking stations area */}
      <div className="relative z-10">
        {level && (
          <Kitchen
            stations={level.stations}
            cookingSlots={gameState.cookingSlots}
            foods={level.foods}
            onStartCooking={startCooking}
            onCollect={handleCollect}
          />
        )}
      </div>

      {/* Status overlays */}
      <AnimatePresence>
        {isLoadingLevel && (
          <Overlay key="loading">
            <p className="text-white">Loading level…</p>
          </Overlay>
        )}

        {!isLoadingLevel && loadError && (
          <Overlay key="error">
            <p className="mb-3 text-center text-white">{loadError}</p>
            <PrimaryButton onClick={() => loadLevel(levelNumber)}>
              Retry
            </PrimaryButton>
          </Overlay>
        )}

        {status === 'ready' && (
          <Overlay key="ready">
            <h2 className="mb-1 font-[Fredoka,ui-rounded,sans-serif] text-2xl font-bold text-white">
              Level {level?.levelNumber}
            </h2>
            <p className="mb-4 text-sm text-white/80">
              Target score: {level?.targetScore}
            </p>
            <PrimaryButton onClick={startLevel}>Start</PrimaryButton>
          </Overlay>
        )}

        {status === 'paused' && (
          <Overlay key="paused">
            <h2 className="mb-4 font-[Fredoka,ui-rounded,sans-serif] text-2xl font-bold text-white">
              Paused
            </h2>
            <PrimaryButton onClick={resumeLevel}>Resume</PrimaryButton>
          </Overlay>
        )}

        {(status === 'completed' || status === 'failed') && (
          <Overlay key="result">
            <h2 className="mb-1 font-[Fredoka,ui-rounded,sans-serif] text-2xl font-bold text-white">
              {status === 'completed' ? 'Level Complete!' : 'Time\u2019s Up'}
            </h2>
            <p className="mb-4 text-sm text-white/80">
              Score {gameState.result?.score ?? 0} · Coins{' '}
              {gameState.result?.coinsEarned ?? 0}
            </p>
            <div className="flex gap-2">
              <PrimaryButton onClick={() => retryLevel()}>Retry</PrimaryButton>
              {onExit && (
                <PrimaryButton variant="secondary" onClick={onExit}>
                  Exit
                </PrimaryButton>
              )}
            </div>
          </Overlay>
        )}
      </AnimatePresence>

      {status === 'playing' && (
        <button
          type="button"
          onClick={pauseLevel}
          className="absolute right-3 top-14 z-20 rounded-full bg-black/20 px-3 py-1 text-sm font-bold text-white"
          aria-label="Pause"
        >
          ❚❚
        </button>
      )}
      </div>
      </div>

    </OrientationGate>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={overlayVariants}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 px-6 text-center"
    >
      {children}
    </motion.div>
  );
}

function PrimaryButton({
  children,
  onClick,
  variant = 'primary',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}) {
  return (
    <motion.button
      type="button"
      whileTap={buttonTapAnimation}
      onClick={onClick}
      className={`rounded-full px-6 py-2 font-[Fredoka,ui-rounded,sans-serif] font-bold shadow ${
        variant === 'primary'
          ? 'bg-[#F5C24D] text-[#1F2A24]'
          : 'bg-white/20 text-white'
      }`}
    >
      {children}
    </motion.button>
  );
}
