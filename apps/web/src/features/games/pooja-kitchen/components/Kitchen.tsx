/**
 * Kitchen
 *
 * Renders the cooking stations area: for each station, its menu of
 * cookable foods plus its cooking slot(s) showing live progress. All
 * interaction (starting a cook, collecting a ready item) is delegated
 * back up to the caller — this component holds no game state itself,
 * matching the rest of the engine/hook/component split.
 */

import type { CookingSlot, Food, KitchenStation } from '../data/types';
import { FoodItem } from './FoodItem';

export interface KitchenProps {
  stations: KitchenStation[];
  cookingSlots: CookingSlot[];
  foods: Food[];
  onStartCooking: (slotId: string, food: Food) => void;
  onCollect: (slotId: string) => void;
}

function cookProgress(slot: CookingSlot): number {
  if (!slot.food || slot.state !== 'cooking') return 0;
  const totalMs = slot.food.cookTime * 1000;
  if (totalMs <= 0) return 1;
  return slot.elapsedMs / totalMs;
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
      className="flex w-full flex-col gap-3 rounded-t-3xl bg-[#C9944A] px-3 pb-4 pt-3 shadow-[0_-4px_12px_rgba(0,0,0,0.15)]"
      aria-label="Kitchen stations"
    >
      {stations.map((station) => {
        const menuFoods = foods.filter((food) =>
          station.supportedFoodIds.includes(food.id)
        );
        const slotsForStation = cookingSlots.filter(
          (slot) => slot.stationId === station.id
        );
        const hasFreeSlot = slotsForStation.some((slot) => slot.state === 'idle');

        return (
          <div
            key={station.id}
            className="flex flex-col gap-2 rounded-2xl bg-[#E8B75D]/60 p-2"
          >
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-[#1F2A24]">
                {station.name}
              </span>
              <div className="flex gap-1">
                {slotsForStation.map((slot) =>
                  slot.food ? (
                    <FoodItem
                      key={slot.id}
                      food={slot.food}
                      variant="cooking"
                      cookState={slot.state}
                      progress={cookProgress(slot)}
                      onClick={() => slot.state === 'ready' && onCollect(slot.id)}
                    />
                  ) : (
                    <div
                      key={slot.id}
                      className="h-12 w-12 rounded-xl border-2 border-dashed border-white/40"
                      aria-label="Empty cooking slot"
                    />
                  )
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {menuFoods.map((food) => (
                <FoodItem
                  key={food.id}
                  food={food}
                  variant="menu"
                  disabled={!hasFreeSlot}
                  onClick={() => {
                    const freeSlot = slotsForStation.find(
                      (slot) => slot.state === 'idle'
                    );
                    if (freeSlot) onStartCooking(freeSlot.id, food);
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
