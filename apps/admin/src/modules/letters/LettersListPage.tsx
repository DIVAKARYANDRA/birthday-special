import {useState} from "react";

import {
useQuery,
useQueryClient
} from "@tanstack/react-query";

import type {
  LetterRead
} from "@/api/lettersApi";
import {
lettersApi
} from "@/api/lettersApi";


export default function LettersListPage(){


const queryClient =
useQueryClient();



const [title,setTitle]=
useState("");

const [body,setBody]=
useState("");

const [writtenDate,setWrittenDate]=
useState("");

const {
  data: letters = [],
} = useQuery<LetterRead[]>({

  queryKey:["letters"],

  queryFn: async () => {

    const response =
      await lettersApi.list();

    return response;

  },

});



async function createLetter(){

try{


if(!title.trim() || !body.trim()){

alert(
"Title and body required"
);

return;

}



await lettersApi.create({

title,

body,

written_date:
writtenDate || undefined,

});



setTitle("");

setBody("");

setWrittenDate("");



queryClient.invalidateQueries({
queryKey:["letters"]
});


alert(
"Letter created"
);


}
catch(error){

console.error(error);

alert(
"Failed creating letter"
);

}

}




async function publishLetter(
id:string
){

try{


await lettersApi.update(
id,
{
status:"published"
}
);


queryClient.invalidateQueries({
queryKey:["letters"]
});


alert(
"Letter published"
);


}
catch(error){

console.error(error);

alert(
"Failed publishing letter"
);

}

}





async function archiveLetter(
id:string
){

const confirmDelete =
window.confirm(
"Archive this letter?"
);


if(!confirmDelete)
return;


try{


await lettersApi.archive(id);



queryClient.invalidateQueries({
queryKey:["letters"]
});


alert(
"Letter archived"
);


}
catch(error){

console.error(error);

alert(
"Failed archiving letter"
);

}

}



return (

<div className="space-y-6 p-6">


<h1 className="text-2xl font-semibold">
Love Letters 💌
</h1>




<div className="rounded-xl border p-5">


<h2 className="font-semibold mb-3">
Create Letter
</h2>



<input

className="border rounded p-2 w-full mb-3"

placeholder="Title"

value={title}

onChange={
e=>setTitle(e.target.value)
}

/>




<textarea

className="border rounded p-2 w-full mb-3"

placeholder="Write your letter..."

value={body}

onChange={
e=>setBody(e.target.value)
}

/>




<input

type="date"

className="border rounded p-2 w-full mb-3"

value={writtenDate}

onChange={
e=>setWrittenDate(e.target.value)
}

/>




<button

onClick={createLetter}

className="
bg-purple-700
text-white
px-5
py-2
rounded
"

>

Create Letter

</button>


</div>






<div>


<h2 className="font-semibold mb-3">
Existing Letters
</h2>




{
letters.map(letter=>(

<div

key={letter.id}

className="
border
rounded
p-4
mb-3
"


>


<h3 className="font-semibold">

{letter.title}

</h3>
<p className="text-sm text-white/60 mt-2">
{letter.body.substring(0,120)}
...
</p>


<p className="text-sm">

Status:
{" "}
{letter.status}

</p>




{
letter.status !== "published" &&

<button

onClick={()=>
publishLetter(letter.id)
}

className="
mt-3
bg-green-600
text-white
px-4
py-2
rounded
"

>

Publish

</button>

}





{
letter.status !== "archived" &&

<button

onClick={()=>
archiveLetter(letter.id)
}

className="
mt-3
ml-3
bg-red-600
text-white
px-4
py-2
rounded
"

>

Archive

</button>

}




</div>


))

}



</div>


</div>

)

}