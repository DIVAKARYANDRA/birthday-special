import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import SceneLayout from "@/components/global/SceneLayout";
import Breadcrumb from "@/components/ui/Breadcrumb";


const GAMES = [

{
 id:"memory-match",
 title:"Memory Match",
 emoji:"❤️",
 description:"Find and match our beautiful memories",
 route:"/games/memory-match",
 available:true
},


{
 id:"story-puzzle",
 title:"Our Story Puzzle",
 emoji:"🧩",
 description:"Put our memories back together",
 route:"/games/story-puzzle",
 available:false
},


{
 id:"love-quiz",
 title:"Love Quiz",
 emoji:"💌",
 description:"How well do you know our journey?",
 route:"/games/love-quiz",
 available:false
}


];



export default function GameHubScene(){


const navigate =
useNavigate();



return (

<SceneLayout mode="twilight">


<Breadcrumb
label="Game Zone"
/>


<div

className="
flex-1
overflow-y-auto
px-5
pb-20
pt-6
"

>


<div
className="
mb-8
text-center
"

>


<div
className="
text-5xl
mb-3
"
>

🎮

</div>


<h1
className="
text-3xl
font-semibold
text-white
"
>

Game Zone

</h1>


<p
className="
mt-2
text-sm
text-white/60
"
>

Choose a memory adventure ❤️

</p>


</div>





<div
className="
space-y-5
"
>


{

GAMES.map(
(game)=>(


<motion.button


key={game.id}


whileTap={{
scale:0.96
}}


disabled={!game.available}


onClick={()=>{

if(game.available){

navigate(game.route);

}

}}


className={`

w-full

rounded-3xl

border

border-white/20

bg-white/10

p-6

text-left

backdrop-blur-md

${

!game.available

?

"opacity-60"

:

""

}

`}


>


<div
className="
flex
items-center
gap-4
"

>


<div
className="
text-5xl
"
>

{game.emoji}

</div>


<div>


<h2
className="
text-xl
font-semibold
text-white
"
>

{game.title}

</h2>


<p
className="
mt-1
text-sm
text-white/60
"
>

{game.description}

</p>


</div>


</div>





<div
className="
mt-4
text-sm
text-white/70
"
>

{

game.available

?

"Play ❤️"

:

"Coming Soon ✨"

}

</div>


</motion.button>


)

)

}


</div>


</div>


</SceneLayout>

);

}