import { motion } from "framer-motion";

import FloatingPolaroid from "./FloatingPolaroid";

import type {
  GalleryPhoto,
} from "./types";


interface MemoryWallProps {

  photos: GalleryPhoto[];

  onOpen:(index:number)=>void;

}



export default function MemoryWall(
{
 photos,
 onOpen

}:MemoryWallProps
){


return (

<motion.div

initial={{
opacity:0
}}

animate={{
opacity:1
}}


className="
grid
grid-cols-2
gap-6
sm:grid-cols-3
"

>


{
photos.map(
(photo,index)=>(


<div

key={photo.id}

className={

`
flex
justify-center

${
index % 3 === 0
?
"sm:translate-y-8"
:
""
}

${
index % 2 === 0
?
"translate-y-4"
:
""
}

`

}

>


<FloatingPolaroid

photo={photo}

onOpen={()=>
onOpen(index)
}

/>


</div>


)

)

}


</motion.div>

);

}