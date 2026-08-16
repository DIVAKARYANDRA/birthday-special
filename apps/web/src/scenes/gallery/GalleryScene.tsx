/**
 * GalleryScene — Dynamic Cloudinary Gallery
 *
 * Mobile-first floating memory album.
 */

import {
  useEffect,
  useState,
} from "react";

import {
  motion,
} from "framer-motion";

import GalleryFilters from "@/features/gallery/GalleryFilters";
import SceneLayout from "@/components/global/SceneLayout";
import Breadcrumb from "@/components/ui/Breadcrumb";
import GalleryCategoryTabs 
from "@/features/gallery/GalleryCategoryTabs";

import FloatingPolaroid from "@/features/gallery/FloatingPolaroid";
import PhotoViewer from "@/features/gallery/PhotoViewer";


import type {
  GalleryPhoto,
} from "@/features/gallery/types";


import {
  staggerContainer,
} from "@/animations/motionPrimitives";



const API =
  import.meta.env.VITE_API_BASE_URL ?? "";


interface GalleryResponse {

  id:string;

  url:string;

  title:string|null;

  alt_text:string|null;

  category:string|null;
  featured:boolean;

  display_order:number;

}




export default function GalleryScene(){


const [photos,setPhotos] =
useState<GalleryPhoto[]>([]);



const [viewerIndex,setViewerIndex] =
useState<number|null>(null);

const [category,setCategory]=useState("all");

const [loading,setLoading] =
useState(true);



const [error,setError] =
useState(false);


const featuredPhotos =
photos.filter(
photo=>photo.featured
);




useEffect(()=>{


async function loadGallery(){


try{


const response =
await fetch(
`${API}/api/v1/experience/media/gallery`
);



if(!response.ok){

throw new Error(
"Gallery API failed"
);

}



const data:
GalleryResponse[] =
await response.json();


const mappedPhotos:
GalleryPhoto[] =

data.map(
(photo,index)=>(

{

id:
photo.id,


url:
photo.url,


title:
photo.title,


alt_text:
photo.alt_text,


category:
 photo.category ?? null,

featured:
 photo.featured ?? false,

caption:
photo.alt_text ??
photo.title ??
"Beautiful memory",



rotationDeg:
[
-6,
4,
-3,
5,
-2
][
index % 5
],



}

)

);



setPhotos(
mappedPhotos
);



}

catch(error){

console.error(
"Gallery loading failed",
error
);


setError(true);


}

finally{

setLoading(false);

}


}



void loadGallery();



},[]);


const visiblePhotos =
photos.filter(
(photo)=>
category==="all"
||
photo.category===category
);



return (

<SceneLayout
  mode="night"
  showFireflies
>

<Breadcrumb
 label="Gallery"
/>


<div
className="
flex-1
overflow-y-auto
px-5
pb-24
pt-6
"
>


{/* Hero Section */}

<motion.div

initial={{
opacity:0,
y:-20
}}

animate={{
opacity:1,
y:0
}}

transition={{
duration:0.8
}}

className="
mb-10
text-center
"

>


<div
className="
text-4xl
mb-3
"
>
🌙
</div>


<h1
className="
text-3xl
font-semibold
text-white
tracking-wide
"
>
Our Memories
</h1>


<p
className="
mt-3
text-sm
text-white/60
max-w-xs
mx-auto
"
>
Every picture holds a little story of us ❤️
</p>

<div className="mt-8">

<GalleryFilters

selected={category}

onChange={setCategory}

/>

</div>

</motion.div>
{
featuredPhotos.length>0 &&

<section>

<h2 className="
text-white
text-xl
mb-4
">

⭐ Featured Memories

</h2>


<div className="
flex
overflow-x-auto
gap-4
">

{
featuredPhotos.map(photo=>(

<img

key={photo.id}

src={photo.url}

className="
h-56
w-56
rounded-xl
object-cover
"

/>

))

}

</div>


</section>

}

{
loading &&

<div

className="
flex
h-full
items-center
justify-center
text-white/60
"

>

Opening memories 📸

</div>

}





{
error &&

<div

className="
text-center
text-white/50
mt-20
"

>

Unable to open gallery 💔

</div>

}





{
!loading &&
!error &&
photos.length===0 &&


<div

className="
mt-20
text-center
text-white/50
"

>

No memories uploaded yet 📷

</div>

}





{
photos.length>0 &&
<>
<GalleryCategoryTabs

selected={category}

onChange={setCategory}

/>
<motion.div


variants={
staggerContainer
}


initial="hidden"


animate="visible"



className="

flex

flex-wrap

justify-center

gap-x-4

gap-y-12

"


>


{
visiblePhotos.map(
(photo,index)=>(


<FloatingPolaroid

key={
photo.id
}


photo={
photo
}



onOpen={()=>
setViewerIndex(index)
}


/>


)

)

}


</motion.div>
</>


}



</div>








{
viewerIndex !== null &&


<PhotoViewer


photos={
visiblePhotos
}


activeIndex={
viewerIndex
}



onClose={()=>
setViewerIndex(null)
}



onNavigate={
setViewerIndex
}


/>


}



</SceneLayout>


);


}