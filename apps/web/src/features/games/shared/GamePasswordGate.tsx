import {
  useState,
  type ReactNode,
} from "react";

import { motion } from "framer-motion";

import {
  GAME_PASSWORDS,
} from "./gamePasswords";


interface GamePasswordGateProps {

  gameId:string;

  children:ReactNode;

}



export default function GamePasswordGate(
{
 gameId,
 children

}:GamePasswordGateProps
){


const config =
GAME_PASSWORDS[gameId];



const storageKey =
`game-unlocked-${gameId}`;



const [
unlocked,
setUnlocked
]
=
useState(
()=>{

return (
sessionStorage.getItem(storageKey)
===
"true"
);

}
);



const [
password,
setPassword
]
=
useState("");



const [
error,
setError
]
=
useState(false);





if(!config){

return (

<div
className="
flex
min-h-screen
items-center
justify-center
text-white
"
>

Game configuration missing

</div>

);

}





function unlockGame(){


if(
password.trim()
===
config.password
){


sessionStorage.setItem(
storageKey,
"true"
);


setUnlocked(true);


setError(false);


}

else{


setError(true);


}


}





if(unlocked){

return <>{children}</>;

}





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
scale:0.9
}}

animate={{
opacity:1,
scale:1
}}

transition={{
duration:0.4
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
backdrop-blur-md
"

>


<div
className="
mb-5
text-5xl
"
>

🔐

</div>



<h1

className="
mb-2
font-display
text-2xl
text-white
"

>

{config.title}

</h1>




<p

className="
mb-6
text-sm
text-white/60
"

>

This memory game is locked ❤️

</p>





<input


type="password"


value={password}


onChange={
e=>{

setPassword(
e.target.value
);

setError(false);

}

}


onKeyDown={
e=>{

if(e.key==="Enter"){

unlockGame();

}

}

}


placeholder="Enter secret password"


className="
mb-3
w-full
rounded-xl
border
border-white/20
bg-black/20
px-4
py-3
text-center
text-white
outline-none
placeholder:text-white/40
focus:border-white/40
"

/>





{
error &&


<p

className="
mb-3
text-sm
text-red-300
"

>

Wrong password ❤️ Try again

</p>


}






<button


onClick={unlockGame}


className="
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

Unlock Memory Match ❤️

</button>





<div

className="
mt-5
rounded-xl
bg-white/5
p-3
"

>


<p

className="
text-xs
text-white/50
"

>

Hint:

</p>


<p

className="
mt-1
text-sm
text-white/80
"

>

{config.hint}

</p>


</div>





</motion.div>


</div>

);


}