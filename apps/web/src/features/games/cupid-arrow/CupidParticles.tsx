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
(particle)=>{


const angle =
Math.random() * 360;


const distance =
40 + Math.random() * 50;



const endX =
Math.cos(
angle * Math.PI / 180
)
*
distance;



const endY =
Math.sin(
angle * Math.PI / 180
)
*
distance;



return (


<motion.span


key={
particle.id
}



initial={{

opacity:0,

scale:0.2,

x:0,

y:0,

rotate:0

}}



animate={{


opacity:[0,1,0],


scale:[

0.2,

1.4,

0.8

],


x:[

0,

endX

],


y:[

0,

endY

],


rotate:[

0,

360

]


}}



transition={{


duration:
particle.lifetime,


ease:"easeOut"


}}



style={{


position:"absolute",


left:`${particle.x}%`,


top:`${particle.y}%`,


zIndex:60,


pointerEvents:"none"


}}



className="

text-3xl

select-none

drop-shadow-xl

"


>


{
particle.emoji
}


</motion.span>


);


}

)

}

</>

);


}