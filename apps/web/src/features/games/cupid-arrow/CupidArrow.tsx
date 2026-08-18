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
shooting,
setShooting
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



const [
aimVector,
setAimVector
]
=
useState({

x:0,

y:-1

});





function calculateAim(
event:React.PointerEvent<HTMLDivElement>
){


const board =
event.currentTarget.parentElement
?.getBoundingClientRect();



if(!board)
return;



const shooterX =
board.left +
(board.width * 0.5);



const shooterY =
board.top +
(board.height * 0.85);



const dx =
event.clientX -
shooterX;



// convert screen Y to game Y
const dy =
shooterY -
event.clientY;



const distance =
Math.sqrt(
dx * dx +
dy * dy
);



if(distance===0)
return;



const normalizedX =
dx / distance;



const normalizedY =
dy / distance;



setAimVector({

x:normalizedX,

y:normalizedY

});





// IMPORTANT:
// CSS rotation uses screen coordinates
const visualAngle =
Math.atan2(
-dy,
dx
)
*
(180/Math.PI);



setAngle(
visualAngle
);




setPower(

Math.min(

distance / 2,

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



navigator.vibrate?.(30);



setShooting(true);



setTimeout(()=>{

setShooting(false);

},200);



onShoot(

angle,

power

);



setPower(0);



}








function getTrajectoryPoints(){


const points=[];



const speed =
power / 10;



let x=50;

let y=85;



let velocityX =
aimVector.x *
speed;



let velocityY =
aimVector.y *
speed;




for(
let i=1;
i<=20;
i++
){


x += velocityX * 1.5;



// game coordinates
y -= velocityY * 1.5;



// gravity pulls downward
velocityY -=0.15;



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
left-1/2
top-[85%]
z-40
touch-none
"

style={{

transform:
"translate(-50%,-50%)"

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

getTrajectoryPoints().map(

(point,index)=>(


<div

key={index}

className="
absolute
h-2
w-2
rounded-full
bg-white/80
"

style={{

left:`${point.x}%`,

top:`${point.y}%`

}}


/>


)

)

}






<motion.div


animate={{


rotate:
angle,


scale:

shooting

?

0.8

:

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
top-20
left-1/2
-translate-x-1/2
rounded-lg
bg-black/50
px-3
py-1
text-sm
text-white
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