import { motion } from "framer-motion";

import type {
  HiddenObjectTarget,
} from "./types";



interface HiddenObjectMarkerProps {


  target:HiddenObjectTarget;


  onFound:(
    id:string
  )=>void;


}




export default function HiddenObjectMarker(
{
 target,
 onFound

}:HiddenObjectMarkerProps
){



function handleClick(){

if(target.found)
return;


onFound(
target.id
);


}




return (


<motion.button


type="button"


onClick={handleClick}



initial={{
opacity:0,
scale:0.5
}}



animate={

target.found

?

{
opacity:1,
scale:[1,1.3,1]
}

:

{
opacity:0,
scale:1
}

}



transition={{

duration:0.4

}}



style={{

position:"absolute",

left:`${target.x}%`,

top:`${target.y}%`,

width:`${target.radius}%`,

height:`${target.radius}%`,

transform:"translate(-50%,-50%)"

}}



className={`

flex

items-center

justify-center

rounded-full

${

target.found

?

"bg-white/20 backdrop-blur-md"

:

"bg-transparent"

}

`}



>


{

target.found &&

<span

className="
text-3xl
"

>

{target.emoji}

</span>

}



</motion.button>


);


}