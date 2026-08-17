import {
  useEffect,
  useState,
} from "react";

import {
  getGameGift,
} from "@/features/games/shared/gifts";


import {
  getGameProgress,
  updateGameProgress,
} from "@/features/games/shared/gameStorage";

import {
  getCupidArrowLevel,
} from "@/features/games/cupid-arrow/cupidArrowApi";

import GamePasswordGate from "@/features/games/shared/GamePasswordGate";

import GameHeader from "@/features/games/shared/GameHeader";

import GameMusicPlayer from "@/features/games/shared/GameMusicPlayer";

import GiftReveal from "@/features/games/shared/GiftReveal";


import SceneLayout from "@/components/global/SceneLayout";

import Breadcrumb from "@/components/ui/Breadcrumb";


import CupidArrowBoard 
from "@/features/games/cupid-arrow/CupidArrowBoard";




export default function CupidArrowScene(){



const gameId =
"cupid-arrow";



const progress =
getGameProgress(
gameId
);



const [
level,
setLevel
]
=
useState(
progress.level
);



const [
totalScore,
setTotalScore
]
=
useState(
progress.score
);



const [
completed,
setCompleted
]
=
useState(false);

const [
currentLevelData,
setCurrentLevelData
]
=
useState<any>(null);


const [
loading,
setLoading
]
=
useState(true);

useEffect(()=>{


async function loadLevel(){


try{


const data =
await getCupidArrowLevel(
level
);


setCurrentLevelData(
data
);


}
catch(error){

console.error(
"Cupid Arrow level loading failed",
error
);


}
finally{

setLoading(false);

}


}


void loadLevel();


},[level]);

function handleLevelComplete(
score:number
){



const updatedScore =
totalScore + score;



setTotalScore(
updatedScore
);



if(level>=10){


updateGameProgress(

gameId,

{

level:10,

score:updatedScore

}

);



setCompleted(true);


return;


}




const nextLevel =
level+1;



updateGameProgress(

gameId,

{

level:nextLevel,

score:updatedScore

}

);



setLevel(
nextLevel
);



}







function resetGame(){


sessionStorage.removeItem(
`game-progress-${gameId}`
);


window.location.reload();


}






return (


<SceneLayout mode="twilight">


<Breadcrumb

label="Cupid Arrow 💘"

/>




<GamePasswordGate

gameId={gameId}

>



<div

className="

flex

flex-1

flex-col

overflow-y-auto

px-5

pb-20

pt-6

"

>




<GameHeader


level={
Math.min(level,10)
}


totalScore={
totalScore
}


music={


<GameMusicPlayer

gameId={gameId}

/>


}



onReset={
resetGame
}


/>






{

completed

?


(

<GiftReveal

gift={
getGameGift(gameId)
}

/>

)


:


(


<>


<h1

className="

mb-6

text-center

text-3xl

font-semibold

text-white

"

>

🏹 Cupid Arrow Challenge 💘

</h1>



{
loading &&

<p
className="
text-center
text-white/60
"
>

Preparing Cupid arrows ❤️

</p>

}


{
!loading &&
currentLevelData &&
currentLevelData.targets?.length > 0 &&

<CupidArrowBoard

levelData={
currentLevelData
}

onLevelComplete={
handleLevelComplete
}

/>

}

{
!loading &&
currentLevelData &&
currentLevelData.targets?.length === 0 &&

<p
className="
text-center
text-white/60
mt-8
"
>

Cupid is preparing more surprises ❤️

</p>

}


</>


)

}





</div>



</GamePasswordGate>



</SceneLayout>


);



}