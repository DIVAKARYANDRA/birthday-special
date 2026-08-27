import {useEffect,useState} from "react";

import HeartPortraitReveal from "@/features/heart-portrait/HeartPortraitReveal";

import {
 getPortraitImage
} from "@/api/portraitApi";


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

<div className="
flex
min-h-screen
items-center
justify-center
text-white
">

Loading ❤️

</div>

);

}



return (

<HeartPortraitReveal

imageSrc={image}

/>

);


}