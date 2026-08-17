import {
  motion,
} from "framer-motion";


import type {
  CupidArrowTarget,
} from "./cupidArrowTypes";



interface CupidTargetProps {

  target:CupidArrowTarget;

}



export default function CupidTarget(
{
 target

}:CupidTargetProps
){



const isHit =
target.status==="hit";


const isBroken =
target.status==="broken";





return (

<motion.div


initial={{
  scale:1
}}


animate={


isBroken

?

{

scale:[1,1.4,0],

rotate:[0,30,-30,90],

opacity:[1,1,0]

}


:

isHit

?

{

scale:[1,1.35,1],

rotate:[0,15,-15,0]

}


:

{

y:[0,-5,0],

scale:[1,1.05,1]

}


}




transition={


isBroken || isHit

?

{

duration:0.5

}


:

{

duration:2,

repeat:Infinity,

ease:"easeInOut"

}

}




style={{


position:"absolute",


left:`${target.x}%`,


top:`${target.y}%`,


width:`${target.size}%`,


height:`${target.size}%`,


transform:
"translate(-50%,-50%)",


zIndex:20


}}



className="
flex
items-center
justify-center
overflow-hidden
select-none
"

>



{
target.type==="emoji"

&&

<span

className="
text-5xl
drop-shadow-xl
"

>

{target.emoji}

</span>

}




{
target.type==="image"

&&

target.media

&&


<img

src={
target.media.url
}

alt={
target.media.alt_text ??
"Cupid target"
}


className="
h-full
w-full
rounded-full
object-cover
shadow-2xl
ring-4
ring-white/50
"

/>

}



{
target.type==="image"
&&
!target.media

&&

<span

className="
text-4xl
"

>

❤️

</span>

}





{
isHit

&&

<motion.span

initial={{
scale:0,
opacity:0
}}

animate={{

scale:[0,1.5,1],

opacity:[0,1,0]

}}

transition={{
duration:0.6
}}

className="
absolute
text-4xl
"

>

✨

</motion.span>

}





{
isBroken

&&

<motion.span


initial={{
scale:0
}}

animate={{
scale:[0,1.5,0]
}}

transition={{
duration:0.5
}}

className="
absolute
text-4xl
"

>

💥

</motion.span>

}




</motion.div>

);


}