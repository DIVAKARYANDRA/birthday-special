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
flex
min-h-full
flex-1
items-center
justify-center
px-6
"

>


<motion.div


initial={{

opacity:0,

scale:0.85

}}


animate={{

opacity:1,

scale:1

}}


transition={{

duration:0.6

}}



className="
w-full
max-w-sm
rounded-3xl
border
border-white/20
bg-white/10
p-8
text-center
backdrop-blur-lg
"

>



<motion.div


animate={{

rotate:[

0,

10,

-10,

0

]

}}


transition={{

duration:1,

repeat:Infinity,

repeatDelay:2

}}



className="
mb-5
text-6xl
"

>

{gift.emoji}

</motion.div>





<h1

className="
mb-3
font-display
text-2xl
text-white
"

>

Congratulations ❤️

</h1>





<h2

className="
mb-4
text-xl
font-semibold
text-white
"

>

{gift.title}

</h2>





{

gift.image &&


<img


src={
gift.image
}


alt={
gift.title
}


className="
mx-auto
mb-5
h-48
w-48
rounded-2xl
object-cover
shadow-xl
"


/>


}






<p

className="
mb-6
text-sm
leading-relaxed
text-white/70
"

>

{gift.message}

</p>






<div

className="
rounded-xl
bg-white/5
p-4
"

>


<p

className="
text-xs
text-white/50
"

>

Your mission ❤️

</p>


<p

className="
mt-1
text-sm
text-white
"

>

Take a screenshot and send it to me 🎁

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
text-white
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