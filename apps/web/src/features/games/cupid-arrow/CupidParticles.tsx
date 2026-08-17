import {
  motion,
} from "framer-motion";


import type {
  CupidParticle,
} from "./cupidArrowTypes";



interface CupidParticlesProps {


  particles:CupidParticle[];


}



export default function CupidParticles(
{
 particles

}:CupidParticlesProps
){



return (


<>

{

particles.map(
(particle)=>(


<motion.span


key={
particle.id
}



initial={{

opacity:1,

scale:0.5,

x:0,

y:0

}}

animate={{


opacity:[1,0],


scale:[0.5,1.8],

rotate:[
0,
360
]

x:[
0,
Math.random()*80-40
],


y:[
0,
Math.random()*80-40
]


}}


transition={{

duration:
particle.lifetime

}}



style={{


position:"absolute",


left:`${particle.x}%`,


top:`${particle.y}%`,

zIndex:50,

pointerEvents:"none"


}}



className="

text-3xl

select-none

"


>


{

particle.emoji

}


</motion.span>


)

)

}


</>

);


}