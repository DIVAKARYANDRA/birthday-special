import {
  useRef,
  useState,
} from "react";

import {
  motion,
} from "framer-motion";



interface CupidArrowProps {


  onShoot:(
    angle:number,
    power:number
  )=>void;


}





export default function CupidArrow(
{
 onShoot

}:CupidArrowProps
){



const [
dragging,
setDragging
]
=
useState(false);



const [
angle,
setAngle
]
=
useState(-90);



const [
power,
setPower
]
=
useState(0);



const powerRef =
useRef(0);

function calculateAim(
event:React.PointerEvent<HTMLDivElement>
){


const rect =
event.currentTarget.getBoundingClientRect();



const centerX =
rect.left +
rect.width / 2;


const centerY =
rect.top +
rect.height / 2;




const dx =
event.clientX - centerX;



const dy =
event.clientY - centerY;




const radians =
Math.atan2(
dy,
dx
);



const degrees =
radians *
(180 / Math.PI);



setAngle(
degrees
);





const distance =
Math.sqrt(
dx * dx +
dy * dy
);


const calculatedPower =
Math.min(
distance,
150
);


setPower(
calculatedPower
);


powerRef.current =
calculatedPower;



}








function handlePointerDown(
event:React.PointerEvent<HTMLDivElement>
){


setDragging(true);


event.currentTarget.setPointerCapture(
event.pointerId
);



calculateAim(
event
);


}






function handlePointerMove(
event:React.PointerEvent<HTMLDivElement>
){


if(!dragging)
return;


calculateAim(
event
);


}






function handlePointerUp(){


if(!dragging)
return;


setDragging(false);




if(powerRef.current < 20)
return;



if(
angle > -10 &&
angle < 170
)
return;




navigator.vibrate?.(
30
);



onShoot(

angle,

powerRef.current

);



setPower(0);



}






function getTrajectoryPoints(){


const points=[];


const speed =
power / 6;



const radians =
angle *
(Math.PI / 180);



let x=50;

let y=85;



let velocityX =
Math.cos(radians)
*
speed;



let velocityY =
Math.sin(radians)
*
speed
*
-1;



for(
let i=1;
i<=8;
i++
){


x += velocityX * 2;


y += velocityY * 2;


velocityY +=0.15;



points.push({

x,

y

});


}



return points;


}








return (


<div


className="

absolute

bottom-8

left-1/2

z-40

touch-none

"

style={{

transform:
"translateX(-50%)"

}}



onPointerDown={
handlePointerDown
}


onPointerMove={
handlePointerMove
}


onPointerUp={
handlePointerUp
}


onPointerCancel={
handlePointerUp
}



>





{
dragging &&

<>

{
getTrajectoryPoints().map(
(point,index)=>(


<div

key={index}

className="

absolute

h-3

w-3

rounded-full

bg-white/70

"

style={{


left:
`${point.x - 50}%`,


top:
`${point.y - 85}%`


}}


>


</div>


)

)

}

</>

}







<motion.div



animate={{


rotate:
angle + 90,



scale:

dragging

?

1.25

:

1



}}



transition={{

duration:0.1

}}



className="

cursor-pointer

select-none

text-6xl

"

>


🏹


</motion.div>







{
dragging &&

<div

className="

absolute

left-1/2

top-1/2

h-40

w-1

origin-bottom

bg-white/50

"

style={{


transform:

`rotate(${angle}deg)`


}}


/>


}








{
dragging &&

<div

className="

absolute

top-20

left-1/2

-translate-x-1/2

text-white

text-sm

bg-black/40

px-3

py-1

rounded-lg

"

>


Power:

{
Math.round(
power
)
}



</div>

}








{
dragging &&

<div

className="

absolute

top-28

left-1/2

-translate-x-1/2

w-32

h-2

bg-white/30

rounded-full

overflow-hidden

"

>


<div


className="

h-full

bg-white

"

style={{

width:
`${Math.min(
(power/150)*100,
100
)}%`

}}


/>



</div>

}




</div>



);


}