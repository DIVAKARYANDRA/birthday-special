import {
  useQuery,
} from "@tanstack/react-query";
import {
 getCloudinaryUrl,
} from "@/utils/mediaUrl";

import {
  mediaApi,
} from "@/api/mediaApi";

import HiddenObjectCanvas 
from "./HiddenObjectCanvas";

import {
  useState,
} from "react";

import {
  useEffect,
} from "react";

import {
  createHiddenObjectTarget,
  getHiddenObjectTargets,
  deleteHiddenObjectTarget,

} 
from "./hiddenObjectsApi";

export default function HiddenObjectEditorPage(){



const {
 data:media
}
=
useQuery({

queryKey:[
"hidden-object-images"
],


queryFn:
()=>mediaApi.list()


});


const [
selectedImage,
setSelectedImage
]
=
useState<any>(null);

const [
selectedPosition,
setSelectedPosition
]
=
useState<{
x:number;
y:number;
}
|null>(null);



const [
objectName,
setObjectName
]
=
useState("");



const [
emoji,
setEmoji
]
=
useState("❤️");



const [
radius,
setRadius
]
=
useState(8);

const [
existingTargets,
setExistingTargets
]
=
useState<any[]>([]);

const images =
media?.filter(
(item:any)=>

item.usage==="game"

&&

item.category==="hidden-objects"

);

useEffect(()=>{


async function loadTargets(){


if(!selectedImage)
return;


const data =
await getHiddenObjectTargets(
selectedImage.id
);


setExistingTargets(
data
);


}



void loadTargets();


},[
selectedImage
]);


return (

<div
className="
space-y-6
p-6
"
>


<h1
className="
text-2xl
font-semibold
"
>

Hidden Object Editor 🔍

</h1>



<p
className="
text-gray-500
"
>

Select a memory image and place hidden objects.

</p>




<div

className="
grid
grid-cols-1
md:grid-cols-3
gap-6
"

>


{

images?.map(
(image:any)=>(


<div

key={
image.id
}

onClick={()=>
setSelectedImage(image);

setExistingTargets([]);

setSelectedPosition(null);
}

className={`
rounded-xl
border
bg-white
p-4
cursor-pointer

${
selectedImage?.id === image.id
?
"border-purple-600 ring-2 ring-purple-300"
:
""
}

`}

>


<img
src={
getCloudinaryUrl(
image.external_reference
)
}
alt={
image.alt_text ?? "memory"
}


className="
h-48
w-full
rounded-lg
object-cover
"


/>



<p

className="
mt-3
font-medium
"

>

{
image.original_filename
}

</p>


<p

className="
text-sm
text-gray-500
"

>

Level:
{
image.display_order
}

</p>



</div>


)

)

}





</div>
{
selectedImage && 

<div

className="
mt-8
rounded-xl
border
bg-white
p-6
"

>

<h2

className="
mb-4
text-xl
font-semibold
"

>

Editing:

{
selectedImage.original_filename
}

</h2>


<HiddenObjectCanvas

image={
selectedImage
}


markers={
existingTargets
}


onPositionSelect={
(x,y)=>{


setSelectedPosition({
x,
y
});


}

}

/>

{
existingTargets.length > 0 &&

<div
className="
mt-6
space-y-3
rounded-xl
border
p-5
"
>

<h3
className="
font-semibold
"
>
Existing Hidden Objects
</h3>


{
existingTargets.map(
(target:any)=>(


<div

key={target.id}

className="
flex
items-center
justify-between
rounded-lg
bg-gray-50
p-3
"

>


<div>

<span>
{target.emoji}
</span>

{" "}

{target.name}


</div>



<button

className="
rounded-lg
bg-red-600
px-3
py-1
text-white
"

onClick={
async()=>{


await deleteHiddenObjectTarget(
target.id
);


const updated =
await getHiddenObjectTargets(
selectedImage.id
);


setExistingTargets(
updated
);


}

}

>

Delete

</button>


</div>


)

)

}

</div>

}



{
selectedPosition &&

<div

className="
mt-6
space-y-4
rounded-xl
border
p-5
"

>


<h3
className="
font-semibold
"

>

Add Hidden Object

</h3>



<input

value={
objectName
}

onChange={
e=>
setObjectName(
e.target.value
)
}

placeholder="Object name"

className="
w-full
rounded-lg
border
p-2
"

/>




<input

value={
emoji
}

onChange={
e=>
setEmoji(
e.target.value
)
}

placeholder="Emoji"

className="
w-full
rounded-lg
border
p-2
"

/>



<input

type="number"

value={
radius
}

onChange={
e=>
setRadius(
Number(e.target.value)
)
}

placeholder="Radius"

className="
w-full
rounded-lg
border
p-2
"

/>



<p
className="
text-sm
text-gray-500
"

>

Position:

{x:
selectedPosition.x}

,

{y:
selectedPosition.y}

</p>



<button

className="
rounded-lg
bg-purple-700
px-5
py-2
text-white
"

onClick={async()=>{


await createHiddenObjectTarget({

media_id:
selectedImage.id,


level:
selectedImage.display_order ?? 1,


name:
objectName,


emoji,


x_position:
selectedPosition.x,


y_position:
selectedPosition.y,


radius


});

const updated =
await getHiddenObjectTargets(
selectedImage.id
);

setExistingTargets(
updated
);

setSelectedPosition(null);

setObjectName("");

}}

>

Save Object

</button>


</div>

}

</div>

}

</div>

</div>

);


}