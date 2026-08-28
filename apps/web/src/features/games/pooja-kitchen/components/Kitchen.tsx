/**
 * Kitchen
 *
 * Transparent interaction layer for the kitchen controls.
 *
 * Layout strategy:
 *   - Customers remain visually dominant in the center.
 *   - Cooking slots live on the left/right edges so they do not
 *     consume the central vertical space.
 *   - Food selection remains permanently anchored to the bottom.
 *   - No large background panel or blur is used behind the controls.
 *   - All interaction remains configuration-driven.
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
   * One station:
   *
   *       CUSTOMERS
   *
   *   FOOD        FOOD
   *
   * Put the cooking slots on the right.
   */

  if (stationCount === 1) {
    return "right";
  }


  /*
   * Multiple stations alternate sides.
   *
   * Station 0 -> left
   * Station 1 -> right
   * Station 2 -> left
   * Station 3 -> right
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
        z-[40]
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
          // Determine whether at least one cooking slot is available.
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
                  right: "1.5%",
                }
              : {
                  left: "1.5%",
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
                  top-[42%]
                  z-[60]
                  flex
                  -translate-y-1/2
                  flex-col
                  items-center
                  justify-center
                "
                style={sidePosition}
              >


                <div
                  className="
                    pointer-events-none
                    grid
                    grid-cols-1
                    items-center
                    justify-items-center
                    gap-2
                  "
                >


                  {slotsForStation.map(
                    (slot) => {


                      // -------------------------------------------------
                      // Occupied cooking slot
                      // -------------------------------------------------

                      if (slot.food) {

                        return (

                          <div
                            key={slot.id}
                            className="
                              pointer-events-auto
                              relative
                              z-[70]
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


                      // -------------------------------------------------
                      // Empty cooking slot
                      // -------------------------------------------------

                      return (

                        <div
                          key={slot.id}
                          className="
                            pointer-events-none
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-dashed
                            border-white/15
                            bg-black/5
                          "
                          aria-label="Empty cooking slot"
                        >

                          <span
                            className="
                              text-base
                              font-light
                              text-white/15
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
                  bottom-[1.5%]
                  left-1/2
                  z-[55]
                  w-[96%]
                  -translate-x-1/2
                "
              >

                <div
                  className="
                    pointer-events-none
                    flex
                    min-h-[66px]
                    items-end
                    justify-center
                    gap-2
                    overflow-visible
                    px-1
                    pb-0
                    pt-1
                  "
                >


                  {menuFoods.map(
                    (food) => (

                      <div
                        key={food.id}
                        className="
                          pointer-events-auto
                          relative
                          z-[60]
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