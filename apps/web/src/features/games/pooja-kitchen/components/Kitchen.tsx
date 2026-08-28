/**
 * Kitchen
 *
 * Renders the cooking stations area. Game state and all interactions remain
 * owned by the caller; this component is presentation + event delegation only.
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
        flex
        w-full
        flex-col
        gap-3
      "
      aria-label="Kitchen stations"
    >

      {stations.map(
        (station) => {

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


          return (

            <div
              key={station.id}
              className="
                overflow-hidden
                rounded-2xl
                border
                border-white/10
                bg-white/[0.04]
                p-3
                shadow-lg
                backdrop-blur-sm
              "
            >

              {/* Station header */}

              <div
                className="
                  mb-3
                  flex
                  items-center
                  justify-between
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >

                  <span
                    className="
                      text-xl
                    "
                  >
                    🍳
                  </span>

                  <div>

                    <p
                      className="
                        text-sm
                        font-semibold
                        text-white
                      "
                    >
                      {station.name}
                    </p>

                    <p
                      className="
                        text-[10px]
                        text-white/50
                      "
                    >
                      Cooking station
                    </p>

                  </div>

                </div>


                <span
                  className="
                    rounded-full
                    bg-white/10
                    px-2
                    py-1
                    text-[10px]
                    text-white/60
                  "
                >
                  {slotsForStation.filter(
                    (slot) =>
                      slot.state === "idle"
                  ).length}
                  {" "}
                  free
                </span>

              </div>


              {/* Cooking slots */}

              <div
                className="
                  rounded-xl
                  border
                  border-white/10
                  bg-black/10
                  p-2
                "
              >

                <div
                  className="
                    mb-2
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-wider
                    text-white/40
                  "
                >
                  Cooking
                </div>


                <div
                  className="
                    flex
                    min-h-[64px]
                    flex-wrap
                    gap-2
                  "
                >

                  {slotsForStation.map(
                    (slot) => (

                      slot.food ? (

                        <FoodItem
                          key={slot.id}

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

                      ) : (

                        <button
                          key={slot.id}
                          type="button"
                          disabled
                          aria-label="Empty cooking slot"
                          className="
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-xl
                            border-2
                            border-dashed
                            border-white/20
                            bg-white/[0.02]
                            text-white/20
                          "
                        >
                          +
                        </button>

                      )

                    )
                  )}

                </div>

              </div>


              {/* Food menu */}

              <div
                className="
                  mt-3
                  rounded-xl
                  border
                  border-white/10
                  bg-black/10
                  p-2
                "
              >

                <div
                  className="
                    mb-2
                    flex
                    items-center
                    justify-between
                  "
                >

                  <div
                    className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-white/40
                    "
                  >
                    Ingredients
                  </div>


                  {!hasFreeSlot && (

                    <span
                      className="
                        text-[10px]
                        text-white/40
                      "
                    >
                      All slots busy
                    </span>

                  )}

                </div>


                <div
                  className="
                    flex
                    flex-wrap
                    gap-2
                  "
                >

                  {menuFoods.map(
                    (food) => (

                      <FoodItem
                        key={food.id}

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

                          if (freeSlot) {

                            onStartCooking(
                              freeSlot.id,
                              food
                            );

                          }

                        }}
                      />

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