/**
 * Kitchen
 *
 * Transparent positioning layer for the kitchen controls.
 *
 * Layout strategy:
 *
 *   - Customers remain visually dominant in the center of the scene.
 *   - Cooking slots are moved to a compact side rail so they do not
 *     consume the central vertical space.
 *   - Food selection remains permanently anchored to the bottom counter.
 *   - The layout is configuration-driven and does not contain
 *     level-specific food/customer knowledge.
 *
 * Future levels can therefore change:
 *   - foods
 *   - stations
 *   - number of cooking slots
 *   - themes
 *
 * without requiring changes to this component.
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
// Station side
// ---------------------------------------------------------------------------

function getStationSide(
  stationIndex: number,
  stationCount: number
): "left" | "right" {

  /*
   * With one station:
   *
   *       CUSTOMER       COOKING
   *
   * Put the cooking rail on the right because this keeps the
   * main customer area visually clean.
   */

  if (stationCount === 1) {
    return "right";
  }


  /*
   * With multiple stations:
   *
   * Station 0 -> left
   * Station 1 -> right
   * Station 2 -> left
   * Station 3 -> right
   *
   * This allows future levels to introduce more kitchen stations
   * without returning everything to the center.
   */

  return stationIndex % 2 === 0
    ? "left"
    : "right";

}


// ---------------------------------------------------------------------------
// Main component
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
      aria-label="Kitchen controls"
    >


      {stations.map(
        (
          station,
          stationIndex
        ) => {


          // ---------------------------------------------------------------
          // Foods available at this station
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


          // ---------------------------------------------------------------
          // Determine whether at least one slot is available.
          // ---------------------------------------------------------------

          const hasFreeSlot =
            slotsForStation.some(
              (slot) =>
                slot.state === "idle"
            );


          const side =
            getStationSide(
              stationIndex,
              stations.length
            );


          // ---------------------------------------------------------------
          // Side positioning
          // ---------------------------------------------------------------

          const sidePosition =
            side === "right"
              ? {
                  right: "3%",
                }
              : {
                  left: "3%",
                };


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
              {/* COOKING SIDE RAIL                                         */}
              {/* ========================================================= */}

              <div
                className="
                  pointer-events-none
                  absolute
                  top-[40%]
                  flex
                  max-w-[21%]
                  -translate-y-1/2
                  flex-col
                  items-center
                  gap-2
                  rounded-2xl
                  border
                  border-white/10
                  bg-black/10
                  px-1.5
                  py-2
                  backdrop-blur-[2px]
                "
                style={sidePosition}
              >


                {/* ------------------------------------------------------- */}
                {/* Cooking slots                                            */}
                {/* ------------------------------------------------------- */}

                <div
                  className="
                    pointer-events-none
                    grid
                    max-h-[130px]
                    grid-cols-2
                    items-center
                    justify-items-center
                    gap-x-2
                    gap-y-3
                    overflow-visible
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
                              relative
                              flex
                              items-center
                              justify-center
                            "
                          >

                            <FoodItem
                              food={
                                slot.food
                              }

                              variant="cooking"

                              cookState={
                                slot.state
                              }

                              progress={
                                cookProgress(
                                  slot
                                )
                              }

                              onClick={() =>
                                slot.state ===
                                "ready"
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
                      // Empty slot
                      // ---------------------------------------------------

                      return (

                        <div
                          key={slot.id}
                          className="
                            flex
                            h-11
                            w-11
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-dashed
                            border-white/20
                            bg-black/10
                          "
                          aria-label="Empty cooking slot"
                        >

                          <span
                            className="
                              text-lg
                              font-light
                              text-white/20
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
              {/* BOTTOM FOOD COUNTER                                       */}
              {/* ========================================================= */}

              <div
                className="
                  pointer-events-none
                  absolute
                  bottom-[2.5%]
                  left-1/2
                  w-[94%]
                  -translate-x-1/2
                "
              >

                <div
                  className="
                    pointer-events-none
                    flex
                    min-h-[74px]
                    items-end
                    justify-center
                    gap-2
                    rounded-3xl
                    border
                    border-white/10
                    bg-black/10
                    px-3
                    pb-1
                    pt-2
                    backdrop-blur-[2px]
                  "
                >


                  {menuFoods.map(
                    (food) => (

                      <div
                        key={food.id}
                        className="
                          pointer-events-auto
                          flex-shrink-0
                        "
                      >

                        <FoodItem
                          food={
                            food
                          }

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

                    )
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