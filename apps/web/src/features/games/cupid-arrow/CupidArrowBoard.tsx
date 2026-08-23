import {
  useEffect,
  useRef,
  useState,
} from "react";


import CupidArrow from "./CupidArrow";

import CupidTarget from "./CupidTarget";

import CupidParticles from "./CupidParticles";

import {
motion
}
from "framer-motion";

import type {
  CupidArrowLevel,
  CupidArrowTarget,
  CupidParticle,
  CupidProjectile,
} from "./cupidArrowTypes";



interface CupidArrowBoardProps {

  levelData:CupidArrowLevel;

  onLevelComplete:(score:number)=>void;

}

interface ScorePopup {

  id:string;

  x:number;

  y:number;

  value:string;

}


export default function CupidArrowBoard(
{
  levelData,
  onLevelComplete

}:CupidArrowBoardProps
){


  const createInitialTargets =
    () =>

      (levelData.targets ?? []).map(
        target=>({

          ...target,

          status:
            target.status ?? "idle"

        })
      );


  const [
    targets,
    setTargets
  ]
  =
  useState<CupidArrowTarget[]>(
    createInitialTargets()
  );


  const [
    score,
    setScore
  ]
  =
  useState(0);


  const [
    combo,
    setCombo
  ]
  =
  useState(0);

  const [
showLevelComplete,
setShowLevelComplete
]
=
useState(false);

  const [
 timeRemaining,
 setTimeRemaining
]
=
useState(
 levelData.timeLimit ?? 60
);


  const [
    projectile,
    setProjectile
  ]
  =
  useState<CupidProjectile | null>(
    null
  );


  const [
    particles,
    setParticles
  ]
  =
  useState<CupidParticle[]>(
    []
  );


  const [
scorePopups,
setScorePopups
]
=
useState<ScorePopup[]>([]);

  const [
    arrowTrail,
    setArrowTrail
  ]
  =
  useState<
    {
      x:number;
      y:number;
    }[]
  >([]);


  const [
    failed,
    setFailed
  ]
  =
  useState(false);

  const [
failureReason,
setFailureReason
]
=
useState<
"timeout" | "score" | null
>(null);


  const targetsRef =
    useRef<CupidArrowTarget[]>(
      []
    );


  const scoreRef =
    useRef(0);


  const comboRef =
    useRef(0);


  const completedRef =
    useRef(false);


  const failedRef =
    useRef(false);


  const frameRef =
    useRef<number | null>(
      null
    );



  /*
   * Keep refs synchronized.
   */

  useEffect(()=>{

    targetsRef.current =
      targets;

  },[targets]);


  useEffect(()=>{

    scoreRef.current =
      score;

  },[score]);


  useEffect(()=>{

    comboRef.current =
      combo;

  },[combo]);



  /*
   * Reset the complete game board
   * whenever a new level arrives.
   */

  useEffect(()=>{

    const initialTargets =
      createInitialTargets();


    setTargets(
      initialTargets
    );


    setScore(0);

    setCombo(0);

    setTimeRemaining(
      levelData.timeLimit
    );

    setProjectile(
      null
    );

    setParticles(
      []
    );

    setArrowTrail(
      []
    );

    setFailed(
      false
    );

    setShowLevelComplete(
 false
);


    scoreRef.current =
      0;

    comboRef.current =
      0;

    completedRef.current =
      false;

    failedRef.current =
      false;


  },[levelData]);



  /*
   * Timer.
   *
   * Timeout never completes the level.
   */

  useEffect(()=>{

    if(
      failed ||
      completedRef.current
    ){

      return;

    }


    const timer =
      window.setInterval(()=>{

        setTimeRemaining(
          previous=>{

            if(previous <= 1){

              window.clearInterval(
                timer
              );


              if(
                !completedRef.current
              ){

                failedRef.current =
                  true;

                  setFailureReason(
 "timeout"
);

                setFailed(
                  true
                );

                setProjectile(
                  null
                );

                setArrowTrail(
                  []
                );

              }


              return 0;

            }


            return previous - 1;

          }
        );

      },1000);


    return ()=>{

      window.clearInterval(
        timer
      );

    };


  },[
  ]);



  /*
   * Target movement engine.
   *
   * Movement remains controlled by
   * target velocity from Admin.
   */

  useEffect(()=>{


    if(
      failed ||
      completedRef.current
    ){

      return;

    }


    function moveTargets(){

      setTargets(
        previous=>

          previous.map(
            target=>{

              if(
                target.status !== "idle"
              ){

                return target;

              }


              let nextX =
                target.x +
                target.velocityX;


              let nextY =
                target.y +
                target.velocityY;


              let nextVelocityX =
                target.velocityX;


              let nextVelocityY =
                target.velocityY;


              /*
               * Keep target inside board.
               */

              const halfSize =
                Math.max(
                  target.size / 2,
                  2
                );


              const minX =
                halfSize;


              const maxX =
                100 -
                halfSize;


              const minY =
                halfSize;


              const maxY =
                100 -
                halfSize;


              if(
                nextX > maxX ||
                nextX < minX
              ){

                nextVelocityX =
                  -nextVelocityX;

                nextX =
                  target.x +
                  nextVelocityX;

              }


              if(
                nextY > maxY ||
                nextY < minY
              ){

                nextVelocityY =
                  -nextVelocityY;

                nextY =
                  target.y +
                  nextVelocityY;

              }


              return {

                ...target,

                x:nextX,

                y:nextY,

                velocityX:
                  nextVelocityX,

                velocityY:
                  nextVelocityY

              };

            }

          )
      );


      frameRef.current =
        window.requestAnimationFrame(
          moveTargets
        );

    }


    frameRef.current =
      window.requestAnimationFrame(
        moveTargets
      );


    return ()=>{

      if(
        frameRef.current !== null
      ){

        window.cancelAnimationFrame(
          frameRef.current
        );

        frameRef.current =
          null;

      }

    };


  },[
    failed,
    levelData
  ]);



  /*
   * Projectile movement + gravity.
   */

  useEffect(()=>{


    if(
      !projectile?.active ||
      failed ||
      completedRef.current
    ){

      return;

    }


    const timer =
      window.setInterval(()=>{

        setProjectile(
          previous=>{

            if(!previous){

              return null;

            }


            const gravity =
              0.08;


            const next:CupidProjectile =
            {

              ...previous,

              x:
                previous.x +
                previous.velocityX,

              y:
                previous.y +
                previous.velocityY,

              velocityY:
                previous.velocityY +
                gravity

            };


            const hitTarget =
              checkCollision(
                next
              );


            if(hitTarget){

              hit(
                hitTarget.id
              );


              setArrowTrail(
                []
              );


              return null;

            }


            if(

              next.x < -5 ||

              next.x > 105 ||

              next.y < -5 ||

              next.y > 105

            ){

              setArrowTrail(
                []
              );


              return null;

            }


            setArrowTrail(
              previousTrail=>[

                ...previousTrail.slice(
                  -8
                ),

                {
                  x:next.x,
                  y:next.y
                }

              ]
            );


            return next;

          }

        );

      },16);


    return ()=>{

      window.clearInterval(
        timer
      );

    };


  },[
    projectile,
    failed
  ]);



  function handleShoot(
    angle:number,
    power:number
  ){

    if(
      projectile?.active ||
      failed ||
      completedRef.current
    ){

      return;

    }


    const radians =
      angle *
      (Math.PI / 180);


    const speed =
      power / 10;


    setProjectile({

      x:50,

      y:85,

      velocityX:
        Math.cos(
          radians
        ) *
        speed,

      velocityY:
Math.sin(radians)
*
speed,

      active:true

    });


    setArrowTrail(
      []
    );

  }



  function checkCollision(
    arrow:CupidProjectile
  ){

    return targetsRef.current.find(
      target=>{

        if(
          target.status !== "idle"
        ){

          return false;

        }


        const dx =
          arrow.x -
          target.x;


        const dy =
          arrow.y -
          target.y;


        const distance =
          Math.sqrt(
            dx * dx +
            dy * dy
          );


        /*
         * Use half the configured target
         * size for collision.
         *
         * This still requires the arrow
         * itself to reach the target.
         */

        return (
  distance <
  Math.max(
    target.size * 0.45,
    1.5
  )
);

      }
    );

  }



  function hit(
    id:string
  ){

    if(
      completedRef.current ||
      failedRef.current
    ){

      return;

    }


    const target =
      targetsRef.current.find(
        item=>
          item.id === id
      );


    if(!target){

      return;

    }


    const newScore =
      scoreRef.current +
      target.points +
      (
        comboRef.current *
        5
      );


    scoreRef.current =
      newScore;


    comboRef.current =
      comboRef.current +
      1;


    setScore(
      newScore
    );


    const newCombo =
combo + 1;


setCombo(
newCombo
);


    navigator.vibrate?.(
      50
    );


    createParticles(
      target.x,
      target.y
    );

    createScorePopup(

target.x,

target.y,

target.points,

newCombo

);


    setTargets(
      previous=>

        previous.map(
          item=>

            item.id === id

            ?

            {
              ...item,

              status:
                "hit" as const
            }

            :

            item
        )
    );


    window.setTimeout(()=>{

      setTargets(
        previous=>{

          const updated =
            previous.map(
              item=>

                item.id === id

                ?

                {
                  ...item,

                  status:
                    "broken" as const
                }

                :

                item
            );


          const remaining =
            updated.filter(
              item=>
                item.status !==
                "broken"
            );



          if(

(
  remaining.length === 0
  ||
  newScore >= levelData.completionScore
)

&&

!completedRef.current

){



completedRef.current=true;

setTargets(
previous =>
previous.map(
target=>({
...target,
status:"broken"
})
)
);


setShowLevelComplete(true);



setTimeout(()=>{


onLevelComplete(
newScore
);


},2500);


}

          /*
           * All targets are gone but the
           * required score was not achieved.
           *
           * This is a failed attempt.
           */

          else if(

 remaining.length === 0 &&

 newScore <
 levelData.completionScore &&

 !completedRef.current &&

 !failedRef.current

){

    failedRef.current = true;

    setFailureReason(
 "score"
);

    setFailed(true);

}


          return updated;

        }

      );

    },500);

  }


  function createScorePopup(
x:number,
y:number,
points:number,
comboValue:number
){


const popup:ScorePopup = {

id:
crypto.randomUUID(),

x,

y,

value:

comboValue > 1

?

`+${points} ❤️  Combo x${comboValue}`

:

`+${points} ❤️`

};


setScorePopups(
previous=>[
...previous,
popup
]
);



setTimeout(()=>{


setScorePopups(
previous=>
previous.filter(
item=>
item.id!==popup.id
)

);


},1200);



}

  function createParticles(
    x:number,
    y:number
  ){

    const newParticles:CupidParticle[] = [

      {

        id:
          crypto.randomUUID(),

        x,

        y,

        emoji:"💥",

        lifetime:0.5

      },

      {

        id:
          crypto.randomUUID(),

        x:
          x + 5,

        y:
          y - 5,

        emoji:"❤️",

        lifetime:0.8

      },

      {

        id:
          crypto.randomUUID(),

        x:
          x - 5,

        y:
          y + 5,

        emoji:"✨",

        lifetime:0.8

      }

    ];


    setParticles(
      newParticles
    );


    window.setTimeout(()=>{

      setParticles([

{
id:crypto.randomUUID(),
x,
y,
emoji:"💥",
lifetime:0.5
},


{
id:crypto.randomUUID(),
x:x+5,
y:y-5,
emoji:"❤️",
lifetime:0.8
},


{
id:crypto.randomUUID(),
x:x-5,
y:y+5,
emoji:"💖",
lifetime:0.8
},


{
id:crypto.randomUUID(),
x:x+8,
y:y+3,
emoji:"✨",
lifetime:0.8
},


{
id:crypto.randomUUID(),
x:x-8,
y:y-3,
emoji:"✨",
lifetime:0.8
}


]);

    },1000);

  }



  function retry(){

    const initialTargets =
      createInitialTargets();


    setTargets(
      initialTargets
    );


    setScore(
      0
    );


    setCombo(
      0
    );


    setTimeRemaining(
      levelData.timeLimit
    );


    setProjectile(
      null
    );


    setArrowTrail(
      []
    );


    setParticles(
      []
    );


    setFailed(
      false
    );

    setFailureReason(
 null
);


    scoreRef.current =
      0;


    comboRef.current =
      0;


    completedRef.current =
      false;


    failedRef.current =
      false;

  }



  return (

    <div

      className="
        relative
        h-[600px]
        overflow-hidden
        rounded-3xl
        bg-cover
        bg-center
      "

      style={{

        backgroundImage:
          levelData.image?.url

          ?

          `url(${levelData.image.url})`

          :

          undefined

      }}

    >


      <div
        className="
          absolute
          inset-0
          bg-black/20
        "
      />



      <div

        className="
          absolute
          left-5
          top-5
          z-40
          rounded-xl
          bg-white/70
          px-4
          py-2
          text-xl
          font-semibold
        "

      >

        ❤️ {score}

        {" "}

        ⏱ {timeRemaining}s

      </div>



      {
        targets.map(
          target=>(

            <CupidTarget

              key={
                target.id
              }

              target={
                target
              }

            />

          )
        )
      }



      {
        arrowTrail.map(
          (point,index)=>(

            <div

              key={
                index
              }

              className="
                pointer-events-none
                absolute
                z-20
                text-sm
                opacity-50
              "

              style={{

                left:
                  `${point.x}%`,

                top:
                  `${point.y}%`,

                transform:
                  "translate(-50%,-50%)"

              }}

            >

              ✨

            </div>

          )
        )
      }



      {
        projectile?.active &&

        <div

          className="
            pointer-events-none
            absolute
            z-30
            text-5xl
          "

          style={{

            left:
              `${projectile.x}%`,

            top:
              `${projectile.y}%`,

            transform:
              `translate(-50%,-50%) rotate(${
                Math.atan2(
                  -projectile.velocityY,
                  projectile.velocityX
                ) *
                (180 / Math.PI)
              }deg)`

          }}

        >

          🏹

        </div>

      }



      <CupidParticles
        particles={
          particles
        }
      />

      {
scorePopups.map(
popup=>(


<motion.div

key={
popup.id
}

initial={{
opacity:0,
scale:0.5,
y:0
}}

animate={{
opacity:1,
scale:1,
y:-50
}}

exit={{
opacity:0
}}

transition={{
duration:0.8
}}


className="

absolute

z-50

text-white

font-bold

text-xl

drop-shadow-lg

"

style={{

left:`${popup.x}%`,

top:`${popup.y}%`

}}


>

{popup.value}


</motion.div>


)

)
}


{
showLevelComplete &&

<motion.div


initial={{
opacity:0,
scale:0.5
}}


animate={{
opacity:1,
scale:1
}}


transition={{
duration:0.5
}}



className="

absolute

inset-0

z-[100]

flex

flex-col

items-center

justify-center

bg-black/50

text-white

"


>


<motion.div


animate={{

rotate:[0,5,-5,0]

}}


transition={{

duration:1,

repeat:Infinity

}}



className="text-6xl"

>

🎉

</motion.div>



<h2

className="

mt-5

text-4xl

font-bold

"

>

Level Complete ❤️

</h2>




<p

className="

mt-3

text-2xl

"

>

Score:

{" "}

{score}

</p>



<p

className="

mt-4

text-lg

text-white/80

"

>

Amazing shot! 💘

</p>



</motion.div>

}

      {
        !failed &&
        !completedRef.current &&

        <CupidArrow
          onShoot={
            handleShoot
          }
        />

      }



      {
        failed &&

        <div
          className="
            absolute
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/45
            p-6
          "
        >

          <div
            className="
              w-full
              max-w-sm
              rounded-3xl
              bg-white
              p-6
              text-center
              shadow-2xl
            "
          >

            <div
              className="
                mb-2
                text-4xl
              "
            >

              💘

            </div>


            <h2
              className="
                text-2xl
                font-bold
                text-purple-800
              "
            >

{
failureReason === "timeout"
?
"Time's Up!"
:
"Need More Points!"
}
</h2>


            <p
              className="
                mt-3
                text-gray-600
              "
            >

              Required score:

              {" "}

              <strong>
                {levelData.completionScore}
              </strong>

            </p>


            <p
              className="
                mt-1
                text-gray-600
              "
            >

              Your score:

              {" "}

              <strong>
                {score}
              </strong>

            </p>


            <button
              type="button"
              onClick={
                retry
              }
              className="
                mt-5
                rounded-xl
                bg-purple-700
                px-6
                py-3
                font-semibold
                text-white
              "
            >

              Try Again ❤️

            </button>

          </div>

        </div>

      }

    </div>

  );

}