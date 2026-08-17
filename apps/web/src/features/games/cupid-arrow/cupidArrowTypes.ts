export type CupidTargetType =
  | "emoji"
  | "image";


export type CupidMovementSpeed =
  | "slow"
  | "medium"
  | "fast";


export type CupidTargetStatus =
  | "idle"
  | "hit"
  | "broken";



export interface CupidTargetMedia {

  id:string;

  url:string;

  title?:string | null;

  alt_text?:string | null;

}



export interface CupidArrowImage {

  id:string;

  url:string;

  title?:string | null;

  alt_text?:string | null;

}



export interface CupidArrowTarget {


  id:string;


  /**
   * Target type controlled by Admin.
   *
   * emoji:
   * ❤️ 💖 💝
   *
   * image:
   * personal photo / face image
   */
  type:CupidTargetType;



  /**
   * Used when target type = emoji.
   */
  emoji?:string | null;



  /**
   * Used when target type = image.
   */
  media?:CupidTargetMedia | null;


  /**
   * Optional media ID when needed by the frontend.
   */
  imageId?:string;



  /**
   * Target display name.
   */
  name:string;



  /**
   * Current horizontal position.
   *
   * Percentage relative to game board.
   */
  x:number;



  /**
   * Current vertical position.
   *
   * Percentage relative to game board.
   */
  y:number;



  /**
   * Horizontal movement velocity.
   */
  velocityX:number;



  /**
   * Vertical movement velocity.
   */
  velocityY:number;



  /**
   * Target size as percentage of game board.
   *
   * Controlled by Admin.
   */
  size:number;



  /**
   * Current target animation state.
   */
  status:CupidTargetStatus;



  /**
   * Points awarded when this target is hit.
   *
   * Controlled by Admin.
   */
  points:number;



  /**
   * Optional personal message.
   *
   * Reserved for future target-hit messaging.
   */
  hitMessage?:string;

}



export interface CupidArrowLevel {


  /**
   * Current level number.
   */
  level:number;



  /**
   * Background image configured by Admin.
   */
  image:CupidArrowImage | null;



  /**
   * Targets configured for this level.
   */
  targets:CupidArrowTarget[];



  /**
   * Number of configured targets.
   */
  targetCount:number;



  /**
   * Level movement difficulty.
   */
  movementSpeed:CupidMovementSpeed;



  /**
   * Maximum time allowed for the level.
   *
   * Controlled by Admin.
   */
  timeLimit:number;



  /**
   * Minimum score required to complete the level.
   *
   * Controlled by Admin.
   */
  completionScore:number;



  /**
   * True when this is the last configured level.
   *
   * Determined by the backend.
   */
  isFinalLevel:boolean;

}



export interface CupidArrowState {


  level:number;


  score:number;


  combo:number;


  arrowsRemaining:number;


  isGameCompleted:boolean;

}



export interface CupidArrowPosition {


  x:number;

  y:number;

}



export interface CupidParticle {


  id:string;


  x:number;

  y:number;



  /**
   * Particle symbol.
   *
   * ❤️
   * ✨
   * 💥
   */
  emoji:string;



  /**
   * Particle lifetime in seconds.
   */
  lifetime:number;

}



export interface CupidArrowLevelResponse {


  /**
   * Current level number.
   */
  level:number;



  /**
   * Admin-configured background image.
   */
  image:CupidArrowImage | null;



  /**
   * Targets configured for the level.
   */
  targets:CupidArrowTarget[];



  /**
   * Number of targets returned by backend.
   */
  targetCount:number;



  /**
   * Movement difficulty configured for level.
   */
  movementSpeed:CupidMovementSpeed;



  /**
   * Time limit configured for level.
   */
  timeLimit:number;



  /**
   * Completion score configured for level.
   */
  completionScore:number;



  /**
   * Whether this is the final configured level.
   */
  isFinalLevel:boolean;

}



export interface CupidProjectile {


  x:number;


  y:number;


  velocityX:number;


  velocityY:number;


  active:boolean;

}