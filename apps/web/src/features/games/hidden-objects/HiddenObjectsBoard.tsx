import {
  useState,
  useEffect,
} from "react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";


import HiddenObjectMarker from "./HiddenObjectMarker";


import type {
  HiddenObjectTarget,
  HiddenObjectImage,
} from "./types";





interface HiddenObjectsBoardProps {


  image:HiddenObjectImage;


  targets:HiddenObjectTarget[];


  pointsPerObject:number;


  onLevelComplete:(score:number)=>void;


}







export default function HiddenObjectsBoard(
{

 image,

 targets,

 pointsPerObject,

 onLevelComplete


}:HiddenObjectsBoardProps
){



const [
objects,
setObjects
]
=
useState<HiddenObjectTarget[]>(
targets
);



const [
score,
setScore
]
=
useState(0);



const [
completed,
setCompleted
]
=
useState(false);


useEffect(()=>{

setObjects(
  targets
);

setScore(0);

setCompleted(false);


},[targets]);




function handleFound(
id:string
){



if(completed)
return;



const updated =
objects.map(
object=>

object.id===id

?

{
...object,
found:true
}

:

object

);



setObjects(
updated
);



const newScore =
score + pointsPerObject;



setScore(
newScore
);





const foundCount =
updated.filter(
object=>
object.found
)
.length;



if(
foundCount === updated.length
){


setCompleted(true);



setTimeout(()=>{


onLevelComplete(
newScore
);


},1000);


}



}









return (


<div
className="
w-full
"
>




{
completed &&


<motion.div

initial={{
opacity:0,
scale:0.8
}}

animate={{
opacity:1,
scale:1
}}


className="
mb-5
rounded-3xl
bg-white/10
p-6
text-center
text-white
backdrop-blur-md
"

>


<div
className="
text-5xl
mb-3
"
>

🎉

</div>


<h2
className="
text-2xl
font-semibold
"
>

All Memories Found ❤️

</h2>


<p
className="
mt-3
text-white/70
"
>

You discovered every hidden moment

</p>


<p
className="
mt-4
text-3xl
font-bold
"
>

{score} ❤️

</p>


</motion.div>

}




{
!completed &&
<div

className="
relative
overflow-hidden
rounded-3xl
shadow-xl
"

>


<img

src={
image.url
}

alt={
image.title ??
"Memory"
}


className="
w-full
object-cover
"

loading="lazy"

 />





{

objects.map(
(object)=>(


<HiddenObjectMarker


key={
object.id
}


target={
object
}


onFound={
handleFound
}


/>


)

)

}



</div>
}




<div
className="
mt-5
rounded-3xl
bg-white/10
p-5
text-white
backdrop-blur-md
"
>

<p
className="
text-center
text-sm
font-semibold
text-white/80
"
>

🔍 Find these memories

</p>


<div
className="
mt-4
space-y-2
"
>

<AnimatePresence>
{

objects
.filter(
object =>
!object.found
)
.map(
object => (

<motion.div

key={
object.id
}

initial={{
opacity:0,
x:-10
}}

animate={{
opacity:1,
x:0
}}

exit={{
opacity:0,
x:-20
}}

className="
flex
items-center
gap-3
rounded-xl
bg-white/5
px-4
py-3
"

>

<span
className="
text-lg
"
>

{object.emoji}

</span>


<span
className="
text-sm
font-medium
text-white/90
"
>

{object.name}

</span>


</motion.div>

)
)

}
</AnimatePresence>

</div>


<div
className="
mt-4
border-t
border-white/10
pt-4
text-center
"
>

<p
className="
text-xs
text-white/50
"
>

Found{" "}

{
objects.filter(
object =>
object.found
)
.length
}

{" / "}

{
objects.length
}

</p>


<p
className="
mt-1
text-2xl
font-bold
"
>

{score} ❤️

</p>

</div>


</div>




</div>


);

}