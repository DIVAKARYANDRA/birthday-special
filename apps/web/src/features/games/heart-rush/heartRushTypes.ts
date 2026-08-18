// ============================================================
// Heart Rush Types
// ============================================================

export type HeartRushVisualType =
  | "emoji"
  | "image";


export type HeartRushBehaviorType =
  | "normal"
  | "bonus"
  | "penalty"
  | "bomb";


export type HeartRushRarity =
  | "common"
  | "rare"
  | "special";


// ============================================================
// Media
// ============================================================

export interface HeartRushMedia {

  id:string;

  url:string;

  title:string;

  alt_text:string | null;

}


// ============================================================
// Falling Object
// ============================================================

export interface HeartRushObject {

  id:string;

  visualType:
    HeartRushVisualType;

  emoji:
    string | null;

  media:
    HeartRushMedia | null;

  behaviorType:
    HeartRushBehaviorType;

  name:string;

  points:number;

  fallSpeed:number;

  rarity:
    HeartRushRarity;

}


// ============================================================
// Level
// ============================================================

export interface HeartRushLevel {

  level:number;

  image:
    HeartRushMedia | null;

  objects:
    HeartRushObject[];

  objectCount:number;

  timeLimit:number;

  completionScore:number;

  spawnSpeed:
    "slow"
    | "medium"
    | "fast";

  spawnFrequency:number;

  maxObjects:number;

  isFinalLevel:boolean;

}