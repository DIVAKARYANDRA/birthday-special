import {
  useEffect,
  useState,
} from "react";

import {
  motion,
} from "framer-motion";

import MemoryCard from "./MemoryCard";

import type {
  MemoryCard as MemoryCardType,
  MemoryImage,
} from "./types";



interface MemoryMatchBoardProps {


  images:MemoryImage[];


  pairs:number;


  pointsPerMatch:number;


  onLevelComplete:(score:number)=>void;


}





function shuffle<T>(
array:T[]
):T[]{

return [
...array
]
.sort(
()=>Math.random()-0.5
);

}



function createCards(
images:MemoryImage[],
pairs:number
):MemoryCardType[]{


const selected =
shuffle(images)
.slice(
0,
pairs
);


const duplicated =
selected.flatMap(
(image)=>
[

{
id:`${image.id}-1`,
imageId:image.id,
imageUrl:image.url,
title:image.title ?? "Beautiful memory",
isFlipped:false,
isMatched:false,
},

{
id:`${image.id}-2`,
imageId:image.id,
imageUrl:image.url,
title:image.title ?? "Beautiful memory",
isFlipped:false,
isMatched:false,
}

]
);


return shuffle(
duplicated
);

}





export default function MemoryMatchBoard(
{
 images,
 pairs,
 pointsPerMatch,
 onLevelComplete

}:MemoryMatchBoardProps
){



const [
cards,
setCards
]
=
useState<MemoryCardType[]>([]);



const [
selectedCards,
setSelectedCards
]
=
useState<string[]>([]);



const [
score,
setScore
]
=
useState(0);



const [
locked,
setLocked
]
=
useState(false);


const [
levelReady,
setLevelReady
]
=
useState(true);

const [
levelCompleted,
setLevelCompleted
]
=
useState(false);


const [
completedScore,
setCompletedScore
]
=
useState(0);


useEffect(()=>{


if(images.length < pairs){

setCards([]);

setLevelReady(false);

return;

}


setLevelReady(true);


setCards(
createCards(
images,
pairs
)
);


setSelectedCards([]);

setScore(0);


},[
images,
pairs
]);





function handleFlip(
id:string
){



if(locked)
return;



const current =
cards.find(
card =>
card.id===id
);



if(!current)
return;




setCards(
previous=>

previous.map(
card=>

card.id===id

?

{
...card,
isFlipped:true
}

:

card

)

);



const updatedSelected = [

...selectedCards,

id

];



setSelectedCards(
updatedSelected
);





if(
updatedSelected.length===2
){


checkMatch(
updatedSelected
);


}


}







function checkMatch(
selected:string[]
){


const first =
cards.find(
card =>
card.id===selected[0]
);



const second =
cards.find(
card =>
card.id===selected[1]
);



if(
!first ||
!second
)
return;





setLocked(true);






if(
first.imageId===
second.imageId
){



const newScore =
score+
pointsPerMatch;



setCards(

previous=>

previous.map(
card=>

card.imageId===
first.imageId

?

{
...card,
isMatched:true
}

:

card

)

);



setScore(
newScore
);



setSelectedCards([]);



setLocked(false);





const matched =
cards.filter(
card=>
card.isMatched
||
card.imageId===
first.imageId
)
.length/2;



if(
matched>=pairs
){

setTimeout(()=>{

setCompletedScore(
newScore
);

setLevelCompleted(true);

},800);

}



}

else{



setTimeout(()=>{


setCards(

previous=>

previous.map(
card=>

selected.includes(card.id)

?

{
...card,
isFlipped:false
}

:

card

)

);



setSelectedCards([]);

setLocked(false);


},900);



}



}



function handleNextLevel(){

setLevelCompleted(false);

onLevelComplete(
completedScore
);

}



return (

<div

className="
w-full
"

>

{

levelCompleted && (

<motion.div

initial={{
opacity:0,
scale:0.8
}}

animate={{
opacity:1,
scale:1
}}

transition={{
duration:0.4
}}

className="
mb-8
rounded-3xl
bg-white/10
p-8
text-center
text-white
backdrop-blur-md
"

>


<div className="
text-6xl
mb-4
">

🎉

</div>



<h2 className="
text-2xl
font-semibold
">

Level Complete ❤️

</h2>



<p className="
mt-3
text-white/70
">

You found all memories!

</p>



<p className="
mt-4
text-3xl
font-bold
">

{completedScore} ❤️

</p>



<button

onClick={
handleNextLevel
}

className="
mt-6
w-full
rounded-xl
bg-purple-700
py-3
text-white
active:scale-95
"

>

Next Level ✨

</button>



</motion.div>

)

}

{
!levelReady && (

<div
className="
rounded-xl
bg-white/10
p-6
text-center
text-white
"
>

<h2 className="
text-xl
font-semibold
">

More memories needed ❤️

</h2>


<p className="
mt-2
text-sm
text-white/70
">

This level needs {pairs} memories.

<br/>

Currently available:
{images.length}

<br/>

Add {pairs-images.length} more photos from Admin.

</p>


</div>

)

}

{
levelReady &&
!levelCompleted && (
<motion.div

initial={{

opacity:0

}}


animate={{

opacity:1

}}


className="
grid
grid-cols-2
gap-4
sm:grid-cols-4
place-items-center
"

>



{

cards.map(
card=>(


<MemoryCard


key={
card.id
}


card={
card
}


disabled={
locked
}


onFlip={
handleFlip
}



/>


)

)


}



</motion.div>
)
}








</div>


);

}