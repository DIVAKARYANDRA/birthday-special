export interface PuzzleImage {

 id:string;

 url:string;

 title:string | null;

 alt_text:string | null;

 display_order:number;

}



export interface PuzzlePiece {

 id:string;

 imageId:string;

 position:number;

 currentPosition:number;

 imageUrl:string;

}
