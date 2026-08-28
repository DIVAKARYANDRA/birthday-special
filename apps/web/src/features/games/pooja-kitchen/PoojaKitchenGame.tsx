/**
 * PoojaKitchenGame
 *
 * Top-level screen for a single Pooja Kitchen level.
 *
 * Responsibilities:
 *   - Authentication gate
 *   - Level loading
 *   - Fixed game viewport / responsive scaling
 *   - HUD
 *   - Customer area
 *   - Kitchen positioning layer
 *   - Carried-food interaction
 *   - Pause / result / loading overlays
 *
 * Game rules remain inside usePoojaKitchenGame + gameEngine.
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
        items-center
        gap-2
        rounded-full
        px-4
        py-2
        shadow-sm
        ${
          urgent
            ? "bg-[#E85D5D] text-white"
            : "bg-[#FFF8ED] text-[#1F2A24]"
        }
      `}
    >

      <span
        aria-hidden="true"
        className="text-xl"
      >
        {icon}
      </span>

      <span
        className="
          font-[Fredoka,ui-rounded,sans-serif]
          text-lg
          font-bold
          tabular-nums
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
  // Load level ONLY after authentication
  //
  // Important:
  // The previous implementation called loadLevel() immediately on mount.
  // That could happen before login and generate a 401.
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
  // Once an order is fulfilled/expired, allow the happy/angry state to
  // remain visible briefly before moving the customer away.
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
  // Do this before rendering the game.
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
  // Game
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
            "max(8px, env(safe-area-inset-top))",
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
                  scale-110
                  object-cover
                  object-center
                "
              />

            )}

          </div>


          {/* ============================================================= */}
          {/* SUBTLE DARK OVERLAY                                             */}
          {/* Keeps UI readable without hiding the artwork.                  */}
          {/* ============================================================= */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              z-[1]
              bg-black/[0.04]
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
              z-40
              flex
              items-center
              justify-between
              px-5
              pt-4
            "
          >

            {/* Exit */}

            <button
              type="button"
              onClick={onExit}
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                bg-black/25
                text-3xl
                font-bold
                text-white
                backdrop-blur-sm
                transition
                active:scale-95
              "
              aria-label="Exit level"
            >
              ×
            </button>


            {/* Score + coins */}

            <div
              className="
                flex
                items-center
                gap-3
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

          </div>


          {/* ============================================================= */}
          {/* CUSTOMER AREA                                                  */}
          {/* ============================================================= */}

          <div
            className="
              absolute
              left-0
              right-0
              top-[46%]
              z-20
              flex
              justify-center
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
          {/* CARRIED FOOD                                                   */}
          {/* ============================================================= */}

          <AnimatePresence>

            {carriedFood && (

              <motion.div
                initial={{
                  opacity: 0,
                  y: -8,
                }}

                animate={{
                  opacity: 1,
                  y: 0,
                }}

                exit={{
                  opacity: 0,
                  y: -8,
                }}

                className="
                  absolute
                  left-1/2
                  top-[42%]
                  z-50
                  flex
                  -translate-x-1/2
                  items-center
                  gap-2
                  whitespace-nowrap
                  rounded-full
                  bg-white/95
                  px-4
                  py-2
                  text-sm
                  font-bold
                  text-[#1F2A24]
                  shadow-lg
                  backdrop-blur-sm
                "
              >

                Carrying {carriedFood.name}
                {" "}
                — tap a customer to serve

              </motion.div>

            )}

          </AnimatePresence>


          {/* ============================================================= */}
          {/* KITCHEN                                                        */}
          {/*                                                                 */}
          {/* Kitchen is now a full-scene absolute positioning layer.       */}
          {/* Its own component places cooking slots at ~22% and             */}
          {/* ingredients near the bottom.                                   */}
          {/* ============================================================= */}

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


          {/* ============================================================= */}
          {/* PAUSE BUTTON                                                   */}
          {/* ============================================================= */}

          {status === "playing" && (

            <button
              type="button"
              onClick={pauseLevel}
              className="
                absolute
                right-5
                top-20
                z-50
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                bg-black/25
                text-xl
                font-bold
                text-white
                backdrop-blur-sm
                transition
                active:scale-95
              "
              aria-label="Pause"
            >
              ❚❚
            </button>

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

                  <p
                    className="
                      mb-4
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
                    mb-5
                    text-sm
                    text-white/80
                  "
                >
                  Target score:{" "}
                  {level?.targetScore}
                </p>

                <PrimaryButton
                  onClick={startLevel}
                >
                  Start
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