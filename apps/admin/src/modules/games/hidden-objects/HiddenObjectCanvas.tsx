import {
  useState,
} from "react";

interface HiddenObjectCanvasProps {

 image:any;

 markers:any[];

 onPositionSelect:(x:number,y:number)=>void;

}



export default function HiddenObjectCanvas(
{
 image,
 markers,
 onPositionSelect

}:HiddenObjectCanvasProps
){





function handleClick(
event:React.MouseEvent<HTMLDivElement>
){


const rect =
event.currentTarget.getBoundingClientRect();



const x =
(
(event.clientX - rect.left)
/
rect.width
)
*
100;



const y =
(
(event.clientY - rect.top)
/
rect.height
)
*
100;



const position={
x:Number(x.toFixed(2)),
y:Number(y.toFixed(2))
};



onPositionSelect(
position.x,
position.y
);


}




return (

<div

className="
relative
inline-block
cursor-crosshair
"

onClick={
handleClick
}

>


<img

src={
image.url
}

alt={
image.alt_text ?? "memory"
}

className="
max-h-[500px]
rounded-xl
object-contain
"

/>



{
markers.map(
(marker:any,index)=>(


<div

key={
marker.id ?? index
}


className="
absolute
flex
h-8
w-8
items-center
justify-center
rounded-full
bg-red-500
text-white
font-bold
"


style={{

left:`${marker.x_position}%`,

top:`${marker.y_position}%`,

transform:
"translate(-50%,-50%)"

}}

>

{
marker.emoji
}


</div>


)

)

}



</div>

);

}