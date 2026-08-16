export interface MemoryImage {


  id:string;


  url:string;


  title:string|null;


  alt_text:string|null;


  category:string|null;


}



export interface MemoryCard {


  id:string;


  imageId:string;


  imageUrl:string;


  title:string;


  isFlipped:boolean;


  isMatched:boolean;


}



export interface MemoryLevel {


  level:number;


  pairs:number;


  pointsPerMatch:number;


}



export interface MemoryGameState {


  level:number;


  score:number;


  moves:number;


  matchedPairs:number;


  totalPairs:number;


  completed:boolean;


}