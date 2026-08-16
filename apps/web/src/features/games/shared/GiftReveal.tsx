import { motion } from "framer-motion";

import type {
  GameGift,
} from "./gifts";


interface GiftRevealProps {

  gift:GameGift;

  onContinue?:()=>void;

}



export default function GiftReveal(
{
 gift,
 onContinue

}:GiftRevealProps
){


return (

<div

className="
relative
flex
min-h-full
flex-1
items-center
justify-center
overflow-hidden
px-6
"

>


{/* Floating hearts */}

<div
className="
absolute
inset-0
pointer-events-none
"

>

{

["❤️","✨","💖","⭐"].map(
(item,index)=>(

<motion.div

key={index}

initial={{
y:300,
opacity:0
}}

animate={{
y:-300,
opacity:1
}}

transition={{
duration:4,
delay:index*0.5,
repeat:Infinity
}}

className="
absolute
text-3xl
"

style={{

left:`${20 + index*20}%`

}}

>

{item}

</motion.div>

)

)

}

</div>





<motion.div


initial={{

opacity:0,

scale:0.8

}}


animate={{

opacity:1,

scale:1

}}


transition={{

duration:0.7

}}



className="
relative
z-10
w-full
max-w-sm
rounded-3xl
border
border-white/20
bg-white/10
p-8
text-center
backdrop-blur-xl
"

>



<motion.div


animate={{

rotate:[
0,
12,
-12,
0
]

}}


transition={{

duration:1.5,

repeat:Infinity,

repeatDelay:2

}}


className="
mb-4
text-7xl
"

>

{gift.emoji}

</motion.div>





<h1

className="
font-display
text-3xl
font-semibold
text-white
"

>

Journey Completed ❤️

</h1>




<p

className="
mt-2
text-sm
text-white/60
"

>

You unlocked the final surprise

</p>





<div

className="
my-6
h-px
bg-white/20
"

/>





<h2

className="
text-xl
font-semibold
text-white
"

>

{gift.title}

</h2>





{

gift.image &&

<motion.img


initial={{

opacity:0,

scale:0.8

}}


animate={{

opacity:1,

scale:1

}}


transition={{

delay:0.3

}}



src={
gift.image
}


alt={
gift.title
}


className="
mx-auto
mt-5
h-52
w-52
rounded-2xl
object-cover
shadow-2xl
"

/>

}






<p

className="
mt-5
text-sm
leading-relaxed
text-white/70
"

>

{gift.message}

</p>





<div

className="
mt-6
rounded-2xl
bg-white/10
p-4
"

>


<p

className="
text-sm
font-semibold
text-white
"

>

🎁 Your reward is unlocked

</p>


<p

className="
mt-2
text-xs
text-white/60
"

>

Take a screenshot and send it to me ❤️

</p>


</div>






{

onContinue &&


<button


onClick={onContinue}


className="
mt-6
w-full
rounded-xl
bg-purple-700
py-3
font-medium
text-white
transition
active:scale-95
"

>

Continue Journey ❤️

</button>


}



</motion.div>


</div>

);

}