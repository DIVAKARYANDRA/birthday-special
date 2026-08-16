interface Props {

selected:string;

onChange:(value:string)=>void;

}


const categories=[

{
id:"all",
label:"All ❤️"
},

{
id:"first_moments",
label:"First Moments 💕"
},

{
id:"trips",
label:"Trips ✈️"
},

{
id:"celebrations",
label:"Celebrations 🎂"
},

{
id:"random_us",
label:"Random Us 😂"
},

{
id:"family",
label:"Family 👨‍👩‍👧"
}

];


export default function GalleryCategoryTabs(
{
selected,
onChange
}:Props
){


return (

<div

className="
flex
gap-3
overflow-x-auto
pb-3
no-scrollbar
"

>


{
categories.map(cat=>(

<button

key={cat.id}

onClick={()=>
onChange(cat.id)
}

className={`
whitespace-nowrap
rounded-full
px-4
py-2
text-sm
transition

${
selected===cat.id
?
"bg-purple-600 text-white"
:
"bg-white/10 text-white/70"
}

`}

>

{cat.label}

</button>


))

}


</div>

)

}