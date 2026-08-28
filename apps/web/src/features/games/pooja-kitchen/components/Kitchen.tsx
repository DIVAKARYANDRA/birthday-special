/**
 * Kitchen
 *
 * Reusable kitchen interaction layer for Pooja Kitchen.
 *
 * Design goals:
 *   - Keep the bottom ingredient/food tray consistent across all levels.
 *   - Keep cooking slots in a predictable area above the food tray.
 *   - Support multiple stations and multiple cooking slots.
 *   - All food/station configuration comes from the level/backend.
 *   - No level-specific positioning or food-specific logic lives here.
 *
 * The game scene/background is owned by PoojaKitchenGame.
 * This component only provides the interactive kitchen layer.
 */

import type {
  CookingSlot,
  Food,
  KitchenStation,
} from "../data/types";

import { FoodItem } from "./FoodItem";


// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface KitchenProps {

  stations: KitchenStation[];

  cookingSlots: CookingSlot[];

  foods: Food[];

  onStartCooking: (
    slotId: string,
    food: Food
  ) => void;

  onCollect: (
    slotId: string
  ) => void;

}


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cookProgress(
  slot: CookingSlot
): number {

  if (
    !slot.food ||
    slot.state !== "cooking"
  ) {

    return 0;

  }


  const totalMs =
    slot.food.cookTime * 1000;


  if (totalMs <= 0) {

    return 1;

  }


  return Math.min(
    1,
    slot.elapsedMs / totalMs
  );

}


// ---------------------------------------------------------------------------
// Kitchen
// ---------------------------------------------------------------------------

export function Kitchen({

  stations,

  cookingSlots,

  foods,

  onStartCooking,

  onCollect,

}: KitchenProps) {


  return (

    <div
      className="
        pointer-events-none
        absolute
        inset-0
        z-30
      "
      aria-label="Kitchen stations"
    >

      {/* ================================================================= */}
      {/* COOKING STATIONS                                                  */}
      {/* ================================================================= */}

      {stations.map(
        (station, stationIndex) => {

          const menuFoods =
            foods.filter(
              (food) =>
                station.supportedFoodIds.includes(
                  food.id
                )
            );


          const slotsForStation =
            cookingSlots.filter(
              (slot) =>
                slot.stationId === station.id
            );


          const hasFreeSlot =
            slotsForStation.some(
              (slot) =>
                slot.state === "idle"
            );


          /*
           * Station positioning
           *
           * One station:
           *   - centered
           *
           * Multiple stations:
           *   - distributed across the middle area
           *
           * This keeps the layout reusable for future levels.
           */

          const stationLeft =
            stations.length === 1
              ? "50%"
              : `${18 + stationIndex * (
                  64 /
                  Math.max(
                    1,
                    stations.length - 1
                  )
                )}%`;


          return (

            <div
              key={station.id}
              className="
                pointer-events-none
                absolute
                inset-0
              "
            >

              {/* ========================================================= */}
              {/* COOKING SLOTS                                              */}
              {/* ========================================================= */}

              <div
                className="
                  pointer-events-none
                  absolute
                  left-1/2
                  top-[23%]
                  flex
                  -translate-x-1/2
                  items-end
                  justify-center
                  gap-3
                  sm:gap-4
                "
                style={{
                  left: stationLeft,
                }}
              >

                {slotsForStation.map(
                  (slot) => {

                    /*
                     * Empty slot
                     */

                    if (!slot.food) {

                      return (

                        <div
                          key={slot.id}
                          className="
                            flex
                            h-14
                            w-14
                            items-center
                            justify-center
                            rounded-2xl
                            border-2
                            border-dashed
                            border-white/20
                            bg-black/10
                          "
                          aria-hidden="true"
                        />

                      );

                    }


                    /*
                     * Food currently cooking / ready / burnt.
                     */

                    return (

                      <div
                        key={slot.id}
                        className="
                          pointer-events-auto
                          relative
                        "
                      >

                        <FoodItem
                          food={slot.food}

                          variant="cooking"

                          cookState={
                            slot.state
                          }

                          progress={
                            cookProgress(
                              slot
                            )
                          }

                          onClick={() => {

                            if (
                              slot.state ===
                              "ready"
                            ) {

                              onCollect(
                                slot.id
                              );

                            }

                          }}

                        />

                      </div>

                    );

                  }
                )}

              </div>


              {/* ========================================================= */}
              {/* BOTTOM FOOD TRAY                                           */}
              {/* ========================================================= */}

              <div
                className="
                  pointer-events-none
                  absolute
                  bottom-0
                  left-0
                  right-0
                  px-3
                  pb-[max(10px,env(safe-area-inset-bottom))]
                "
              >

                <div
                  className="
                    pointer-events-auto
                    mx-auto
                    flex
                    w-full
                    max-w-[1100px]
                    items-end
                    justify-center
                  "
                >

                  {/* =================================================== */}
                  {/* FOOD COUNTER / TRAY                                  */}
                  {/* =================================================== */}

                  <div
                    className="
                      flex
                      w-full
                      items-end
                      justify-center
                      gap-2
                      overflow-x-auto
                      overscroll-x-contain
                      rounded-[24px]
                      border
                      border-white/15
                      bg-black/25
                      px-3
                      pb-2
                      pt-2
                      shadow-2xl
                      backdrop-blur-md
                    "
                  >

                    {menuFoods.map(
                      (food) => {

                        const freeSlot =
                          slotsForStation.find(
                            (slot) =>
                              slot.state ===
                              "idle"
                          );


                        return (

                          <div
                            key={food.id}
                            className="
                              flex
                              flex-shrink-0
                            "
                          >

                            <FoodItem
                              food={food}

                              variant="menu"

                              disabled={
                                !hasFreeSlot
                              }

                              onClick={() => {

                                if (
                                  !freeSlot
                                ) {

                                  return;

                                }


                                onStartCooking(
                                  freeSlot.id,
                                  food
                                );

                              }}

                            />

                          </div>

                        );

                      }
                    )}

                  </div>

                </div>

              </div>

            </div>

          );

        }
      )}

    </div>

  );

}