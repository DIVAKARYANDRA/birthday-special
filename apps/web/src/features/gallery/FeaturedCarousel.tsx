import { motion } from "framer-motion";

import type { GalleryPhoto } from "./types";


interface FeaturedCarouselProps {

  photos: GalleryPhoto[];

}



export default function FeaturedCarousel(
{
  photos

}: FeaturedCarouselProps
){


if(!photos.length)
return null;



return (

<section
className="
mt-8
mb-10
"
>


<h2
className="
mb-4
text-xl
font-semibold
text-white
"
>

⭐ Featured Memories

</h2>



<div

className="
flex
gap-5
overflow-x-auto
snap-x
snap-mandatory
pb-4
scroll-smooth
"

>


{
photos.map(
(photo)=>(


<motion.div


key={photo.id}


whileTap={{
scale:0.97
}}


className="
relative
h-72
min-w-[260px]
snap-center
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



{/* gradient */}

<div

className="
absolute
inset-x-0
bottom-0
bg-gradient-to-t
from-black/80
via-black/30
to-transparent
p-5
"

>


<h3

className="
text-white
font-medium
"

>

{
photo.title ??
"Beautiful memory"
}

</h3>


<p

className="
mt-1
text-sm
text-white/70
"

>

{
photo.caption
}

</p>


</div>



</motion.div>


)

)

}


</div>


</section>

);

}