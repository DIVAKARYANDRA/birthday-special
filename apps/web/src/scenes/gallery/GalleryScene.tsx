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


import SceneLayout from "@/components/global/SceneLayout";
import Breadcrumb from "@/components/ui/Breadcrumb";


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

  display_order:number;

}




export default function GalleryScene(){


const [photos,setPhotos] =
useState<GalleryPhoto[]>([]);



const [viewerIndex,setViewerIndex] =
useState<number|null>(null);



const [loading,setLoading] =
useState(true);



const [error,setError] =
useState(false);






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
px-4
pb-10
pt-6
"

>




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
photos.map(
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


}



</div>








{
viewerIndex !== null &&


<PhotoViewer


photos={
photos
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