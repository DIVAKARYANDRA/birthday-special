import { useState } from "react";
import { motion } from "framer-motion";

import { floatLoop } from "@/animations/motionPrimitives";
import { useReducedMotion } from "@/hooks/useReducedMotion";

import type { GalleryPhoto } from "./types";

interface FloatingPolaroidProps {
  photo: GalleryPhoto;
  onOpen: () => void;
}


export default function FloatingPolaroid(
{
 photo,
 onOpen

}:FloatingPolaroidProps
){


const [flipped,setFlipped]=
useState(false);
const [imageError,setImageError]=useState(false);
const [dragging,setDragging]=useState(false);

const reducedMotion =
useReducedMotion();



return (

<motion.div

className="
relative
h-52
w-40
sm:h-64
sm:w-52
shrink-0
cursor-pointer
"


style={{
rotate:photo.rotationDeg
}}


drag

dragElastic={0.5}


dragConstraints={{
top:0,
left:0,
right:0,
bottom:0
}}


onDragStart={()=>
setDragging(true)
}


onDragEnd={()=>
setTimeout(
()=>setDragging(false),
100
)
}


whileTap={{
scale:1.05
}}


variants={
!reducedMotion
? floatLoop
: undefined
}


animate={
!reducedMotion
?"animate"
:undefined
}

>



<motion.div


className="
relative
h-full
w-full
"

style={{
transformStyle:"preserve-3d"
}}


animate={{
rotateY:
flipped
?180
:0
}}


transition={{
duration:0.5
}}


onClick={()=>{
if(!dragging){
 setFlipped(
 value=>!value
 );
}
}}


>


{/* FRONT */}
{
imageError ? (

<div
className="
flex
h-full
w-full
items-center
justify-center
bg-purple-100
text-4xl
"
>
📸
</div>

)

:

<img

src={photo.url}

alt={
photo.alt_text ??
photo.title ??
"Memory"
}

loading="lazy"

onError={()=>
setImageError(true)
}

className="
h-full
w-full
object-cover
rounded-sm
"

/>

}



{/* BACK */}

<div


className="
absolute
inset-0
flex
items-center
justify-center
rounded-sm
border-4
border-white
bg-[#3a2456]
p-4
text-center
shadow-xl
"


style={{

backfaceVisibility:
"hidden",

transform:
"rotateY(180deg)"

}}

>


<p
className="
text-xs
leading-relaxed
text-white
"
>

{
photo.caption
}

</p>


</div>


</motion.div>





<button


onClick={(e)=>{

e.stopPropagation();

if(!dragging){
  onOpen();
}

}}


aria-label="
View full photo
"


className="
absolute
-bottom-3
-right-3
flex
h-9
w-9
items-center
justify-center
rounded-full
bg-purple-700
text-white
shadow-md
active:scale-90
"

>

🔍

</button>



</motion.div>

);

}