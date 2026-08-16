import {
  useEffect,
  useState,
} from "react";

import { motion } from "framer-motion";

import type {
  PuzzleImage,
  PuzzlePiece,
} from "./types";



interface PuzzleBoardProps {

  image:PuzzleImage;

  gridSize:number;

  onComplete:(score:number)=>void;

  points:number;

}




function createPieces(
image:PuzzleImage,
gridSize:number
):PuzzlePiece[]{


const total =
gridSize * gridSize;


return Array.from(
{
length:total
},
(_,index)=>(

{
id:`${image.id}-${index}`,

imageId:image.id,

position:index,

currentPosition:index,

imageUrl:image.url

}

)

);

}


function shufflePieces(
pieces:PuzzlePiece[]
){

const shuffled =
[...pieces];


do {

for(
let i=shuffled.length-1;
i>0;
i--
){

const j =
Math.floor(
Math.random()*(i+1)
);


[
shuffled[i],
shuffled[j]
]
=
[
shuffled[j],
shuffled[i]
];

}


}
while(
shuffled.every(
(piece,index)=>
piece.position===index
)
);



return shuffled.map(
(piece,index)=>({

...piece,

currentPosition:index

})

);

}

export default function PuzzleBoard(
{
 image,
 gridSize,
 onComplete,
 points

}:PuzzleBoardProps
){



const [
pieces,
setPieces
]
=
useState<PuzzlePiece[]>([]);



const [
selected,
setSelected
]
=
useState<number|null>(null);



const [
completed,
setCompleted
]
=
useState(false);


const [
showSuccess,
setShowSuccess
]
=
useState(false);

const [
showMemory,
setShowMemory
]
=
useState(false);

const [
started,
setStarted
]
=
useState(false);

useEffect(()=>{


const generated =
createPieces(
image,
gridSize
);


setPieces(
shufflePieces(
generated
)
);
setSelected(null);

setCompleted(false);

setShowSuccess(false);

setShowMemory(false);

setStarted(false);


},[
image,
gridSize
]);







function handleSelect(
index:number
){


if(completed)
return;



if(selected===null){

setSelected(index);

return;

}




if(selected===index){

setSelected(null);

return;

}



swapPieces(
selected,
index
);


setSelected(null);


}






function swapPieces(
first:number,
second:number
){


setPieces(
previous=>{


const updated =
[...previous];


const firstPiece =
updated[first];


const secondPiece =
updated[second];



updated[first]=
{
...secondPiece,
currentPosition:first
};


updated[second]=
{
...firstPiece,
currentPosition:second
};



checkComplete(updated);



return updated;


}
);


}







function checkComplete(
current:PuzzlePiece[]
){


const solved =
current.every(
(piece,index)=>
piece.position===index
);



if(solved){

setCompleted(true);

setTimeout(()=>{

setShowSuccess(true);

},500);

}


}







return (


<div
className="w-full"
>

{
showSuccess && (

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
mb-6
rounded-3xl
bg-white/10
p-6
text-center
text-white
backdrop-blur-md
"

>

<div
className="
text-5xl
mb-3
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

Memory Restored

</h2>


<p
className="
mt-2
text-white/70
"
>

You rebuilt this special moment

</p>


<p
className="
mt-4
text-3xl
font-bold
"
>

+{points} ❤️

</p>



<button

onClick={()=>{

setShowMemory(true);

}}

className="
mt-5
w-full
rounded-xl
bg-purple-700
py-3
text-white
active:scale-95
"

>

Reveal Memory ❤️

</button>

{
showMemory && (

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
mt-6
rounded-3xl
bg-white/10
p-6
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

❤️

</div>


<h2
className="
text-2xl
font-semibold
"
>

Your Memory ❤️

</h2>


<img

src={image.url}

alt={image.title ?? "Memory"}

className="
mt-5
mx-auto
rounded-2xl
shadow-xl
"

/>


<p

className="
mt-4
text-sm
text-white/70
"

>

A beautiful moment brought back to life ❤️

</p>



<button

onClick={()=>{

onComplete(points);

}}

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

Continue Journey ✨

</button>


</motion.div>

)

}

</motion.div>

)
}

{
!started &&
(

<motion.div

initial={{
opacity:0,
scale:0.9
}}

animate={{
opacity:1,
scale:1
}}

className="
rounded-3xl
bg-white/10
p-6
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
❤️
</div>


<h2
className="
text-2xl
font-semibold
"
>

Today's Memory

</h2>


<img

src={image.url}

alt={
image.title ?? "Memory"
}

className="
mt-5
mx-auto
rounded-2xl
max-h-64
object-cover
shadow-xl
"

/>


<p

className="
mt-4
text-sm
text-white/70
"

>

Can you rebuild this beautiful moment?

</p>


<button

onClick={()=>setStarted(true)}

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

Start Puzzle ✨

</button>


</motion.div>

)

}

{
!showSuccess &&
started &&

<div

className="
grid
gap-1
"

style={{

gridTemplateColumns:
`repeat(${gridSize},1fr)`

}}

>


{

pieces.map(
(piece,index)=>(


<motion.button


key={piece.id}


whileTap={{
scale:0.95
}}


onClick={()=>handleSelect(index)}



className={`
aspect-square
overflow-hidden
border
rounded-md

${
selected===index
?
"ring-4 ring-purple-400"
:
""
}

`}


style={{


backgroundImage:
`url(${piece.imageUrl})`,


backgroundSize:
`${gridSize*100}% ${gridSize*100}%`,


backgroundPosition:
`
${
(piece.position % gridSize)
*
100/
(gridSize-1)
}%

${
Math.floor(piece.position/gridSize)
*
100/
(gridSize-1)
}%

`

}}



>


</motion.button>


)

)

}



</div>


}


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

Rebuild this memory ❤️

</p>


<p
className="
mt-2
text-xl
font-semibold
"
>

{gridSize} x {gridSize} Puzzle

</p>


</div>




</div>

);

}