import {
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
useState(-180);



const [
power,
setPower
]
=
useState(0);





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



setPower(
Math.min(
distance,
150
)
);



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



if(power < 20)
return;

if(angle > -10 && angle < 170)
return;

navigator.vibrate?.(30);

onShoot(

angle,

power

);



setPower(0);



}





return (


<div


className="

absolute

bottom-8

left-1/2

z-30

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


>



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
"
>

Power:
{
Math.round(power)
}

</div>

}


</div>




);


}