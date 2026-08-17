import {
  useEffect,
  useRef,
  useState,
} from "react";


import CupidArrow from "./CupidArrow";

import CupidTarget from "./CupidTarget";

import CupidParticles from "./CupidParticles";


import type {
  CupidArrowLevel,
  CupidArrowTarget,
  CupidParticle,
  CupidProjectile,
} from "./cupidArrowTypes";




interface CupidArrowBoardProps {

  levelData:CupidArrowLevel;

  onLevelComplete:(score:number)=>void;

}







export default function CupidArrowBoard(
{
 levelData,
 onLevelComplete

}:CupidArrowBoardProps
){



const [
targets,
setTargets
]
=
useState<CupidArrowTarget[]>(

(levelData.targets ?? []).map(
target=>({
...target,
status:
target.status ?? "idle"
})
)

);



/*
 Keeps latest targets for game loop
*/


const completedRef =
useRef(false);


const targetsRef =
useRef<CupidArrowTarget[]>([]);



const [
score,
setScore
]
=
useState(0);



const [
combo,
setCombo
]
=
useState(0);



const [
particles,
setParticles
]
=
useState<CupidParticle[]>([]);





const [
projectile,
setProjectile
]
=
useState<CupidProjectile|null>(null);



const frameRef =
useRef<number>();



useEffect(()=>{

setTargets(
(levelData.targets ?? []).map(
target=>({
...target,
status:
target.status ?? "idle"
})
)
);

setScore(0);

setCombo(0);

completedRef.current=false;


},[levelData]);

useEffect(()=>{


targetsRef.current =
targets;


},[targets]);










/*
 Target movement engine
*/

useEffect(()=>{


function moveTargets(){


setTargets(
previous=>


previous.map(
target=>{


let nextVelocity =
target.velocityX;



let nextX =
target.x + nextVelocity;



if(
nextX > 95 ||
nextX < 5
){


nextVelocity =
-nextVelocity;


nextX =
target.x + nextVelocity;


}




return {

...target,

x:nextX,

velocityX:nextVelocity

};



}

)

);



frameRef.current =
requestAnimationFrame(
moveTargets
);


}




frameRef.current =
requestAnimationFrame(
moveTargets
);




return ()=>{


if(frameRef.current){

cancelAnimationFrame(
frameRef.current
);

}


};


},[]);









/*
 Projectile movement engine
*/

useEffect(()=>{


if(!projectile?.active)
return;



const timer =
setInterval(()=>{



setProjectile(
previous=>{


if(!previous)
return null;




const next:CupidProjectile = {


...previous,


x:
previous.x +
previous.velocityX,


y:
previous.y +
previous.velocityY,


};




const hitTarget =
checkCollision(
next
);




if(hitTarget){


hit(
hitTarget.id
);


return null;


}






if(

next.x < 0 ||

next.x > 100 ||

next.y < 0 ||

next.y > 100

){


return null;


}




return next;



}

);


},16);




return ()=>{


clearInterval(
timer
);


};



},[projectile]);









function handleShoot(

angle:number,

power:number

){



if(projectile?.active)
return;





const radians =
angle *
(Math.PI / 180);




const speed =
power / 8;





setProjectile({

x:50,

y:85,


velocityX:

Math.cos(radians)
*
speed,



velocityY:

Math.sin(radians)
*
speed
*
-1,



active:true

});


}









function checkCollision(
arrow:CupidProjectile
){



const hitTarget =

targetsRef.current.find(

target=>{


const dx =
arrow.x -
target.x;



const dy =
arrow.y -
target.y;



const distance =
Math.sqrt(
dx * dx +
dy * dy
);



return (

distance <
target.size / 1.8

&&

target.status === "idle"

);


}

);



return hitTarget;


}









function hit(
id:string
){



const target =
targetsRef.current.find(
item=>
item.id===id
);



if(!target)
return;





const newScore =
score +
target.points +
(combo * 5);





setScore(
newScore
);




setCombo(
previous=>
previous + 1
);




createParticles(

target.x,

target.y

);






setTargets(
previous=>

previous.map(

item=>


item.id===id

?

{

...item,

status:"hit"

}

:

item


)

);







setTimeout(()=>{



setTargets(previous=>{


const updated =

previous.map(

item=>


item.id===id

?

{

...item,

status:"broken"

}

:

item


);



const remaining =

updated.filter(

item=>

item.status !== "broken"

);





if(
remaining.length === 0
&&
!completedRef.current
){


completedRef.current=true;



setTimeout(()=>{


onLevelComplete(
newScore
);


},800);


}




return updated;



});



},500);



}









function createParticles(
x:number,
y:number
){



setParticles([


{

id:
crypto.randomUUID(),

x,

y,

emoji:"💥",

lifetime:0.5

},


{

id:
crypto.randomUUID(),

x:x+5,

y:y-5,

emoji:"❤️",

lifetime:0.8

},


{

id:
crypto.randomUUID(),

x:x-5,

y:y+5,

emoji:"✨",

lifetime:0.8

}


]);





setTimeout(()=>{


setParticles([]);


},1000);



}









return (


<div

className="

relative

h-[600px]

overflow-hidden

rounded-3xl

bg-gradient-to-b

from-pink-200

to-purple-300

"

>





<div

className="

absolute

left-5

top-5

rounded-xl

bg-white/50

px-4

py-2

text-xl

"

>

❤️ {score}

</div>







{


targets.map(

target=>(



<CupidTarget


key={
target.id
}


target={
target
}



onHit={
hit
}


/>



)

)

}







{

projectile?.active &&



<div


className="

absolute

z-30

text-5xl

"


style={{


left:`${projectile.x}%`,


top:`${projectile.y}%`,


transform:
"translate(-50%,-50%)"


}}


>

🏹

</div>



}







<CupidParticles

particles={
particles
}

/>







<CupidArrow

onShoot={
handleShoot
}

/>






</div>


);


}