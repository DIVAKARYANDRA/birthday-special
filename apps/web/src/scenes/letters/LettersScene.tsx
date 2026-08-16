import {useEffect,useState} from "react";
import {motion} from "framer-motion";
import {useNavigate} from "react-router-dom";

import SceneLayout from "@/components/global/SceneLayout";
import Breadcrumb from "@/components/ui/Breadcrumb";

import {
 getLetters,
 type PublicLetter
} from "@/api/lettersApi";


export default function LettersScene(){


const navigate = useNavigate();


const [letters,setLetters]=
useState<PublicLetter[]>([]);


const [loading,setLoading]=
useState(true);


const [error,setError]=
useState(false);



useEffect(()=>{


async function load(){


try{


const data =
await getLetters();


setLetters(data);


}
catch{

setError(true);

}
finally{

setLoading(false);

}


}


void load();


},[]);



return (

<SceneLayout mode="dawn">


<Breadcrumb label="Love Letters"/>



<div
className="
flex
flex-1
flex-col
items-center
justify-center
gap-5
px-6
text-center
"
>


{
loading &&

<p className="text-white/50">
Opening letter room...
</p>

}



{
error &&

<p className="text-red-300">
Unable to open letters room 💌
</p>

}



{
!loading &&
!error &&
letters.length===0 &&

<p className="text-white/50">
No letters have arrived yet 💌
</p>

}



{
letters.map(letter=>(


<motion.div

key={letter.id}

initial={{
opacity:0,
y:20
}}

animate={{
opacity:1,
y:0
}}

whileHover={{
scale:1.05
}}

onClick={() =>
 navigate(`/letters/${letter.id}`)
}

className="
flex
h-20
w-64
cursor-pointer
items-center
justify-center
rounded-xl
border
border-white/15
bg-white/[0.06]
"

>


<div>

<div className="text-3xl">
💌
</div>


<p className="text-white text-sm">
{letter.title}
</p>


{
letter.written_date &&

<p className="text-white/40 text-xs">
{letter.written_date}
</p>

}


</div>


</motion.div>


))

}



</div>


</SceneLayout>

)

}