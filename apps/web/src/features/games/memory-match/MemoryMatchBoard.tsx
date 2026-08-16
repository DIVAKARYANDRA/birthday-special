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

id:
`${image.id}-1`,

imageId:
image.id,

imageUrl:
image.url,

title:
image.title ??
"Beautiful memory",

isFlipped:false,

isMatched:false,

},


{

id:
`${image.id}-2`,

imageId:
image.id,

imageUrl:
image.url,

title:
image.title ??
"Beautiful memory",

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






useEffect(()=>{


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

onLevelComplete(
newScore
);

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







return (


<div

className="
w-full
"

>



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





<div

className="
mt-6
text-center
text-white
"

>


<p

className="
text-sm
text-white/60
"

>

Current Score

</p>


<p

className="
text-3xl
font-semibold
"

>

{score} ❤️

</p>


</div>





</div>


);

}