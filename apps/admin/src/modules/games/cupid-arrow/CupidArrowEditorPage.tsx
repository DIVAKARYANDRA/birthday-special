import {
  useEffect,
  useState,
} from "react";


import {
  mediaApi,
} from "@/api/mediaApi";


import {
  getCloudinaryUrl,
} from "@/utils/mediaUrl";


import {
  createCupidArrowLevel,
  listCupidArrowLevels,
  deleteCupidArrowLevel,
  createCupidArrowTarget,
  listCupidArrowTargets,
  deleteCupidArrowTarget,
} from "./cupidArrowApi";




export default function CupidArrowEditorPage(){


const [
media,
setMedia
]
=
useState<any[]>([]);



const [
levels,
setLevels
]
=
useState<any[]>([]);



const [
selectedImage,
setSelectedImage
]
=
useState<any>(null);



const [
selectedLevel,
setSelectedLevel
]
=
useState<any>(null);



const [
targets,
setTargets
]
=
useState<any[]>([]);


const [
selectedTargetImage,
setSelectedTargetImage
]
= useState<any>(null);


const [
level,
setLevel
]
=
useState(1);



const [
targetType,
setTargetType
]
=
useState("emoji");



const [
emoji,
setEmoji
]
=
useState("❤️");



const [
name,
setName
]
=
useState("Love Heart");



const [
x,
setX
]
=
useState(50);



const [
y,
setY
]
=
useState(30);



const [
velocity,
setVelocity
]
=
useState(0.4);



const [
points,
setPoints
]
=
useState(100);

const [
timeLimit,
setTimeLimit
]
=
useState(60);


const [
completionScore,
setCompletionScore
]
=
useState(500);


const [
movementSpeed,
setMovementSpeed
]
=
useState("medium");

const [
size,
setSize
]
=
useState(10);



useEffect(()=>{


async function load(){


const mediaData =
await mediaApi.list();


setMedia(
mediaData.filter(
(item:any)=>
item.usage==="game"
)
);



const levelData =
await listCupidArrowLevels();


setLevels(
levelData
);


}


void load();


},[]);






async function saveLevel(){


if(!selectedImage)
return;


await createCupidArrowLevel({

 media_id:selectedImage.id,

 level,

 target_type:targetType,

 target_emoji:emoji,

 target_name:name,

target_size:size,

 start_x:x,

 start_y:y,

 velocity_x:velocity,

 velocity_y:0,

 points,

 is_face_level:false,

 movement_speed:
movementSpeed,


time_limit:
timeLimit,


completion_score:
completionScore,

});


const updated =
await listCupidArrowLevels();


setLevels(
updated
);


}





async function selectLevel(
item:any
){


setSelectedLevel(item);


setLevel(
item.level
);


setMovementSpeed(
item.movement_speed ?? "medium"
);


setTimeLimit(
item.time_limit ?? 60
);


setCompletionScore(
item.completion_score ?? 500
);


setSize(
item.target_size ?? 10
);


setVelocity(
item.velocity_x ?? 0.4
);


const data =
await listCupidArrowTargets(
item.id
);


setTargets(
data
);


}






async function addTarget(){


if(!selectedLevel)
return;


if(
targetType==="image"
&&
!selectedTargetImage
){

alert(
"Please select target image"
);

return;

}


await createCupidArrowTarget(

selectedLevel.id,

{
target_type:targetType,

target_emoji:
targetType==="emoji"
?
emoji
:
null,




media_id:
targetType==="image"
?
selectedTargetImage?.id
:
null,


target_name:name,


x_position:x,


y_position:y,


velocity_x:velocity,


velocity_y:0,


target_size:size,


points


}

);



const updated =
await listCupidArrowTargets(
selectedLevel.id
);


setTargets(
updated
);


}






async function removeTarget(
id:string
){


await deleteCupidArrowTarget(
id
);


if(selectedLevel){

const updated =
await listCupidArrowTargets(
selectedLevel.id
);


setTargets(
updated
);

}


}






async function removeLevel(
id:string
){


await deleteCupidArrowLevel(
id
);


const updated =
await listCupidArrowLevels();


setLevels(
updated
);


}






return (

<div className="space-y-8 p-6">


<h1 className="text-2xl font-semibold">

Cupid Arrow Challenge 🏹❤️

</h1>




<h2 className="font-semibold">

Select Background Image

</h2>


<div className="grid grid-cols-1 md:grid-cols-4 gap-4">


{
media.map(
(image:any)=>(


<div

key={image.id}

onClick={()=>{
    console.log("Selected image:", image);
    setSelectedImage(image);
}}


className={`cursor-pointer rounded-xl border bg-white p-3 ${
    selectedImage?.id === image.id
        ? "border-purple-600 ring-2 ring-purple-300"
        : "border-gray-200"
}`}

>


<img

src={
getCloudinaryUrl(
image.external_reference
)
}

className="h-40 w-full object-cover rounded-lg"

/>


<p>

{image.original_filename}

</p>


</div>


)

)

}

</div>





<div className="rounded-xl border bg-white p-5 space-y-4">


<h2 className="font-semibold">

Create Level

</h2>


<input

type="number"

value={level}

onChange={
e=>setLevel(
Number(e.target.value)
)
}

className="border rounded p-2"

/>


<select

value={movementSpeed}

onChange={
e=>setMovementSpeed(
e.target.value
)
}

className="border rounded p-2"

>

<option value="slow">
Slow
</option>

<option value="medium">
Medium
</option>

<option value="fast">
Fast
</option>


</select>

<input

type="number"

value={timeLimit}

onChange={
e=>setTimeLimit(
Number(e.target.value)
)
}

placeholder="Time limit seconds"

className="border rounded p-2"

/>

<input

type="number"

value={completionScore}

onChange={
e=>setCompletionScore(
Number(e.target.value)
)
}

placeholder="Completion score"

className="border rounded p-2"

/>

<input

type="number"

value={size}

onChange={
e=>
setSize(
Number(e.target.value)
)
}

placeholder="Target Size"

className="border rounded p-2"

/>

<button

onClick={saveLevel}

className="bg-purple-700 text-white px-5 py-2 rounded"

>

Save Level

</button>


</div>






<div className="rounded-xl border bg-white p-5 space-y-4">


<h2 className="font-semibold">

Existing Levels

</h2>



{
levels.map(
(item:any)=>(


<div

key={item.id}

className="flex justify-between border p-3 rounded"


>


<button

onClick={()=>
selectLevel(item)
}

>

Level {item.level}

</button>


<button

onClick={()=>
removeLevel(item.id)
}

className="bg-red-600 text-white px-3 py-1 rounded"

>

Delete

</button>


</div>


)

)

}


</div>







{
selectedLevel &&

<div className="rounded-xl border bg-white p-5 space-y-4">


<h2 className="font-semibold">

Add Target To Level {selectedLevel.level}

</h2>


<select

value={targetType}

onChange={
e=>{

const value=e.target.value;

setTargetType(value);


if(value==="emoji"){
setSelectedTargetImage(null);
}

}

}

className="border rounded p-2"

>

<option value="emoji">

Emoji

</option>


<option value="image">

Image

</option>


</select>


{
targetType==="image" &&

<div className="grid grid-cols-3 gap-3">

{
media.map((image:any)=>(

<div

key={image.id}

onClick={()=>
setSelectedTargetImage(image)
}

className={`
cursor-pointer
border
rounded
p-2

${
selectedTargetImage?.id===image.id
?
"border-purple-600"
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

className="
h-24
w-full
object-cover
rounded
"

/>

</div>

))

}

</div>

}

{
targetType==="emoji" &&

<input

value={emoji}

onChange={
e=>setEmoji(
e.target.value
)
}

className="border rounded p-2"

/>

}




<input

value={name}

onChange={
e=>setName(
e.target.value
)
}

className="border rounded p-2"

/>





<input

type="number"

value={x}

onChange={
e=>setX(
Number(e.target.value)
)
}

placeholder="X"

className="border rounded p-2"

/>





<input

type="number"

value={y}

onChange={
e=>setY(
Number(e.target.value)
)
}

placeholder="Y"

className="border rounded p-2"

/>





<input

type="number"

value={velocity}

onChange={
e=>setVelocity(
Number(e.target.value)
)
}

className="border rounded p-2"

/>





<input

type="number"

value={points}

onChange={
e=>setPoints(
Number(e.target.value)
)
}

className="border rounded p-2"

/>





<button

onClick={addTarget}

className="bg-purple-700 text-white px-5 py-2 rounded"

>

Add Target

</button>




<h3 className="font-semibold">

Existing Targets

</h3>



{
targets.map(
(target:any)=>(


<div

key={target.id}

className="flex justify-between border rounded p-3"

>


<div className="flex items-center gap-3">


{
target.media?.url &&

<img

src={target.media.url}

className="
h-12
w-12
rounded-full
object-cover
"

/>

}


{
target.target_emoji &&
<span>
{target.target_emoji}
</span>

}


<span>
{target.target_name}
</span>


</div>



<button

onClick={()=>
removeTarget(
target.id
)
}

className="bg-red-600 text-white px-3 py-1 rounded"

>

Delete

</button>


</div>


)

)

}



</div>

}



</div>


);


}