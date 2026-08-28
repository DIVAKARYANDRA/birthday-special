/**
 * Kitchen
 *
 * Transparent positioning layer for the kitchen controls.
 *
 * The game scene itself is rendered by PoojaKitchenGame. This component
 * places:
 *   - cooking slots in the upper/middle kitchen area
 *   - ingredient buttons near the bottom of the scene
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
           * For the current game there is one main kitchen station.
           *
           * Keep the station centered horizontally while allowing
           * additional stations to spread out if they are introduced later.
           */
          const stationLeft =
            stations.length === 1
              ? "50%"
              : `${20 + stationIndex * (
                  60 / Math.max(1, stations.length - 1)
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

              {/* ===================================================== */}
              {/* COOKING SLOTS                                         */}
              {/* ===================================================== */}

              <div
                className="
                  pointer-events-none
                  absolute
                  top-[22%]
                  flex
                  -translate-x-1/2
                  items-end
                  justify-center
                  gap-4
                "
                style={{
                  left: stationLeft,
                }}
              >

                {slotsForStation.map(
                  (slot) => (

                    slot.food ? (

                      <div
                        key={slot.id}
                        className="
                          pointer-events-auto
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
                              ? onCollect(slot.id)
                              : undefined
                          }
                        />

                      </div>

                    ) : (

                      <button
                        key={slot.id}
                        type="button"
                        disabled
                        aria-label="Empty cooking slot"
                        className="
                          pointer-events-none
                          flex
                          h-14
                          w-14
                          items-center
                          justify-center
                          rounded-2xl
                          border-2
                          border-dashed
                          border-white/25
                          bg-white/[0.04]
                          text-2xl
                          text-white/20
                        "
                      >
                        +
                      </button>

                    )

                  )
                )}

              </div>


              {/* ===================================================== */}
              {/* INGREDIENTS                                           */}
              {/* ===================================================== */}

              <div
                className="
                  pointer-events-none
                  absolute
                  bottom-[3%]
                  left-[2%]
                  right-[2%]
                "
              >

                <div
                  className="
                    pointer-events-none
                    flex
                    items-end
                    gap-4
                  "
                >

                  {menuFoods.map(
                    (food) => (

                      <div
                        key={food.id}
                        className="
                          pointer-events-auto
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
                                  slot.state === "idle"
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