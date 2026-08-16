import { motion } from "framer-motion";

import type {
  MemoryCard as MemoryCardType,
} from "./types";


interface MemoryCardProps {

  card:MemoryCardType;

  onFlip:(id:string)=>void;

  disabled:boolean;

}



export default function MemoryCard(
{
 card,
 onFlip,
 disabled

}:MemoryCardProps
){


function handleClick(){

if(disabled)
return;


if(card.isFlipped)
return;


if(card.isMatched)
return;


onFlip(card.id);

}



return (

<motion.button

type="button"

onClick={handleClick}


className="
relative
aspect-square
w-full
max-w-[90px]
sm:max-w-[110px]
perspective
"

animate={

card.isMatched

?

{
scale:1.08
}

:

{
scale:1
}

}


whileTap={

!disabled
?
{
scale:0.92
}
:
undefined

}



>





<motion.div


className="
relative
h-full
w-full
"

style={{

transformStyle:
"preserve-3d"

}}



animate={{

rotateY:
card.isFlipped ||
card.isMatched
?
180
:
0

}}


transition={{

duration:0.5,

ease:"easeInOut"

}}



>



{/* FRONT */}

<div

className="
absolute
inset-0
flex
items-center
justify-center
rounded-2xl
border
border-white/20
bg-gradient-to-br
from-purple-700
via-pink-600
to-purple-800
text-3xl
shadow-xl
"

style={{

backfaceVisibility:
"hidden"

}}

>


❤️


</div>







{/* BACK */}


<div


className="
absolute
inset-0
overflow-hidden
rounded-2xl
border
border-white/30
bg-white
shadow-xl
"

style={{

backfaceVisibility:
"hidden",

transform:
"rotateY(180deg)"

}}



>


<img

src={
card.imageUrl
}


alt={
card.title
}


loading="lazy"


className="
h-full
w-full
object-cover
"

 />





{

card.isMatched &&


<motion.div


initial={{
opacity:0,
scale:0.5
}}


animate={{
opacity:1,
scale:1
}}


className="
absolute
inset-0
flex
items-center
justify-center
bg-black/20
text-4xl
"

>


✨


</motion.div>


}



</div>






</motion.div>




</motion.button>

);

}