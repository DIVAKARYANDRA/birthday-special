/**
 * PoojaKitchenGame
 *
 * Main game composition for Pooja Kitchen.
 *
 * Layout philosophy:
 *
 *   1. HUD
 *   2. Customer / order zone
 *   3. Kitchen / cooking zone
 *   4. Food selection bar
 *
 * The background is artwork only.
 * Gameplay controls are positioned independently so future levels can
 * freely change customers, foods, stations and themes without requiring
 * UI code changes.
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
        min-w-[58px]
        items-center
        justify-center
        gap-1.5
        rounded-full
        border
        border-white/60
        px-3
        py-1.5
        shadow-md
        backdrop-blur-md
        ${
          urgent
            ? "bg-[#E85D5D] text-white"
            : "bg-white/90 text-[#1F2A24]"
        }
      `}
    >

      <span
        aria-hidden="true"
        className="text-base leading-none"
      >
        {icon}
      </span>

      <span
        className="
          font-[Fredoka,ui-rounded,sans-serif]
          text-base
          font-bold
          tabular-nums
          leading-none
        "
      >
        {value}
      </span>

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
  // Load level only after authentication
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
  // Remove customer after happy / angry state has been visible briefly
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
            "max(6px, env(safe-area-inset-top))",
          paddingBottom:
            "max(6px, env(safe-area-inset-bottom))",
          boxSizing:
            "border-box",
        }}
      >

        {/* =============================================================== */}
        {/* GAME SCENE                                                       */}
        {/* =============================================================== */}

        <div
          className="
            relative
            h-full
            w-full
            overflow-hidden
            bg-[#1F4D45]
          "
        >

          {/* ============================================================= */}
          {/* BACKGROUND                                                     */}
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

            {level?.theme.backgroundImage && (

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
              />

            )}

          </div>


          {/* ============================================================= */}
          {/* BACKGROUND READABILITY LAYER                                   */}
          {/* ============================================================= */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              z-[1]
              bg-black/[0.03]
            "
          />


          {/* ============================================================= */}
          {/* HUD                                                             */}
          {/* ============================================================= */}

          <div
            className="
              absolute
              left-0
              right-0
              top-0
              z-[80]
              flex
              h-[16%]
              items-start
              justify-between
              px-[3%]
              pt-[2.5%]
            "
          >

            {/* ----------------------------------------------------------- */}
            {/* EXIT + LEVEL                                                 */}
            {/* ----------------------------------------------------------- */}

            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <button
                type="button"
                onClick={onExit}
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-full
                  bg-black/40
                  text-2xl
                  font-bold
                  text-white
                  shadow-md
                  backdrop-blur-md
                  transition
                  active:scale-95
                "
                aria-label="Exit level"
              >
                ×
              </button>


              <div
                className="
                  rounded-full
                  bg-black/45
                  px-4
                  py-2
                  font-[Fredoka,ui-rounded,sans-serif]
                  text-sm
                  font-bold
                  text-white
                  shadow-md
                  backdrop-blur-md
                "
              >

                Level {levelNumber}

              </div>

            </div>


            {/* ----------------------------------------------------------- */}
            {/* SCORE + COINS                                                 */}
            {/* ----------------------------------------------------------- */}

            <div
              className="
                absolute
                left-1/2
                top-[2.5%]
                flex
                -translate-x-1/2
                items-center
                gap-2
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
            {/* TIMER + PAUSE                                                 */}
            {/* ----------------------------------------------------------- */}

            <div
              className="
                flex
                items-center
                gap-2
              "
            >

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


              {status === "playing" && (

                <button
                  type="button"
                  onClick={pauseLevel}
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-full
                    bg-black/40
                    text-lg
                    font-bold
                    text-white
                    shadow-md
                    backdrop-blur-md
                    transition
                    active:scale-95
                  "
                  aria-label="Pause"
                >
                  ❚❚
                </button>

              )}

            </div>

          </div>


          {/* ============================================================= */}
          {/* CUSTOMER / ORDER ZONE                                          */}
          {/* ============================================================= */}

          <div
            className="
              absolute
              left-0
              right-0
              top-[14%]
              z-30
              h-[43%]
              overflow-visible
            "
          >

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


          {/* ============================================================= */}
          {/* CARRIED FOOD INDICATOR                                          */}
          {/* ============================================================= */}

          <AnimatePresence>

            {carriedFood && (

              <motion.div
                initial={{
                  opacity: 0,
                  y: 8,
                  scale: 0.9,
                }}

                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}

                exit={{
                  opacity: 0,
                  y: 8,
                  scale: 0.9,
                }}

                className="
                  pointer-events-none
                  absolute
                  left-1/2
                  top-[53%]
                  z-[75]
                  -translate-x-1/2
                  whitespace-nowrap
                  rounded-full
                  border
                  border-white/70
                  bg-white/95
                  px-4
                  py-2
                  text-xs
                  font-black
                  text-[#1F2A24]
                  shadow-xl
                  backdrop-blur-md
                "
              >

                🍽️ Carrying {carriedFood.name}
                {" "}
                • Tap a customer

              </motion.div>

            )}

          </AnimatePresence>


          {/* ============================================================= */}
          {/* KITCHEN / COOKING ZONE                                         */}
          {/*                                                                 */}
          {/* IMPORTANT:                                                     */}
          {/* Kitchen is intentionally constrained to the lower portion.    */}
          {/* Its own absolute positioning now works relative to this zone,  */}
          {/* preventing cooking controls from colliding with customers.     */}
          {/* ============================================================= */}

          {level && (

            <div
              className="
                absolute
                inset-x-0
                bottom-0
                top-[55%]
                z-20
                overflow-visible
              "
            >

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

            </div>

          )}


          {/* ============================================================= */}
          {/* STATUS OVERLAYS                                                */}
          {/* ============================================================= */}

          <AnimatePresence>

            {/* ----------------------------------------------------------- */}
            {/* Loading                                                       */}
            {/* ----------------------------------------------------------- */}

            {isLoadingLevel && (

              <Overlay
                key="loading"
              >

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

              </Overlay>

            )}


            {/* ----------------------------------------------------------- */}
            {/* Error                                                         */}
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
                      text-white
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
            {/* Ready                                                         */}
            {/* ----------------------------------------------------------- */}

            {status === "ready" && (

              <Overlay
                key="ready"
              >

                <div
                  className="
                    mb-4
                    rounded-3xl
                    bg-white/10
                    px-7
                    py-5
                    backdrop-blur-md
                  "
                >

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
                      text-sm
                      text-white/80
                    "
                  >
                    Target score:{" "}
                    {level?.targetScore}
                  </p>

                </div>


                <PrimaryButton
                  onClick={startLevel}
                >
                  Start Cooking
                </PrimaryButton>

              </Overlay>

            )}


            {/* ----------------------------------------------------------- */}
            {/* Paused                                                        */}
            {/* ----------------------------------------------------------- */}

            {status === "paused" && (

              <Overlay
                key="paused"
              >

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
                  Resume
                </PrimaryButton>

              </Overlay>

            )}


            {/* ----------------------------------------------------------- */}
            {/* Result                                                        */}
            {/* ----------------------------------------------------------- */}

            {(status === "completed" ||
              status === "failed") && (

              <Overlay
                key="result"
              >

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
                      : "Time’s Up"
                  }
                </h2>


                <p
                  className="
                    mb-5
                    text-sm
                    text-white/80
                  "
                >
                  Score{" "}
                  {gameState.result?.score ?? 0}
                  {" · "}
                  Coins{" "}
                  {gameState.result?.coinsEarned ?? 0}
                </p>


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
        bg-black/60
        px-6
        text-center
        backdrop-blur-[2px]
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
        ${
          variant === "primary"
            ? "bg-[#F5C24D] text-[#1F2A24]"
            : "bg-white/20 text-white backdrop-blur-sm"
        }
      `}
    >

      {children}

    </motion.button>

  );

}