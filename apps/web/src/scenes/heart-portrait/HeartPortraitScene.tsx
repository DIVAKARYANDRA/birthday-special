import {useEffect,useState} from "react";

import HeartPortraitReveal from "@/features/heart-portrait/HeartPortraitReveal";

import {
 getPortraitImage
} from "@/api/portraitApi";

import SceneLayout from "@/components/global/SceneLayout";


export default function HeartPortraitScene(){


const [image,setImage]=useState<string>("");


useEffect(()=>{


async function load(){

const data =
await getPortraitImage();


if(data?.url){

setImage(data.url);

}

}


void load();


},[]);



if(!image){

return (

<SceneLayout
mode="night"
showFireflies
>

<div
className="
flex
min-h-screen
items-center
justify-center
text-white
"
>

Loading ❤️

</div>

</SceneLayout>

);

}



return (

<SceneLayout
mode="night"
showFireflies
>


<div
className="
h-[calc(100vh-0px)]
w-full
"
>

<HeartPortraitReveal

imageSrc={image}

title="My Love ❤️"

/>

</div>


</SceneLayout>

);


}