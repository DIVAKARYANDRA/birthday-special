import {
  motion,
} from "framer-motion";


import type {
  CupidArrowTarget,
} from "./cupidArrowTypes";



interface CupidTargetProps {


  target:CupidArrowTarget;


  onHit:(id:string)=>void;


}




export default function CupidTarget(
{
 target,
 onHit

}:CupidTargetProps
){



function handleClick(){


if(target.status !== "idle")
return;


onHit(
target.id
);


}





const isHit =
target.status === "hit";


const isBroken =
target.status === "broken";





return (


<motion.button


type="button"


onClick={
handleClick
}




animate={


isBroken

?

{

scale:[1,1.5,0],

rotate:[0,45,-45,90],

opacity:[1,1,0]

}


:

isHit

?

{

scale:[1,1.3,1],

rotate:[0,15,-15,0]

}


:

{

scale:[1,1.05,1]

}


}




transition={{

duration:1,
repeat:Infinity

}}





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

cursor-crosshair

rounded-full
overflow-hidden
select-none

"


>


{


target.type === "emoji"

&&


<span

className="

text-5xl

drop-shadow-xl

"

>

{

target.emoji

}

</span>


}


{
target.type === "image"

&&

target.media

&&

<img

src={
target.media.url
}


alt={
target.media.alt_text ?? "Cupid target"
}


className="

h-full

w-full

rounded-full

object-cover

shadow-xl

"

/>

}


{
target.type === "image"

&&

!target.media

&&

<span

className="text-4xl"

>

❤️

</span>

}



{


isBroken

&&


<motion.span

initial={{

scale:0,

opacity:0

}}


animate={{

scale:[0,1.5,1],

opacity:1

}}


className="

absolute

text-4xl

"

>

💥

</motion.span>


}





</motion.button>


);


}