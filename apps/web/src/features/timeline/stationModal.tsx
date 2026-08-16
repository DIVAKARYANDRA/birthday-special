import {motion} from "framer-motion";


interface Props {

station:any;

onClose:()=>void;

}



export default function StationModal({

station,

onClose

}:Props){


return (

<div

className="
fixed
inset-0
z-50
bg-black/60
flex
items-center
justify-center
p-5
"

onClick={onClose}

>


<motion.div

initial={{
scale:.9,
opacity:0
}}

animate={{
scale:1,
opacity:1
}}

onClick={
e=>e.stopPropagation()
}

className="
bg-[#1d1533]
rounded-3xl
max-w-sm
w-full
overflow-hidden
"

>


{
station.image &&

<img

src={station.image}

className="
h-48
w-full
object-cover
"

/>

}



<div className="p-5">


<h2 className="
text-xl
text-white
font-semibold
">

{station.title}

</h2>


<p className="
text-white/60
mt-2
">

{station.description}

</p>


{
station.location &&

<p className="
text-sm
text-white/40
mt-3
">

📍 {station.location}

</p>

}



<button

onClick={onClose}

className="
mt-5
rounded-full
bg-purple-600
px-5
py-2
text-white
"

>

Close

</button>


</div>


</motion.div>


</div>

)

}