/**
 * Kitchen
 *
 * Bottom cooking/control area for Pooja Kitchen.
 *
 * Design goals:
 *   - The customer area remains visually separate from the kitchen controls.
 *   - Cooking slots always live in a dedicated lower cooking zone.
 *   - Food/menu buttons remain at the bottom of the screen.
 *   - Additional foods can be supported without breaking the layout.
 *   - Additional cooking slots can be supported without changing game code.
 *   - All level-specific configuration continues to come from the backend.
 *
 * Game state and interactions remain owned by the caller.
 */

import type {
  CookingSlot,
  Food,
  KitchenStation,
} from "../data/types";

import { FoodItem } from "./FoodItem";

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
// Cooking progress
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

      {stations.map(
        (station) => {

          // ---------------------------------------------------------------
          // Foods supported by this station
          // ---------------------------------------------------------------

          const menuFoods =
            foods.filter(
              (food) =>
                station.supportedFoodIds.includes(
                  food.id
                )
            );


          // ---------------------------------------------------------------
          // Cooking slots belonging to this station
          // ---------------------------------------------------------------

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


          // ---------------------------------------------------------------
          // Render
          // ---------------------------------------------------------------

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
              {/* COOKING AREA                                              */}
              {/* ========================================================= */}
              {/*
               * This is deliberately kept in the lower half of the game.
               *
               * Customers/order bubbles occupy the upper portion.
               *
               * The cooking area is therefore independent from the
               * customer queue and will remain stable when more customers
               * or orders are introduced.
               */}

              <div
                className="
                  pointer-events-none
                  absolute
                  bottom-[25%]
                  left-0
                  right-0
                  flex
                  items-end
                  justify-center
                  px-3
                "
              >

                <div
                  className="
                    pointer-events-none
                    flex
                    max-w-full
                    items-end
                    justify-center
                    gap-2
                    sm:gap-3
                    md:gap-4
                  "
                >

                  {slotsForStation.map(
                    (slot) => {

                      // ---------------------------------------------------
                      // Occupied slot
                      // ---------------------------------------------------

                      if (slot.food) {

                        return (

                          <div
                            key={slot.id}
                            className="
                              pointer-events-auto
                              flex
                              flex-shrink-0
                              items-end
                              justify-center
                            "
                          >

                            <FoodItem
                              food={slot.food}

                              variant="cooking"

                              cookState={
                                slot.state
                              }

                              progress={
                                cookProgress(slot)
                              }

                              onClick={() =>
                                slot.state === "ready"
                                  ? onCollect(
                                      slot.id
                                    )
                                  : undefined
                              }
                            />

                          </div>

                        );

                      }


                      // ---------------------------------------------------
                      // Empty cooking slot
                      // ---------------------------------------------------

                      return (

                        <div
                          key={slot.id}
                          className="
                            pointer-events-none
                            flex
                            h-11
                            w-11
                            flex-shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-dashed
                            border-white/20
                            bg-black/10
                            sm:h-12
                            sm:w-12
                            sm:rounded-2xl
                            md:h-14
                            md:w-14
                          "
                          aria-label="Empty cooking slot"
                        >

                          <span
                            className="
                              text-lg
                              font-light
                              text-white/25
                              md:text-xl
                            "
                          >
                            +
                          </span>

                        </div>

                      );

                    }
                  )}

                </div>

              </div>


              {/* ========================================================= */}
              {/* FOOD MENU / COOKING CONTROLS                              */}
              {/* ========================================================= */}
              {/*
               * The menu is intentionally anchored to the bottom.
               *
               * This becomes the permanent interaction area for every
               * level. Future levels can simply provide different Food
               * definitions from the admin panel.
               *
               * Horizontal scrolling prevents a large number of foods
               * from breaking the landscape layout.
               */}

              <div
                className="
                  pointer-events-none
                  absolute
                  bottom-[2%]
                  left-0
                  right-0
                  flex
                  justify-center
                  px-2
                  sm:px-3
                  md:px-4
                "
              >

                <div
                  className="
                    pointer-events-auto
                    flex
                    max-w-[96%]
                    items-end
                    gap-2
                    overflow-x-auto
                    overflow-y-hidden
                    px-1
                    pb-1
                    sm:gap-3
                    md:gap-4
                  "
                  style={{
                    scrollbarWidth: "none",
                    WebkitOverflowScrolling:
                      "touch",
                  }}
                >

                  {menuFoods.map(
                    (food) => {

                      return (

                        <div
                          key={food.id}
                          className="
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

                              const freeSlot =
                                slotsForStation.find(
                                  (slot) =>
                                    slot.state ===
                                    "idle"
                                );


                              if (
                                freeSlot
                              ) {

                                onStartCooking(
                                  freeSlot.id,
                                  food
                                );

                              }

                            }}
                          />

                        </div>

                      );

                    }
                  )}

                </div>

              </div>

            </div>

          );

        }
      )}

    </div>

  );

}