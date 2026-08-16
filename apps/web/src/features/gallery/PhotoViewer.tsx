/**
 * PhotoViewer
 *
 * Mobile-first fullscreen gallery viewer.
 *
 * Features:
 * - Cloudinary images
 * - Swipe navigation
 * - Double tap zoom
 * - Smooth image loading
 * - Safe area support
 * - Romantic fullscreen experience
 */


import {
  useState
} from "react";


import {
  AnimatePresence,
  motion
} from "framer-motion";


import {
  EASE_OUT
} from "@/animations/motionPrimitives";


import type {
  GalleryPhoto
} from "./types";



interface PhotoViewerProps {

  photos: GalleryPhoto[];

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
 onNavigate,

}:PhotoViewerProps
){



const photo =
photos[activeIndex];



const [zoom,setZoom] =
useState(false);



const [loaded,setLoaded] =
useState(false);



const [closingBlocked,setClosingBlocked] =
useState(false);




if(!photo)
return null;





function handleDragStart(){

setClosingBlocked(true);

}



function handleDragEnd(
_:unknown,
info:{
 offset:{
  x:number
 }
}
){


setTimeout(
()=>setClosingBlocked(false),
200
);



if(
info.offset.x >
SWIPE_THRESHOLD
&&
activeIndex > 0
){

onNavigate(
activeIndex-1
);

}



if(
info.offset.x <
-SWIPE_THRESHOLD
&&
activeIndex <
photos.length-1
){

onNavigate(
activeIndex+1
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
backdrop-blur-lg
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


onClick={()=>{
if(!closingBlocked){
onClose();
}
}}


>




<motion.div


key={photo.id}



drag="x"



dragConstraints={{
left:0,
right:0
}}



onDragStart={handleDragStart}



onDragEnd={handleDragEnd}



onClick={
e=>e.stopPropagation()
}



initial={{
opacity:0,
scale:0.9
}}



animate={{
opacity:1,
scale:1
}}



exit={{
opacity:0,
scale:0.9
}}



transition={{
duration:0.35,
ease:EASE_OUT
}}



className="
relative
flex
max-h-[70vh]
w-full
max-w-sm
items-center
justify-center
overflow-hidden
rounded-2xl
shadow-2xl
sm:max-w-lg
"




>


{
!loaded &&

<div

className="
absolute
inset-0
flex
items-center
justify-center
text-4xl
"

>

📸

</div>

}



<img


src={photo.url}



alt={
photo.alt_text ??
photo.title ??
"Gallery memory"
}



loading="lazy"



onLoad={()=>
setLoaded(true)
}



onDoubleClick={()=>
setZoom(
value=>!value
)
}



className={

`
max-h-[70vh]
w-full
rounded-2xl
object-contain
transition-transform
duration-300

${
zoom
?
"scale-150"
:
"scale-100"
}

`

}



/>



</motion.div>





{/* Caption */}


<div


className="
mt-6
max-w-sm
rounded-xl
bg-white/10
px-5
py-3
text-center
backdrop-blur-md
"

>


<p

className="
text-sm
leading-relaxed
text-white
"

>

{
photo.caption ??
"Beautiful memory ❤️"
}


</p>



{
photo.title &&


<p

className="
mt-2
text-xs
text-white/50
"

>

{photo.title}

</p>

}



</div>






{/* Dots */}



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



aria-label="Close photo viewer"



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