import {
  useState,
} from "react";

import {
  motion,
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







<div

className="
mt-5
text-center
text-white
"

>


<p
className="
text-sm
text-white/60
"
>

Find the hidden memories ❤️

</p>



<p
className="
mt-2
text-xl
font-semibold
"
>

{
objects.filter(
object=>
object.found
)
.length
}

/

{
objects.length
}

Found

</p>



<p
className="
mt-2
text-2xl
"
>

{score} ❤️

</p>


</div>






</div>


);

}