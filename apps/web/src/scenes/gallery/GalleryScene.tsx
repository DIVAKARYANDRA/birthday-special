import {useEffect,useState} from "react";
import {motion} from "framer-motion";


import SceneLayout from "@/components/global/SceneLayout";
import Breadcrumb from "@/components/ui/Breadcrumb";

import FloatingPolaroid from "@/features/gallery/FloatingPolaroid";
import PhotoViewer from "@/features/gallery/PhotoViewer";

import {
 staggerContainer
} from "@/animations/motionPrimitives";


const API =
import.meta.env.VITE_API_BASE_URL ?? "";



export interface GalleryPhoto{

id:string;

url:string;

title:string|null;

caption:string|null;

order:number;

}



export default function GalleryScene(){


const [photos,setPhotos]=
useState<GalleryPhoto[]>([]);


const [viewerIndex,setViewerIndex]=
useState<number|null>(null);



useEffect(()=>{


async function load(){


const response =
await fetch(
`${API}/api/v1/experience/media/gallery`
);


const data =
await response.json();


setPhotos(data);


}


void load();


},[]);




return (

<SceneLayout mode="night" showFireflies>


<Breadcrumb label="Gallery"/>



<div
className="
flex-1
px-5
pb-8
pt-6
"
>


<motion.div


variants={staggerContainer}

initial="hidden"

animate="visible"


className="
flex
flex-wrap
justify-center
gap-x-3
gap-y-10
"

>


{
photos.map(
(photo,index)=>(


<FloatingPolaroid

key={photo.id}

photo={photo}

onOpen={()=>
setViewerIndex(index)
}

/>


))

}


</motion.div>


</div>





{
viewerIndex!==null &&


<PhotoViewer

photos={photos}

activeIndex={viewerIndex}

onClose={()=>
setViewerIndex(null)
}

onNavigate={setViewerIndex}

/>


}



</SceneLayout>


)

}