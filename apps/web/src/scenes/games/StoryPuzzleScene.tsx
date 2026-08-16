import {
  useEffect,
  useState,
} from "react";


import SceneLayout from "@/components/global/SceneLayout";
import Breadcrumb from "@/components/ui/Breadcrumb";

import { motion } from "framer-motion";
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


import {
  getStoryPuzzleLevel,
} from "@/features/games/story-puzzle/levels";


import PuzzleBoard from "@/features/games/story-puzzle/PuzzleBoard";


import type {
  PuzzleImage,
} from "@/features/games/story-puzzle/types";





const API =
import.meta.env.VITE_API_BASE_URL ?? "";





export default function StoryPuzzleScene(){



const gameId =
"story-puzzle";



const [
images,
setImages
]
=
useState<PuzzleImage[]>([]);



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


const [
showFinalCelebration,
setShowFinalCelebration
]
=
useState(false);



useEffect(()=>{


async function loadImages(){


try{


const response =
await fetch(
`${API}/api/v1/experience/media/gallery`
);



if(!response.ok){

throw new Error(
"Unable to load puzzle images"
);

}



const data =
await response.json();




const puzzleImages =
data.filter(
(item:any)=>

item.usage==="game"

&&

item.category==="story-puzzle"

);



setImages(

puzzleImages
.sort(
(a:any,b:any)=>
(a.display_order ?? 999)
-
(b.display_order ?? 999)
)
.map(
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
"Story puzzle images failed",
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


setShowFinalCelebration(true);


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
image.display_order === level
)
||
null;

const currentLevel =
getStoryPuzzleLevel(
Math.min(level,10)
);







return (


<SceneLayout mode="twilight">


<Breadcrumb
label="Our Story Puzzle"
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

level={Math.min(level,10)}

totalScore={totalScore}

music={

<GameMusicPlayer
gameId={gameId}
/>

}

onReset={resetGame}

/>






{
showFinalCelebration ?

(

<div

className="
flex
flex-1
items-center
justify-center
px-6
"

>


<motion.div

initial={{
opacity:0,
scale:0.8
}}

animate={{
opacity:1,
scale:1
}}

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
text-6xl
mb-5
"
>

✨

</div>


<h1
className="
text-3xl
font-semibold
"
>

Final Memory Restored

</h1>


<p
className="
mt-4
text-white/70
"
>

You rebuilt all 10 chapters of our story ❤️

</p>



<div
className="
mt-6
rounded-xl
bg-white/5
p-4
"
>


<p
className="
text-xl
"
>

🧩 10 Memories

</p>


<p
className="
mt-2
text-sm
text-white/60
"
>

10 moments • 1 beautiful journey

</p>


</div>



<button

onClick={()=>{

setShowFinalCelebration(false);

setCompleted(true);

}}

className="
mt-6
w-full
rounded-xl
bg-purple-700
py-3
text-white
"

>

Reveal Gift 🎁

</button>


</motion.div>


</div>


)

:

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

🧩 Our Story Puzzle

</h1>







{

loading &&

<p
className="
text-center
text-white/60
"
>

Loading memories...

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

No puzzle memories added yet ❤️

</p>

}

{
!loading
&&
images.length>0
&&
!currentImage
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

🧩❤️

</div>


<h2
className="
text-2xl
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

This chapter of our story is coming soon ❤️

</p>


</div>

}



{
!loading
&&
currentImage
&&

<PuzzleBoard

image={
currentImage
}

gridSize={
currentLevel.gridSize
}

points={
currentLevel.points
}

onComplete={
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