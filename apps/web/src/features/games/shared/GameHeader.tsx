import type { ReactNode } from "react";

interface GameHeaderProps {

  level:number;

  totalScore:number;

  onReset:()=>void;

  music:ReactNode;

}


export default function GameHeader(
{
 level,
 totalScore,
 onReset,
 music

}:GameHeaderProps
){


const progress =
Math.min(
(level / 10) * 100,
100
);



return (

<div
className="
mb-8
text-white
"
>

{/* Top controls */}

<div
className="
flex
items-center
justify-between
mb-5
"
>


<div>
{music}
</div>



<div
className="
text-center
"
>

<h1
className="
text-2xl
font-semibold
tracking-wide
"
>

🎮 Game Zone

</h1>


<p
className="
mt-1
text-xs
text-white/50
"
>

A journey of memories ❤️

</p>


</div>




<button

onClick={onReset}

className="
rounded-full
bg-white/10
px-3
py-2
text-lg
transition
active:scale-90
"

aria-label="Reset game"

>

🔄

</button>



</div>





{/* Level */}

<div
className="
rounded-2xl
bg-white/10
p-4
backdrop-blur-md
"
>


<div
className="
flex
justify-between
text-sm
"

>

<span
className="
text-white/70
"
>

Level

</span>


<span
className="
font-semibold
"
>

{level} / 10

</span>


</div>





{/* Progress */}

<div

className="
mt-3
h-2
overflow-hidden
rounded-full
bg-white/20
"

>

<div

className="
h-full
rounded-full
bg-purple-400
transition-all
duration-700
"

style={{
width:`${progress}%`
}}

/>


</div>






<div
className="
mt-4
text-center
"
>


<p
className="
text-xs
text-white/50
"
>

🏆 Love Points

</p>


<p
className="
text-2xl
font-bold
"
>

{totalScore} ❤️

</p>


</div>


</div>



</div>

);

}