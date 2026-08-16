export interface GalleryPhoto {

  id:string;

  url:string;

  title:string | null;

  alt_text:string | null;

  caption:string;

  rotationDeg:number;

  placeholderColor?:string;

  placeholderEmoji?:string;

}