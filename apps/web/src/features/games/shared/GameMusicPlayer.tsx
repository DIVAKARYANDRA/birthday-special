import {
  useEffect,
  useRef,
  useState,
} from "react";


interface GameMusicPlayerProps {

  gameId:string;

}


const API =
import.meta.env.VITE_API_BASE_URL ?? "";



export default function GameMusicPlayer(
{
 gameId

}:GameMusicPlayerProps
){


const audioRef =
useRef<HTMLAudioElement | null>(null);


const [
musicUrl,
setMusicUrl
]
=
useState<string | null>(null);



const [
playing,
setPlaying
]
=
useState(false);





useEffect(()=>{


async function loadMusic(){


try{


const response =
await fetch(
`${API}/api/v1/experience/media/game-music/${gameId}`
);



if(!response.ok){

return;

}



const data =
await response.json();



if(data?.url){

setMusicUrl(
data.url
);

}


}
catch(error){

console.error(
"Game music loading failed",
error
);

}


}


void loadMusic();


},[
gameId
]);






useEffect(()=>{


if(
audioRef.current
&&
musicUrl
){

audioRef.current.volume =
0.35;


}


},[
musicUrl
]);






function toggleMusic(){


if(!audioRef.current)
return;



if(playing){


audioRef.current.pause();

setPlaying(false);


}

else{


audioRef.current.play();

setPlaying(true);


}


}






if(!musicUrl)
return null;



return (

<>

<audio

ref={audioRef}

src={musicUrl}

loop

preload="auto"

/>



<button

onClick={toggleMusic}

className="
rounded-full
bg-white/10
px-3
py-2
text-xl
"

aria-label="Toggle game music"

>

{
playing
?
"🎵"
:
"🔇"
}

</button>


</>

);


}