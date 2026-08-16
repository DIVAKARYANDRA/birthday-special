interface GameHeaderProps {

level:number;

totalScore:number;

onReset:()=>void;

music:React.ReactNode;

}

export default function GameHeader(
{
level,
totalScore,
onReset

}:GameHeaderProps
){

return (

<div
className="
mb-8
text-center
text-white
"
>

<div
className="
flex
justify-between
items-center
mb-4
"
>

<div>

{music}

</div>


<h1
className="
text-2xl
font-semibold
"
>
❤️ Memory Match
</h1>


<button

onClick={onReset}

className="
rounded-full
bg-white/10
px-3
py-2
"
>

🔄

</button>


</div>



<p
className="
text-sm
text-white/60
"
>

Level {level} / 10

</p>


<div
className="
mt-3
h-2
rounded-full
bg-white/20
"
>

<div

className="
h-full
rounded-full
bg-purple-500
"

style={{
width:`${level*10}%`
}}

/>

</div>


<p
className="
mt-4
text-xl
font-semibold
"
>

Total Score:
{totalScore} ❤️

</p>


</div>

);

}