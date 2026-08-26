import { useQuery } from "@tanstack/react-query";
import { mediaApi } from "@/api/mediaApi";
import { getCloudinaryUrl } from "@/utils/mediaUrl";


interface Props {

  title:string;

  onSelect:(mediaId:string)=>void;

  usage?:string;

  category?:string;

}



export default function MediaSelector({
  title,
  onSelect,
  usage="game",
  category="pooja-kitchen"

}:Props){


const {
 data:media=[],
 isLoading

}=useQuery({

 queryKey:[
    "media-selector",
    usage,
    category
 ],

 queryFn:()=>mediaApi.list()

});



const filtered =
media.filter(
(item)=>
item.media_type==="image"
&&
item.usage===usage
&&
item.category===category
);



if(isLoading){

return (
<div>
Loading media...
</div>
)

}



return (

<div
className="
fixed
inset-0
bg-black/50
flex
items-center
justify-center
z-50
"
>


<div
className="
bg-white
rounded-xl
p-6
w-[700px]
max-h-[80vh]
overflow-auto
"
>


<h2
className="
text-xl
font-bold
mb-4
"
>

{title}

</h2>



<div
className="
grid
grid-cols-3
gap-4
"
>


{
filtered.map(
(media)=>(

<button

key={media.id}

onClick={()=>onSelect(media.id)}

className="
border
rounded-lg
overflow-hidden
hover:ring-2
hover:ring-purple-600
"

>


<img

src={
getCloudinaryUrl(
media.external_reference
)
}

className="
w-full
h-32
object-cover
"

/>


<div
className="
p-2
text-xs
"
>

Select

</div>


</button>


)

)

}



</div>


</div>


</div>

)

}