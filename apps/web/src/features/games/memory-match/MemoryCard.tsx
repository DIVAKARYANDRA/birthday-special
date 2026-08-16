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


onFlip(
card.id
);


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


animate={{

scale:
card.isMatched
?
1.05
:
1

}}



whileTap={{

scale:
0.92

}}


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

duration:
0.45

}}



>



{/* FRONT - Hidden Card */}


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
to-pink-600
text-3xl
shadow-lg
"

style={{

backfaceVisibility:
"hidden"

}}

>


❤️


</div>





{/* BACK - Photo */}


<div


className="
absolute
inset-0
overflow-hidden
rounded-2xl
border
border-white/30
bg-white
shadow-lg
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


<div


className="
absolute
inset-0
flex
items-center
justify-center
bg-black/20
text-3xl
"

>

✨

</div>


}



</div>





</motion.div>



</motion.button>


);

}