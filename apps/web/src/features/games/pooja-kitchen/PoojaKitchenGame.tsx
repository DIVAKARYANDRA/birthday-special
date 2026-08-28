/**
 * PoojaKitchenGame
 *
 * Top-level screen for a single Pooja Kitchen level.
 *
 * Responsibilities:
 *   - Authentication gate
 *   - Level loading
 *   - Fixed landscape-first game viewport
 *   - Responsive game composition
 *   - HUD
 *   - Customer area
 *   - Cooking/kitchen area
 *   - Persistent food tray area
 *   - Carried-food interaction
 *   - Pause / result / loading overlays
 *
 * Game rules remain inside usePoojaKitchenGame + gameEngine.
 *
 * UI DESIGN:
 *   - Designed primarily for iPhone 16 landscape.
 *   - Main background/theme occupies the upper game scene.
 *   - Customer area remains visually dominant.
 *   - Kitchen/cooking area sits between customers and food tray.
 *   - Bottom food tray is reserved as a stable interaction area for
 *     all current and future levels.
 *   - Future levels can change customers, foods, stations and themes
 *     without requiring this component to be changed.
 */

import {
  useEffect,
  useState,
} from "react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  usePoojaKitchenGame,
} from "./hooks/usePoojaKitchenGame";

import {
  CustomerQueue,
} from "./components/CustomerQueue";

import {
  Kitchen,
} from "./components/Kitchen";

import {
  OrientationGate,
} from "./components/OrientationGate";

import {
  buttonTapAnimation,
  overlayVariants,
} from "./animations/uiAnimations";

import type {
  Food,
} from "./data/types";

import {
  getAuthToken,
} from "./api/authToken";

import {
  PoojaKitchenLogin,
} from "./components/PoojaKitchenLogin";


// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface PoojaKitchenGameProps {

  levelNumber: number;

  onExit?: () => void;

  onLevelReported?: (
    levelNumber: number,
    passed: boolean
  ) => void;

}


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(
  totalSeconds: number
): string {

  const seconds =
    Math.max(
      0,
      Math.ceil(totalSeconds)
    );

  const minutes =
    Math.floor(
      seconds / 60
    );

  const remainder =
    seconds % 60;

  return `${minutes}:${remainder
    .toString()
    .padStart(2, "0")}`;
}


// ---------------------------------------------------------------------------
// HUD badge
// ---------------------------------------------------------------------------

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
      className={`
        flex
        h-10
        items-center
        gap-1.5
        rounded-full
        border
        border-white/20
        px-3
        shadow-lg
        backdrop-blur-md
        ${
          urgent
            ? "bg-[#E85D5D]/95 text-white"
            : "bg-black/35 text-white"
        }
      `}
    >

      <span
        aria-hidden="true"
        className="
          text-base
          leading-none
        "
      >
        {icon}
      </span>

      <span
        className="
          font-[Fredoka,ui-rounded,sans-serif]
          text-sm
          font-bold
          leading-none
          tabular-nums
        "
      >
        {value}
      </span>

    </div>

  );

}


// ---------------------------------------------------------------------------
// Section label
// ---------------------------------------------------------------------------

function SceneLabel({
  children,
}: {
  children: React.ReactNode;
}) {

  return (

    <div
      className="
        pointer-events-none
        rounded-full
        border
        border-white/15
        bg-black/20
        px-3
        py-1
        font-[Fredoka,ui-rounded,sans-serif]
        text-[10px]
        font-bold
        uppercase
        tracking-[0.12em]
        text-white/70
        shadow-sm
        backdrop-blur-sm
      "
    >
      {children}
    </div>

  );

}


// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function PoojaKitchenGame({

  levelNumber,

  onExit,

  onLevelReported,

}: PoojaKitchenGameProps) {


  // -------------------------------------------------------------------------
  // Game hook
  // -------------------------------------------------------------------------

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

  } = usePoojaKitchenGame({
    onLevelReported,
  });


  // -------------------------------------------------------------------------
  // Local UI state
  // -------------------------------------------------------------------------

  const [
    carriedFood,
    setCarriedFood,
  ] = useState<Food | null>(null);


  const [
    authenticated,
    setAuthenticated,
  ] = useState(
    Boolean(getAuthToken())
  );


  // -------------------------------------------------------------------------
  // Load level ONLY after authentication
  //
  // Important:
  // We intentionally do not call loadLevel before authentication.
  // This prevents an unauthenticated request from generating a 401.
  // -------------------------------------------------------------------------

  useEffect(() => {

    if (!authenticated) {
      return;
    }

    void loadLevel(levelNumber);

  }, [
    authenticated,
    levelNumber,
    loadLevel,
  ]);


  // -------------------------------------------------------------------------
  // Customer completion / expiry handling
  //
  // Once a customer becomes happy or angry, allow the expression to remain
  // visible briefly before advancing the customer.
  // -------------------------------------------------------------------------

  useEffect(() => {

    const timers: number[] = [];

    gameState.customers.forEach(
      (customer) => {

        if (
          customer.state === "happy" ||
          customer.state === "angry"
        ) {

          const timerId =
            window.setTimeout(
              () => {

                advanceCustomer(
                  customer.instanceId
                );

              },
              900
            );

          timers.push(
            timerId
          );

        }

      }
    );


    return () => {

      timers.forEach(
        (id) =>
          window.clearTimeout(id)
      );

    };

  }, [
    gameState.customers,
    advanceCustomer,
  ]);


  // -------------------------------------------------------------------------
  // Collect cooked food
  // -------------------------------------------------------------------------

  const handleCollect = (
    slotId: string
  ) => {

    const food =
      collectFromSlot(
        slotId
      );

    if (food) {

      setCarriedFood(
        food
      );

    }

  };


  // -------------------------------------------------------------------------
  // Select customer to serve carried food
  // -------------------------------------------------------------------------

  const handleSelectCustomer = (
    customerInstanceId: string
  ) => {

    if (!carriedFood) {
      return;
    }


    const customer =
      gameState.customers.find(
        (item) =>
          item.instanceId ===
          customerInstanceId
      );


    if (!customer?.orderId) {
      return;
    }


    serveOrder(
      customer.orderId,
      carriedFood.id
    );


    setCarriedFood(
      null
    );

  };


  const {
    level,
    status,
  } = gameState;


  // -------------------------------------------------------------------------
  // Authentication gate
  //
  // Always render login before the game scene if no access token exists.
  // -------------------------------------------------------------------------

  if (!authenticated) {

    return (

      <PoojaKitchenLogin
        onSuccess={() => {

          setAuthenticated(
            true
          );

        }}
      />

    );

  }


  // -------------------------------------------------------------------------
  // Game scene
  // -------------------------------------------------------------------------

  return (

    <OrientationGate>

      <div
        className="
          fixed
          inset-0
          flex
          h-[100svh]
          w-full
          items-center
          justify-center
          overflow-hidden
          bg-black
        "
        style={{
          paddingTop:
            "env(safe-area-inset-top)",
          paddingRight:
            "env(safe-area-inset-right)",
          paddingBottom:
            "env(safe-area-inset-bottom)",
          paddingLeft:
            "env(safe-area-inset-left)",
          boxSizing:
            "border-box",
        }}
      >

        {/* =============================================================== */}
        {/* GAME CANVAS                                                     */}
        {/* =============================================================== */}

        <div
          className="
            relative
            h-full
            w-full
            overflow-hidden
            bg-[#1F4D45]
            select-none
          "
        >

          {/* ============================================================= */}
          {/* BACKGROUND / LEVEL THEME                                      */}
          {/* ============================================================= */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              z-0
              overflow-hidden
            "
          >

            {level?.theme.backgroundImage ? (

              <img
                src={
                  level.theme.backgroundImage
                }
                alt="Kitchen background"
                className="
                  absolute
                  inset-0
                  h-full
                  w-full
                  object-cover
                  object-center
                "
                draggable={false}
              />

            ) : (

              <div
                className="
                  absolute
                  inset-0
                  bg-[#1F4D45]
                "
              />

            )}

          </div>


          {/* ============================================================= */}
          {/* BACKGROUND DEPTH / READABILITY                                */}
          {/* ============================================================= */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              z-[1]
              bg-gradient-to-b
              from-black/20
              via-transparent
              to-black/30
            "
          />


          {/* ============================================================= */}
          {/* TOP HUD                                                       */}
          {/* ============================================================= */}

          <div
            className="
              absolute
              left-0
              right-0
              top-0
              z-50
              flex
              items-center
              justify-between
              px-4
              pt-3
              sm:px-5
              sm:pt-4
            "
          >

            {/* ----------------------------------------------------------- */}
            {/* LEFT SIDE                                                    */}
            {/* ----------------------------------------------------------- */}

            <div
              className="
                flex
                min-w-0
                items-center
                gap-2
              "
            >

              {/* Exit */}

              <motion.button
                type="button"
                whileTap={buttonTapAnimation}
                onClick={onExit}
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/20
                  bg-black/35
                  text-2xl
                  font-bold
                  leading-none
                  text-white
                  shadow-lg
                  backdrop-blur-md
                "
                aria-label="Exit level"
              >
                ×
              </motion.button>


              {/* Level indicator */}

              <div
                className="
                  hidden
                  rounded-full
                  border
                  border-white/15
                  bg-black/30
                  px-3
                  py-1.5
                  font-[Fredoka,ui-rounded,sans-serif]
                  text-xs
                  font-bold
                  text-white
                  shadow-lg
                  backdrop-blur-md
                  sm:block
                "
              >
                Level {level?.levelNumber ?? levelNumber}
              </div>

            </div>


            {/* ----------------------------------------------------------- */}
            {/* CENTER SCORE                                                 */}
            {/* ----------------------------------------------------------- */}

            <div
              className="
                absolute
                left-1/2
                top-3
                flex
                -translate-x-1/2
                items-center
                gap-2
                sm:top-4
              "
            >

              <HudBadge
                icon="⭐"
                value={gameState.score}
              />

              <HudBadge
                icon="🪙"
                value={gameState.coins}
              />

            </div>


            {/* ----------------------------------------------------------- */}
            {/* RIGHT SIDE                                                   */}
            {/* ----------------------------------------------------------- */}

            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              {/* Timer */}

              <HudBadge
                icon="⏱"
                value={
                  formatTime(
                    gameState.timeRemainingSeconds
                  )
                }
                urgent={
                  gameState.timeRemainingSeconds <= 10 &&
                  status === "playing"
                }
              />


              {/* Pause */}

              {status === "playing" && (

                <motion.button
                  type="button"
                  whileTap={buttonTapAnimation}
                  onClick={pauseLevel}
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/20
                    bg-black/35
                    text-sm
                    font-bold
                    text-white
                    shadow-lg
                    backdrop-blur-md
                  "
                  aria-label="Pause"
                >
                  ❚❚
                </motion.button>

              )}

            </div>

          </div>


          {/* ============================================================= */}
          {/* MAIN GAMEPLAY AREA                                            */}
          {/* ============================================================= */}

          <div
            className="
              absolute
              inset-x-0
              bottom-0
              top-0
              z-10
            "
          >

            {/* =========================================================== */}
            {/* CUSTOMER ZONE                                               */}
            {/* =========================================================== */}

            <div
              className="
                absolute
                left-0
                right-0
                top-[12%]
                h-[43%]
                overflow-visible
              "
            >

              <div
                className="
                  absolute
                  left-1/2
                  top-1
                  z-10
                  -translate-x-1/2
                "
              >

                <SceneLabel>
                  Orders
                </SceneLabel>

              </div>


              {level && (

                <CustomerQueue
                  customers={
                    gameState.customers
                  }

                  orders={
                    gameState.orders
                  }

                  foods={
                    level.foods
                  }

                  onSelectCustomer={
                    handleSelectCustomer
                  }

                  onCustomerExited={
                    removeCustomer
                  }
                />

              )}

            </div>


            {/* =========================================================== */}
            {/* COUNTER / VISUAL DIVIDER                                    */}
            {/* =========================================================== */}

            <div
              className="
                pointer-events-none
                absolute
                left-[4%]
                right-[4%]
                top-[54%]
                z-10
                h-[5%]
                min-h-[18px]
                rounded-[50%]
                border-t
                border-white/20
                bg-black/10
                shadow-[0_-8px_25px_rgba(0,0,0,0.15)]
              "
            />


            {/* =========================================================== */}
            {/* COOKING AREA                                                */}
            {/* =========================================================== */}

            <div
              className="
                absolute
                left-[3%]
                right-[3%]
                top-[55%]
                bottom-[21%]
                z-20
                overflow-visible
              "
            >

              <div
                className="
                  pointer-events-none
                  absolute
                  left-1/2
                  top-1
                  z-10
                  -translate-x-1/2
                "
              >

                <SceneLabel>
                  Cooking
                </SceneLabel>

              </div>


              {level && (

                <Kitchen
                  stations={
                    level.stations
                  }

                  cookingSlots={
                    gameState.cookingSlots
                  }

                  foods={
                    level.foods
                  }

                  onStartCooking={
                    startCooking
                  }

                  onCollect={
                    handleCollect
                  }

                />

              )}

            </div>


            {/* =========================================================== */}
            {/* CARRYING FOOD INDICATOR                                    */}
            {/* =========================================================== */}

            <AnimatePresence>

              {carriedFood && (

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 8,
                    scale: 0.95,
                  }}

                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}

                  exit={{
                    opacity: 0,
                    y: 8,
                    scale: 0.95,
                  }}

                  transition={{
                    duration: 0.18,
                  }}

                  className="
                    pointer-events-none
                    absolute
                    left-1/2
                    top-[51%]
                    z-[60]
                    flex
                    -translate-x-1/2
                    items-center
                    gap-2
                    whitespace-nowrap
                    rounded-full
                    border
                    border-white/30
                    bg-white/95
                    px-4
                    py-2
                    font-[Fredoka,ui-rounded,sans-serif]
                    text-xs
                    font-bold
                    text-[#1F2A24]
                    shadow-xl
                    backdrop-blur-md
                  "
                >

                  <span
                    className="
                      h-2
                      w-2
                      rounded-full
                      bg-[#6FCB9F]
                    "
                  />

                  Carrying {carriedFood.name}

                  <span
                    className="
                      text-[#2F6F62]
                    "
                  >
                    · Tap a customer
                  </span>

                </motion.div>

              )}

            </AnimatePresence>


            {/* =========================================================== */}
            {/* PERMANENT FOOD TRAY                                         */}
            {/* =========================================================== */}

            <div
              className="
                absolute
                bottom-0
                left-0
                right-0
                z-40
                h-[20%]
                min-h-[92px]
              "
            >

              {/* Tray backdrop */}

              <div
                className="
                  absolute
                  inset-0
                  border-t
                  border-white/15
                  bg-black/35
                  shadow-[0_-10px_30px_rgba(0,0,0,0.25)]
                  backdrop-blur-md
                "
              />


              {/* Tray highlight */}

              <div
                className="
                  pointer-events-none
                  absolute
                  left-[4%]
                  right-[4%]
                  top-0
                  h-px
                  bg-white/25
                "
              />


              {/* Food tray content */}

              <div
                className="
                  relative
                  h-full
                  w-full
                  overflow-hidden
                "
              >

                <div
                  className="
                    absolute
                    left-3
                    right-3
                    top-1/2
                    -translate-y-1/2
                  "
                >

                  {/* Kitchen owns the actual food controls.
                      This wrapper provides the permanent visual tray
                      surface. */}

                  {level && (

                    <Kitchen
                      stations={
                        level.stations
                      }

                      cookingSlots={
                        gameState.cookingSlots
                      }

                      foods={
                        level.foods
                      }

                      onStartCooking={
                        startCooking
                      }

                      onCollect={
                        handleCollect
                      }

                    />

                  )}

                </div>

              </div>

            </div>

          </div>


          {/* ============================================================= */}
          {/* STATUS OVERLAYS                                               */}
          {/* ============================================================= */}

          <AnimatePresence>

            {/* ----------------------------------------------------------- */}
            {/* Loading                                                      */}
            {/* ----------------------------------------------------------- */}

            {isLoadingLevel && (

              <Overlay
                key="loading"
              >

                <div
                  className="
                    mb-4
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-white/10
                    text-3xl
                  "
                >
                  🍳
                </div>

                <p
                  className="
                    font-[Fredoka,ui-rounded,sans-serif]
                    text-xl
                    font-bold
                    text-white
                  "
                >
                  Loading kitchen…
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    text-white/60
                  "
                >
                  Preparing your orders
                </p>

              </Overlay>

            )}


            {/* ----------------------------------------------------------- */}
            {/* Error                                                        */}
            {/* ----------------------------------------------------------- */}

            {!isLoadingLevel &&
              loadError && (

                <Overlay
                  key="error"
                >

                  <div
                    className="
                      mb-4
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-2xl
                      bg-[#E85D5D]/20
                      text-3xl
                    "
                  >
                    ⚠️
                  </div>

                  <p
                    className="
                      mb-5
                      max-w-md
                      text-center
                      text-sm
                      leading-relaxed
                      text-white/90
                    "
                  >
                    {loadError}
                  </p>

                  <PrimaryButton
                    onClick={() =>
                      void retryLevel()
                    }
                  >
                    Retry
                  </PrimaryButton>

                </Overlay>

              )}


            {/* ----------------------------------------------------------- */}
            {/* Ready                                                        */}
            {/* ----------------------------------------------------------- */}

            {status === "ready" && (

              <Overlay
                key="ready"
              >

                <div
                  className="
                    mb-4
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-3xl
                    bg-white/10
                    text-4xl
                  "
                >
                  🍳
                </div>

                <h2
                  className="
                    mb-1
                    font-[Fredoka,ui-rounded,sans-serif]
                    text-3xl
                    font-bold
                    text-white
                  "
                >
                  Level {level?.levelNumber}
                </h2>

                <p
                  className="
                    mb-1
                    text-sm
                    font-semibold
                    text-white/80
                  "
                >
                  {level?.theme.name}
                </p>

                <p
                  className="
                    mb-6
                    text-xs
                    text-white/60
                  "
                >
                  Target score: {level?.targetScore}
                </p>

                <PrimaryButton
                  onClick={startLevel}
                >
                  Start Cooking
                </PrimaryButton>

              </Overlay>

            )}


            {/* ----------------------------------------------------------- */}
            {/* Paused                                                       */}
            {/* ----------------------------------------------------------- */}

            {status === "paused" && (

              <Overlay
                key="paused"
              >

                <div
                  className="
                    mb-4
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-white/10
                    text-2xl
                    text-white
                  "
                >
                  ❚❚
                </div>

                <h2
                  className="
                    mb-5
                    font-[Fredoka,ui-rounded,sans-serif]
                    text-3xl
                    font-bold
                    text-white
                  "
                >
                  Paused
                </h2>

                <PrimaryButton
                  onClick={resumeLevel}
                >
                  Resume Cooking
                </PrimaryButton>

              </Overlay>

            )}


            {/* ----------------------------------------------------------- */}
            {/* Result                                                       */}
            {/* ----------------------------------------------------------- */}

            {(status === "completed" ||
              status === "failed") && (

              <Overlay
                key="result"
              >

                <div
                  className="
                    mb-4
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-3xl
                    bg-white/10
                    text-4xl
                  "
                >
                  {status === "completed"
                    ? "🏆"
                    : "⏰"}
                </div>


                <h2
                  className="
                    mb-1
                    font-[Fredoka,ui-rounded,sans-serif]
                    text-3xl
                    font-bold
                    text-white
                  "
                >
                  {
                    status === "completed"
                      ? "Level Complete!"
                      : "Time's Up"
                  }
                </h2>


                <p
                  className="
                    mb-5
                    text-sm
                    text-white/70
                  "
                >
                  {status === "completed"
                    ? "Great work, chef!"
                    : "The customers couldn't wait any longer."}
                </p>


                <div
                  className="
                    mb-6
                    flex
                    items-center
                    gap-3
                  "
                >

                  <div
                    className="
                      rounded-2xl
                      bg-white/10
                      px-4
                      py-2
                      text-center
                    "
                  >

                    <div
                      className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wider
                        text-white/50
                      "
                    >
                      Score
                    </div>

                    <div
                      className="
                        mt-0.5
                        font-[Fredoka,ui-rounded,sans-serif]
                        text-xl
                        font-bold
                        text-white
                      "
                    >
                      {gameState.result?.score ?? 0}
                    </div>

                  </div>


                  <div
                    className="
                      rounded-2xl
                      bg-white/10
                      px-4
                      py-2
                      text-center
                    "
                  >

                    <div
                      className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wider
                        text-white/50
                      "
                    >
                      Coins
                    </div>

                    <div
                      className="
                        mt-0.5
                        font-[Fredoka,ui-rounded,sans-serif]
                        text-xl
                        font-bold
                        text-white
                      "
                    >
                      {gameState.result?.coinsEarned ?? 0}
                    </div>

                  </div>

                </div>


                <div
                  className="
                    flex
                    gap-3
                  "
                >

                  <PrimaryButton
                    onClick={() =>
                      void retryLevel()
                    }
                  >
                    Retry
                  </PrimaryButton>


                  {onExit && (

                    <PrimaryButton
                      variant="secondary"
                      onClick={onExit}
                    >
                      Exit
                    </PrimaryButton>

                  )}

                </div>

              </Overlay>

            )}

          </AnimatePresence>

        </div>

      </div>

    </OrientationGate>

  );

}


// ---------------------------------------------------------------------------
// Overlay
// ---------------------------------------------------------------------------

function Overlay({
  children,
}: {
  children: React.ReactNode;
}) {

  return (

    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={overlayVariants}
      className="
        absolute
        inset-0
        z-[100]
        flex
        flex-col
        items-center
        justify-center
        bg-black/65
        px-6
        text-center
        backdrop-blur-[3px]
      "
    >

      {children}

    </motion.div>

  );

}


// ---------------------------------------------------------------------------
// Primary button
// ---------------------------------------------------------------------------

function PrimaryButton({
  children,
  onClick,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}) {

  return (

    <motion.button
      type="button"
      whileTap={buttonTapAnimation}
      onClick={onClick}
      className={`
        rounded-full
        px-7
        py-3
        font-[Fredoka,ui-rounded,sans-serif]
        text-base
        font-bold
        shadow-lg
        transition
        ${
          variant === "primary"
            ? "bg-[#F5C24D] text-[#1F2A24] hover:bg-[#FFD36A]"
            : "border border-white/20 bg-white/15 text-white backdrop-blur-sm hover:bg-white/20"
        }
      `}
    >

      {children}

    </motion.button>

  );

}