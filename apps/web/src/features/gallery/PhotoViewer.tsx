/**
 * PhotoViewer
 *
 * Full-screen mobile-first photo viewer.
 * Supports:
 * - Cloudinary images
 * - swipe navigation
 * - fullscreen focus mode
 * - touch gestures
 */


import { AnimatePresence, motion } from "framer-motion";

import {
  EASE_OUT
} from "@/animations/motionPrimitives";


import type {
  GalleryPhoto
} from "./types";



interface PhotoViewerProps {

  photos:GalleryPhoto[];

  activeIndex:number;

  onClose:()=>void;

  onNavigate:(index:number)=>void;

}



const SWIPE_THRESHOLD = 60;



export default function PhotoViewer(
{
 photos,
 activeIndex,
 onClose,
 onNavigate

}:PhotoViewerProps
){



const photo =
photos[activeIndex];



if(!photo)
return null;





function handleDragEnd(
_:unknown,
info:{
 offset:{
  x:number
 }
}
){


if(
 info.offset.x >
 SWIPE_THRESHOLD
 &&
 activeIndex > 0
){

onNavigate(
 activeIndex - 1
);

}



else if(

info.offset.x <
-SWIPE_THRESHOLD
&&
activeIndex <
photos.length-1

){

onNavigate(
 activeIndex + 1
);

}


}





return (


<AnimatePresence>


<motion.div


className="
fixed
inset-0
z-50
flex
flex-col
items-center
justify-center
bg-black/90
backdrop-blur-md
px-4
"


initial={{
opacity:0
}}


animate={{
opacity:1
}}


exit={{
opacity:0
}}


onClick={onClose}


>



<motion.div


key={photo.id}


drag="x"


dragConstraints={{
left:0,
right:0
}}


onDragEnd={
handleDragEnd
}


onClick={
e=>e.stopPropagation()
}



initial={{
opacity:0,
scale:0.92
}}


animate={{
opacity:1,
scale:1
}}


exit={{
opacity:0,
scale:0.92
}}


transition={{
duration:0.35,
ease:EASE_OUT
}}



className="
relative
flex
items-center
justify-center
overflow-hidden
rounded-xl
bg-white
shadow-2xl
w-full
max-w-sm
aspect-square
sm:max-w-lg
"



>



<img


src={
photo.url
}


alt={

photo.alt_text ??
photo.title ??
"Gallery photo"

}



loading="lazy"



className="
h-full
w-full
object-cover
"




/>



</motion.div>





<p


className="
mt-6
max-w-sm
px-6
text-center
text-sm
leading-relaxed
text-white/80
"

>


{
photo.caption
}



</p>





{/* pagination dots */}

<div

className="
mt-5
flex
gap-2
"

>

{

photos.map(
(p,index)=>(


<span


key={p.id}


className={

`
h-2
w-2
rounded-full
${
index===activeIndex
?
"bg-white"
:
"bg-white/30"
}
`

}


/>


)

)


}


</div>





<button


onClick={onClose}


aria-label="
Close photo viewer
"


className="
absolute
right-4
flex
h-11
w-11
items-center
justify-center
rounded-full
bg-white/10
text-xl
text-white
active:scale-90
"


style={{

top:
"calc(1rem + env(safe-area-inset-top))"

}}


>

✕

</button>



</motion.div>


</AnimatePresence>


);


}