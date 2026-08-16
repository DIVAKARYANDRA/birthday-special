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
  DEFAULT_HIDDEN_TARGETS,
  POINTS_PER_OBJECT,
} from "@/features/games/hidden-objects/levels";

import {
 useEffect,
} from "react";

import type {
 HiddenObjectImage,
} from "@/features/games/hidden-objects/types";



export default function HiddenObjectsScene(){



const gameId =
"hidden-objects";


const [
images,
setImages
]
=
useState<HiddenObjectImage[]>([]);


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


async function loadImages(){


try{


const response =
await fetch(
`${import.meta.env.VITE_API_BASE_URL ?? ""}/api/v1/experience/media/gallery`
);


const data =
await response.json();



const gameImages =
data
.filter(
(item:any)=>

item.usage==="game"

&&

item.category==="hidden-objects"

)
.sort(
(a:any,b:any)=>
(a.display_order ?? 999)
-
(b.display_order ?? 999)
);



setImages(

gameImages.map(
(item:any)=>(

{

id:item.id,

url:item.url,

title:item.title,

alt_text:item.alt_text,

display_order:item.display_order

}

)

)

);


}

catch(error){

console.error(
"Hidden objects loading failed",
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
images.find(
(image)=>
image.display_order===level
)
||
null;







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
images.length===0
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
currentImage &&

<HiddenObjectsBoard

image={
currentImage
}


targets={
DEFAULT_HIDDEN_TARGETS
}


pointsPerObject={
POINTS_PER_OBJECT
}


onLevelComplete={
handleLevelComplete
}


/>


}

</>


)


}






</div>



</GamePasswordGate>



</SceneLayout>


);


}