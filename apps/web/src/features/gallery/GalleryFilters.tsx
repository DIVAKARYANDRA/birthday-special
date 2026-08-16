interface Props {
 selected:string;
 onChange:(value:string)=>void;
}


const categories=[
 {
 value:"all",
 label:"All"
 },
 {
 value:"first_moments",
 label:"❤️ Love"
 },
 {
 value:"trips",
 label:"✈️ Trips"
 },
 {
 value:"celebrations",
 label:"🎂 Events"
 },
 {
 value:"family",
 label:"👨‍👩‍👧 Family"
 }
];


export default function GalleryFilters(
{
selected,
onChange
}:Props
){

return (

<div className="
flex
gap-3
overflow-x-auto
pb-4
px-2
">

{
categories.map(item=>(

<button

key={item.value}

onClick={()=>
onChange(item.value)
}

className={`
rounded-full
px-4
py-2
text-sm
whitespace-nowrap

${
selected===item.value
?
"bg-purple-600 text-white"
:
"bg-white/10 text-white"
}

`}

>

{item.label}

</button>

))
}

</div>

)

}