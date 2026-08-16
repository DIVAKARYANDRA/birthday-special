export interface GameProgress {

  level:number;

  score:number;

  completed:boolean;

}





function getStorageKey(
gameId:string
){

return `game-progress-${gameId}`;

}





export function getGameProgress(
gameId:string
):GameProgress{


const stored =
sessionStorage.getItem(
getStorageKey(gameId)
);



if(!stored){

return {

level:1,

score:0,

completed:false

};

}



try{


return JSON.parse(
stored
) as GameProgress;



}

catch{


return {

level:1,

score:0,

completed:false

};


}


}





export function saveGameProgress(
gameId:string,
progress:GameProgress
){


sessionStorage.setItem(

getStorageKey(gameId),

JSON.stringify(progress)

);


}





export function updateGameProgress(
gameId:string,
updates:Partial<GameProgress>
){


const current =
getGameProgress(gameId);



const updated:GameProgress =
{

...current,

...updates

};



saveGameProgress(
gameId,
updated
);



return updated;


}





export function completeGame(
gameId:string,
finalScore:number
){


const progress:GameProgress =
{

level:10,

score:finalScore,

completed:true

};



saveGameProgress(
gameId,
progress
);



return progress;


}





export function resetGameProgress(
gameId:string
){


sessionStorage.removeItem(
getStorageKey(gameId)
);


}