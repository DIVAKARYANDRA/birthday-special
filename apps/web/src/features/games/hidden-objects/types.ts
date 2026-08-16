export interface HiddenObjectTarget {

  id:string;

  name:string;

  emoji:string;


  /**
   * Position in percentage relative to image
   *
   * Example:
   * x:70 means 70% from left
   * y:40 means 40% from top
   */
  x:number;

  y:number;


  /**
   * Detection radius percentage
   *
   * Example:
   * radius:8 means 8% clickable area
   */
  radius:number;


  found:boolean;

}




export interface HiddenObjectImage {

  id:string;

  url:string;

  title:string|null;

  alt_text:string|null;

  display_order:number;

}



export interface HiddenObjectLevel {


  level:number;


  image:HiddenObjectImage;


  targets:HiddenObjectTarget[];


  pointsPerObject:number;


}