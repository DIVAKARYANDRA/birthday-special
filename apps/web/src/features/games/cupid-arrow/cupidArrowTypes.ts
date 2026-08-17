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



export interface CupidArrowTarget {


  id:string;


  /**
   * Target type controlled by admin
   *
   * emoji:
   * ❤️ 💖 💝
   *
   * image:
   * personal photos
   */
  type:CupidTargetType;



  /**
   * Used when target type = emoji
   */
  emoji?:string;



  /**
   * Used when target type = image
   */
  media?:CupidTargetMedia;

  imageId?:string;



  /**
   * Current position %
   * relative to game board
   */
  x:number;

  y:number;



  /**
   * Movement direction
   */
  velocityX:number;

  velocityY:number;



  /**
   * Target size percentage
   */
  size:number;



  /**
   * Animation state
   */
  status:CupidTargetStatus;



  /**
   * Points earned when hit
   */
  points:number;



  /**
   * Optional personal message
   *
   * Example:
   * "You found me ❤️"
   */
  hitMessage?:string;

}



export interface CupidArrowLevel {



  /**
   * Level number
   */
  level:number;



  /**
   * Number of targets
   */
  targetCount:number;



  /**
   * Target configurations
   */
  targets:CupidArrowTarget[];



  /**
   * Movement difficulty
   */
  movementSpeed:CupidMovementSpeed;



  /**
   * Time limit in seconds
   */
  timeLimit:number;



  /**
   * Points required
   */
  completionScore:number;



  /**
   * Admin controlled background
   * future support
   */
  backgroundUrl?:string;



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
   * Particle symbol
   *
   * ❤️
   * ✨
   * 💥
   */
  emoji:string;



  lifetime:number;


}



export interface CupidArrowLevelResponse {


  level:number;


  targetCount:number;


  targets:CupidArrowTarget[];


  movementSpeed:CupidMovementSpeed;


  timeLimit:number;


  completionScore:number;


  backgroundUrl?:string;


  musicUrl?:string;


}

export interface CupidProjectile {

  x:number;

  y:number;

  velocityX:number;

  velocityY:number;

  active:boolean;

}