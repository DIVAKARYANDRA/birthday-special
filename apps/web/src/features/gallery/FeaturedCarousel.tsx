import { useState } from "react";
import { motion } from "framer-motion";

import type { GalleryPhoto } from "./types";


interface FeaturedCarouselProps {

  photos: GalleryPhoto[];

  onOpen:(index:number)=>void;

}



export default function FeaturedCarousel(
{
 photos,
 onOpen

}:FeaturedCarouselProps
){


const [paused,setPaused] =
useState(false);



if(!photos.length)
return null;



/*
 Infinite loop:
 Duplicate photos so animation can continue forever
 without visible jump.
*/

const carouselPhotos = [
  ...photos,
  ...photos,
];



return (

<section
className="
mt-8
mb-12
overflow-hidden
"
>


<h2

className="
mb-5
text-xl
font-semibold
text-white
"

>

⭐ Featured Memories

</h2>




<div

className="
relative
w-full
overflow-hidden
"

>


<motion.div


className="
flex
gap-5
w-max
"


animate={

paused
?
{
x:0
}
:
{
x:[
"0%",
"-50%"
]
}

}


transition={

paused
?
{
duration:0
}
:
{
duration:25,
ease:"linear",
repeat:Infinity
}

}



onTouchStart={()=>
setPaused(true)
}


onTouchEnd={()=>
setPaused(false)
}


onMouseEnter={()=>
setPaused(true)
}


onMouseLeave={()=>
setPaused(false)
}


>



{
carouselPhotos.map(
(photo,index)=>(


<motion.div


key={`${photo.id}-${index}`}


whileTap={{
scale:0.96
}}


onClick={()=>{

const realIndex =
index % photos.length;

onOpen(realIndex);

}}



className="
relative
h-64
w-56
sm:h-72
sm:w-64
shrink-0
cursor-pointer
overflow-hidden
rounded-2xl
shadow-2xl
"

>


<img

src={photo.url}

alt={
photo.alt_text ??
"Featured memory"
}


loading="lazy"


className="
h-full
w-full
object-cover
"

 />



<div

className="
absolute
bottom-0
left-0
right-0
bg-gradient-to-t
from-black/80
to-transparent
p-4
"

>


<p

className="
text-sm
font-medium
text-white
"

>

{
photo.title ??
"Beautiful memory"
}

</p>


</div>



</motion.div>


)

)

}


</motion.div>


</div>


</section>

);

}