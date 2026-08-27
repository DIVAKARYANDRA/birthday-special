import { motion } from "framer-motion";


interface Props {

 title:string;

 memoryTitle:string;

 image?:string;

}

// Helper to construct full Cloudinary URL
const getImageUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `https://res.cloudinary.com/jms8snqc/image/upload/${path}`;
};


export default function TrainStation({

title,

memoryTitle,

image,

}:Props){


return (

<motion.div

initial={{
 opacity:0,
 x:-20
}}

whileInView={{
 opacity:1,
 x:0
}}

viewport={{
 once:true
}}

className="
relative
rounded-2xl
border
border-white/10
bg-white/[0.06]
backdrop-blur
overflow-hidden
"

>



<div
className="
absolute
-left-12
top-5
h-8
w-8
rounded-full
bg-purple-500
flex
items-center
justify-center
"

>

🚉

</div>




{
image &&

<img

src={getImageUrl(image)}

alt={title}

className="
h-40
w-full
object-cover
"

/>

}




<div className="p-4">


<h3
className="
text-white
font-semibold
"
>

{title}

</h3>


<p
className="
text-sm
text-white/60
mt-1
"

>

{memoryTitle}

</p>



</div>


</motion.div>


)

}