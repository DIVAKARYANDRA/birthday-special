import {useState} from "react";

import {
useQuery,
useQueryClient
} from "@tanstack/react-query";


import {
timelineApi
} from "@/api/timelineApi";


import {
memoriesApi
} from "@/api/memoriesApi";


import type {
MemoryRead
} from "@/api/memoriesApi";



export default function TimelineListPage(){


const queryClient =
useQueryClient();



const [title,setTitle]=useState("");

const [description,setDescription]=useState("");

const [selectedTimeline,setSelectedTimeline]=useState("");

const [chapterTitle,setChapterTitle]=useState("");

const [selectedChapter,setSelectedChapter]=useState("");

const [selectedMemory,setSelectedMemory]=useState("");





const timelines =
useQuery({

queryKey:["timelines"],

queryFn:timelineApi.list,

});





const memories =
useQuery<MemoryRead[]>({

queryKey:["memories"],

queryFn:memoriesApi.list,

});





async function createTimeline(){


const result =
await timelineApi.create({

title,

description,

presentation_style:"train_journey"

});


setSelectedTimeline(
result.id
);


queryClient.invalidateQueries({
queryKey:["timelines"]
});


alert(
"Timeline created"
);


}






async function addChapter(){


if(!selectedTimeline)
return;



const chapter =
await timelineApi.addChapter(

selectedTimeline,

{
title:chapterTitle,
display_order:0
}

);



setSelectedChapter(
chapter.id
);


queryClient.invalidateQueries({
queryKey:["timelines"]
});


alert(
"Chapter added"
);


}







async function attachMemory(){


if(
!selectedChapter ||
!selectedMemory
)
return;



await timelineApi.attachMemory(

selectedChapter,

{
memory_id:selectedMemory,
display_order:0
}

);



queryClient.invalidateQueries({
queryKey:["timelines"]
});


alert(
"Memory added to train"
);



}






async function publishTimeline(
id:string
){


await timelineApi.publish(id);


queryClient.invalidateQueries({
queryKey:["timelines"]
});


alert(
"Timeline published"
);


}





return (

<div className="space-y-6 p-6">


<h1 className="text-2xl font-semibold">
Timeline Builder 🚂
</h1>




<div className="rounded-xl border p-5">


<h2 className="font-semibold mb-3">
Create Timeline
</h2>


<input

className="border rounded p-2 w-full mb-3"

placeholder="Our Journey"

value={title}

onChange={
e=>setTitle(e.target.value)
}

/>


<textarea

className="border rounded p-2 w-full mb-3"

placeholder="Description"

value={description}

onChange={
e=>setDescription(e.target.value)
}

/>



<button

onClick={createTimeline}

className="
bg-purple-700
text-white
px-5
py-2
rounded
"

>

Create

</button>


</div>







<div className="rounded-xl border p-5">


<h2 className="font-semibold mb-3">
Add Chapter
</h2>



<select

className="border rounded p-2 w-full mb-3"

value={selectedTimeline}

onChange={
e=>setSelectedTimeline(e.target.value)
}

>

<option>
Select Timeline
</option>


{
timelines.data?.map(t=>(

<option
key={t.id}
value={t.id}
>

{t.title}

</option>

))
}


</select>




<input

className="border rounded p-2 w-full mb-3"

placeholder="Chapter name"

value={chapterTitle}

onChange={
e=>setChapterTitle(e.target.value)
}

/>



<button

onClick={addChapter}

className="
bg-blue-600
text-white
px-5
py-2
rounded
"

>

Add Chapter

</button>


</div>









<div className="rounded-xl border p-5">


<h2 className="font-semibold mb-3">
Add Memory Station
</h2>




<select

className="border rounded p-2 w-full mb-3"

value={selectedChapter}

onChange={
e=>setSelectedChapter(e.target.value)
}

>

<option>
Select Chapter
</option>


{
timelines.data
?.flatMap(
t=>t.chapters
)
.map(c=>(

<option
key={c.id}
value={c.id}
>

{c.title}

</option>

))
}


</select>





<select

className="border rounded p-2 w-full mb-3"

value={selectedMemory}

onChange={
e=>setSelectedMemory(e.target.value)
}

>

<option>
Select Memory
</option>


{
memories.data?.map(m=>(

<option
key={m.id}
value={m.id}
>

{m.title}

</option>

))
}


</select>




<button

onClick={attachMemory}

className="
bg-green-600
text-white
px-5
py-2
rounded
"

>

Attach Memory

</button>



</div>








<div>


<h2 className="font-semibold">
Existing Timelines
</h2>



{
timelines.data?.map(t=>(


<div

key={t.id}

className="
border
rounded
p-4
mt-3
"

>


<h3 className="font-semibold">
{t.title}
</h3>


<p>
Status:
{t.status}
</p>



{
t.chapters.map(c=>(

<div
key={c.id}
className="ml-4 mt-2"
>

📍 {c.title}

</div>

))

}



<button

onClick={()=>
publishTimeline(t.id)
}

className="
mt-3
bg-green-700
text-white
px-4
py-2
rounded
"

>

Publish

</button>


</div>


))

}



</div>



</div>

)

}