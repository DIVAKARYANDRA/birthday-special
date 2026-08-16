import {useEffect,useState} from "react";
import {useParams} from "react-router-dom";

import SceneLayout from "@/components/global/SceneLayout";
import Breadcrumb from "@/components/ui/Breadcrumb";


interface LetterDetail {

id:string;

title:string;

body:string;

written_date:string|null;

}



export default function LetterDetailScene(){


const {id}=useParams();


const [letter,setLetter]=
useState<LetterDetail|null>(null);


const [loading,setLoading]=
useState(true);



useEffect(()=>{


async function load(){


try{


const response =
await fetch(
`${import.meta.env.VITE_API_BASE_URL}/api/v1/experience/letters/${id}`
);


if(response.ok){

const data =
await response.json();

setLetter(data);

}


}
finally{

setLoading(false);

}


}


if(id){

void load();

}


},[id]);




return (

<SceneLayout mode="dawn">


<Breadcrumb label="Letter"/>



<div
className="
flex
flex-1
flex-col
items-center
justify-center
px-6
text-center
"
>


{
loading &&

<p className="text-white/50">
Opening letter 💌
</p>

}



{
!loading && !letter &&

<p className="text-white/50">
Letter is unavailable
</p>

}



{
letter &&

<div
className="
max-w-xl
rounded-2xl
border
border-white/15
bg-white/[0.06]
p-6
"
>


<div className="text-5xl mb-4">
💌
</div>



<h1
className="
text-2xl
text-white
font-display
"
>
{letter.title}
</h1>



{
letter.written_date &&

<p
className="
text-sm
text-white/40
mt-2
"
>
{letter.written_date}
</p>

}



<p
className="
mt-6
text-white/80
whitespace-pre-line
"
>
{letter.body}
</p>


</div>

}


</div>


</SceneLayout>

)

}