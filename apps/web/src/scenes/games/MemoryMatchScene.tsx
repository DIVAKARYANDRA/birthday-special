import {
  useEffect,
  useState,
} from "react";


import SceneLayout from "@/components/global/SceneLayout";
import Breadcrumb from "@/components/ui/Breadcrumb";


import GamePasswordGate from "@/features/games/shared/GamePasswordGate";

import GiftReveal from "@/features/games/shared/GiftReveal";

import {
  getGameGift,
} from "@/features/games/shared/gifts";


import {
  getMemoryLevel,
} from "@/features/games/memory-match/levels";


import MemoryMatchBoard from "@/features/games/memory-match/MemoryMatchBoard";


import type {
  MemoryImage,
} from "@/features/games/memory-match/types";



import {
  getGameProgress,
  updateGameProgress,
} from "@/features/games/shared/gameStorage";





const API =
import.meta.env.VITE_API_BASE_URL ?? "";





export default function MemoryMatchScene(){



const gameId =
"memory-match";



const [
images,
setImages
]
=
useState<MemoryImage[]>([]);



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
completed,
setCompleted
]
=
useState(false);



const [
finalScore,
setFinalScore
]
=
useState(0);





useEffect(()=>{


async function loadImages(){


try{


const response =
await fetch(
`${API}/api/v1/experience/media/gallery`
);



if(!response.ok){

throw new Error(
"Unable to load memories"
);

}



const data =
await response.json();




const gameImages =
data.filter(
(item:any)=>

item.usage === "game"

&&

item.category === "memory-match"

);



setImages(

gameImages.map(
(item:any)=>(

{

id:
item.id,

url:
item.url,

title:
item.title,

alt_text:
item.alt_text,

category:
item.category

}

)

)

);



}

catch(error){

console.error(
"Memory images loading failed",
error
);


}

finally{

setLoading(false);

}


}



void loadImages();


},[]);








function handleLevelComplete(
score:number
){


const nextLevel =
level + 1;



updateGameProgress(
gameId,
{

level:
nextLevel,

score

}

);




if(
level >= 10
){


setFinalScore(score);


setCompleted(true);


return;


}




setLevel(
nextLevel
);


}








function restartJourney(){


sessionStorage.removeItem(
`game-progress-${gameId}`
);


window.location.reload();


}









return (


<SceneLayout mode="twilight">


<Breadcrumb
label="Memory Match ❤️"
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



{

completed ?


<GiftReveal

gift={
getGameGift(gameId)
}


/>


:



<>


<div

className="
mb-8
text-center
"

>


<div

className="
mb-3
text-5xl
"

>

❤️

</div>



<h1

className="
text-3xl
font-semibold
text-white
"

>

Memory Match

</h1>



<p

className="
mt-2
text-sm
text-white/60
"

>

Level {level}/10

</p>



</div>





{

loading &&


<p

className="
text-center
text-white/60
"

>

Opening memories...

</p>


}





{

!loading
&&
images.length===0
&&


<p

className="
text-center
text-white/60
"

>

No game memories added yet ❤️

</p>


}





{

!loading
&&
images.length>0
&&


<MemoryMatchBoard


images={
images
}


pairs={
getMemoryLevel(level).pairs
}


pointsPerMatch={
getMemoryLevel(level).pointsPerMatch
}


onLevelComplete={
handleLevelComplete
}


/>


}



</>


}




</div>



</GamePasswordGate>



</SceneLayout>


);


}