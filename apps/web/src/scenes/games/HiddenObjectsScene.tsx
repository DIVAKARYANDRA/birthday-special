import {
  useState,
} from "react";


import SceneLayout from "@/components/global/SceneLayout";
import Breadcrumb from "@/components/ui/Breadcrumb";


import GamePasswordGate from "@/features/games/shared/GamePasswordGate";
import GameHeader from "@/features/games/shared/GameHeader";
import GameMusicPlayer from "@/features/games/shared/GameMusicPlayer";
import GiftReveal from "@/features/games/shared/GiftReveal";


import {
  getGameGift,
} from "@/features/games/shared/gifts";


import {
  getGameProgress,
  updateGameProgress,
} from "@/features/games/shared/gameStorage";


import HiddenObjectsBoard from "@/features/games/hidden-objects/HiddenObjectsBoard";


import {
 useEffect,
} from "react";



export default function HiddenObjectsScene(){



const gameId =
"hidden-objects";


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

const [
level,
setLevel
]
=
useState(
()=>getGameProgress(gameId).level
);



const [
totalScore,
setTotalScore
]
=
useState(
()=>getGameProgress(gameId).score
);



const [
completed,
setCompleted
]
=
useState(false);


useEffect(()=>{


async function loadHiddenLevel(){


try{


const response =
await fetch(
`${import.meta.env.VITE_API_BASE_URL ?? ""}/api/v1/experience/hidden-objects/${level}`
);


if(!response.ok){

throw new Error(
"Unable to load hidden object level"
);

}


const data =
await response.json();


setCurrentLevelData(data);


}
catch(error){

console.error(
"Hidden object level loading failed",
error
);

}


}


void loadHiddenLevel();


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
level + 1;



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



const currentImage =
currentLevelData?.image ?? null;

const hasLevelImage =
currentImage !== null;






return (


<SceneLayout mode="twilight">


<Breadcrumb
label="Hidden Objects 🔍"
/>





<GamePasswordGate

gameId={
gameId
}

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

completed ?


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

🔍 Hidden Objects

</h1>

{
loading &&

<p

className="
text-center
text-white/60
"

>

Opening hidden memories... ❤️

</p>

}

{
!loading
&&
!currentLevelData?.image
&&

<p

className="
text-center
text-white/60
"

>

No hidden object memories added yet ❤️

</p>

}


{
!loading
&&
currentLevelData?.image
&&
currentLevelData?.targets?.length > 0
&&

<HiddenObjectsBoard

image={
currentImage
}

targets={
currentLevelData.targets
}


pointsPerObject={
currentLevelData.pointsPerObject
}

onLevelComplete={
handleLevelComplete
}


/>


}


{
!loading
&&
!hasLevelImage
&&

<div

className="
rounded-3xl
bg-white/10
p-8
text-center
text-white
backdrop-blur-md
"

>

<div
className="
text-5xl
mb-4
"
>
🔍
</div>


<h2
className="
text-xl
font-semibold
"
>

More memories are being prepared

</h2>


<p
className="
mt-3
text-sm
text-white/60
"
>

Level {level} image is not added yet ❤️

</p>


</div>

}

</>


)


}






</div>



</GamePasswordGate>



</SceneLayout>


);


}