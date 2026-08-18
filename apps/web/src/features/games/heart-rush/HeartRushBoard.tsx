import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  motion,
} from "framer-motion";

import type {
  HeartRushLevel,
  HeartRushObject,
} from "./heartRushTypes";



interface HeartRushBoardProps {

  levelData:HeartRushLevel;

  onLevelComplete:(score:number)=>void;

}



interface FallingObject {

  id:string;

  config:HeartRushObject;

  x:number;

  y:number;

}



interface ScorePopup {

  id:string;

  x:number;

  y:number;

  value:string;

}



export default function HeartRushBoard(
{
  levelData,
  onLevelComplete

}:HeartRushBoardProps
){


  const [
    objects,
    setObjects
  ] =
  useState<FallingObject[]>([]);


  const [
    score,
    setScore
  ] =
  useState(0);


  const [
    timeRemaining,
    setTimeRemaining
  ] =
  useState(
    levelData.timeLimit
  );


  const [
    scorePopups,
    setScorePopups
  ] =
  useState<ScorePopup[]>([]);


  const [
    gameOver,
    setGameOver
  ] =
  useState(false);


  const scoreRef =
    useRef(0);


  const objectsRef =
    useRef<FallingObject[]>([]);


  const completedRef =
    useRef(false);


  const gameOverRef =
    useRef(false);


  const objectIdRef =
    useRef(0);


  const animationFrameRef =
    useRef<number | null>(null);


  const lastFrameTimeRef =
    useRef<number | null>(null);


  const spawnTimerRef =
    useRef<number | null>(null);



  // ==========================================================
  // Keep object ref synchronized
  // ==========================================================

  useEffect(()=>{

    objectsRef.current =
      objects;

  },[objects]);



  // ==========================================================
  // Reset whenever a new level arrives
  // ==========================================================

  useEffect(()=>{

    setObjects([]);

    setScore(0);

    setTimeRemaining(
      levelData.timeLimit
    );

    setScorePopups([]);

    setGameOver(false);


    scoreRef.current =
      0;


    objectsRef.current =
      [];


    completedRef.current =
      false;


    gameOverRef.current =
      false;


    objectIdRef.current =
      0;


    lastFrameTimeRef.current =
      null;


  },[levelData]);



  // ==========================================================
  // Finish level
  // ==========================================================

  const finishLevel =
    useCallback(
      (finalScore:number)=>{

        if(
          completedRef.current ||
          gameOverRef.current
        ){

          return;

        }


        if(
          finalScore <
          levelData.completionScore
        ){

          return;

        }


        completedRef.current =
          true;


        setObjects([]);

        objectsRef.current =
          [];


        onLevelComplete(
          finalScore
        );

      },
      [
        levelData.completionScore,
        onLevelComplete
      ]
    );



  // ==========================================================
  // Add score
  // ==========================================================

  const addScore =
    useCallback(
      (
        amount:number
      )=>{

        const newScore =
          scoreRef.current +
          amount;


        scoreRef.current =
          newScore;


        setScore(
          newScore
        );


        return newScore;

      },
      []
    );



  // ==========================================================
  // Score popup
  // ==========================================================

  const createScorePopup =
    useCallback(
      (
        x:number,
        y:number,
        value:string
      )=>{

        const popup:ScorePopup = {

          id:
            `${Date.now()}-${Math.random()}`,

          x,

          y,

          value

        };


        setScorePopups(
          previous=>[
            ...previous,
            popup
          ]
        );


        window.setTimeout(()=>{

          setScorePopups(
            previous=>
              previous.filter(
                item=>
                  item.id !==
                  popup.id
              )
          );

        },900);

      },
      []
    );



  // ==========================================================
  // Handle object collection
  // ==========================================================

  const collectObject =
    useCallback(
      (
        objectId:string
      )=>{

        if(
          completedRef.current ||
          gameOverRef.current
        ){

          return;

        }


        const object =
          objectsRef.current.find(
            item=>
              item.id === objectId
          );


        if(!object){

          return;

        }


        const behavior =
          object.config.behaviorType;


        let points =
          object.config.points;


        let popupText =
          "";


        // ----------------------------------------------------
        // Determine behavior
        // ----------------------------------------------------

        if(
          behavior === "bomb"
        ){

          points =
            -Math.abs(points);


          popupText =
            `${points} 💣`;

        }
        else if(
          behavior === "penalty"
        ){

          points =
            -Math.abs(points);


          popupText =
            `${points} 💔`;

        }
        else if(
          behavior === "bonus"
        ){

          points =
            Math.abs(points);


          popupText =
            `+${points} 💖`;

        }
        else{

          points =
            Math.abs(points);


          popupText =
            `+${points} ❤️`;

        }


        const newScore =
          addScore(
            points
          );


        createScorePopup(
          object.x,
          object.y,
          popupText
        );


        navigator.vibrate?.(
          behavior === "bomb"
            ? 100
            : 35
        );


        // ----------------------------------------------------
        // Remove collected object
        // ----------------------------------------------------

        setObjects(
          previous=>
            previous.filter(
              item=>
                item.id !== objectId
            )
        );


        objectsRef.current =
          objectsRef.current.filter(
            item=>
              item.id !== objectId
          );


        // ----------------------------------------------------
        // Completion is based on configured score
        // ----------------------------------------------------

        if(
          newScore >=
          levelData.completionScore
        ){

          finishLevel(
            newScore
          );

        }

      },
      [
        addScore,
        createScorePopup,
        finishLevel,
        levelData.completionScore
      ]
    );



  // ==========================================================
  // Spawn object
  // ==========================================================

  const spawnObject =
    useCallback(
      ()=>{

        if(
          completedRef.current ||
          gameOverRef.current
        ){

          return;

        }


        if(
          objectsRef.current.length >=
          levelData.maxObjects
        ){

          return;

        }


        const availableObjects =
          levelData.objects.filter(
            item=>
              true
          );


        if(
          availableObjects.length === 0
        ){

          return;

        }


        const config =
          availableObjects[
            Math.floor(
              Math.random() *
              availableObjects.length
            )
          ];


        objectIdRef.current += 1;


        const fallingObject:FallingObject = {

          id:
            `heart-rush-${objectIdRef.current}`,

          config,

          x:
            8 +
            Math.random() * 84,

          y:
            -12

        };


        objectsRef.current = [

          ...objectsRef.current,

          fallingObject

        ];


        setObjects(
          previous=>[
            ...previous,
            fallingObject
          ]
        );

      },
      [
        levelData.maxObjects,
        levelData.objects
      ]
    );



  // ==========================================================
  // Falling-object animation engine
  // ==========================================================

  useEffect(()=>{

    if(
      gameOver ||
      completedRef.current
    ){

      return;

    }


    lastFrameTimeRef.current =
      null;


    function animate(
      timestamp:number
    ){

      if(
        completedRef.current ||
        gameOverRef.current
      ){

        return;

      }


      if(
        lastFrameTimeRef.current === null
      ){

        lastFrameTimeRef.current =
          timestamp;

      }


      const elapsed =
        Math.min(
          timestamp -
          lastFrameTimeRef.current,
          50
        );


      lastFrameTimeRef.current =
        timestamp;


      const delta =
        elapsed / 16.67;


      let changed =
        false;


      const nextObjects =
        objectsRef.current.filter(
          object=>{

            const nextY =
              object.y +
              (
                object.config.fallSpeed *
                0.08 *
                delta
              );


            if(
              nextY > 112
            ){

              changed =
                true;

              return false;

            }


            if(
              nextY !== object.y
            ){

              changed =
                true;

            }


            object.y =
              nextY;


            return true;

          }
        );


      if(changed){

        objectsRef.current =
          nextObjects;


        setObjects(
          nextObjects
        );

      }


      animationFrameRef.current =
        window.requestAnimationFrame(
          animate
        );

    }


    animationFrameRef.current =
      window.requestAnimationFrame(
        animate
      );


    return ()=>{

      if(
        animationFrameRef.current !== null
      ){

        window.cancelAnimationFrame(
          animationFrameRef.current
        );

        animationFrameRef.current =
          null;

      }


      lastFrameTimeRef.current =
        null;

    };

  },[
    gameOver
  ]);



  // ==========================================================
  // Spawn engine
  // ==========================================================

  useEffect(()=>{

    if(
      gameOver ||
      completedRef.current
    ){

      return;

    }


    const frequency =
      Math.max(
        250,
        levelData.spawnFrequency
      );


    spawnTimerRef.current =
      window.setInterval(
        ()=>{

          spawnObject();

        },
        frequency
      );


    // Spawn the first object immediately.

    spawnObject();


    return ()=>{

      if(
        spawnTimerRef.current !== null
      ){

        window.clearInterval(
          spawnTimerRef.current
        );

        spawnTimerRef.current =
          null;

      }

    };

  },[
    gameOver,
    levelData.spawnFrequency,
    spawnObject
  ]);



  // ==========================================================
  // Timer
  // ==========================================================

  useEffect(()=>{

    if(
      gameOver ||
      completedRef.current
    ){

      return;

    }


    const timer =
      window.setInterval(()=>{

        setTimeRemaining(
          previous=>{

            if(
              previous <= 1
            ){

              window.clearInterval(
                timer
              );


              if(
                !completedRef.current
              ){

                gameOverRef.current =
                  true;


                setGameOver(
                  true
                );


                setObjects([]);

                objectsRef.current =
                  [];

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
    gameOver
  ]);



  // ==========================================================
  // Render
  // ==========================================================

  return (

    <div

      className="
        relative
        h-[600px]
        w-full
        overflow-hidden
        rounded-3xl
        bg-black/20
        select-none
        touch-none
      "

      style={{

        backgroundImage:
          levelData.image?.url
          ?
          `url(${levelData.image.url})`
          :
          undefined,

        backgroundSize:
          "cover",

        backgroundPosition:
          "center"

      }}

    >


      {/* Background overlay */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-black/20
        "
      />



      {/* Game HUD */}

      <div
        className="
          absolute
          left-4
          right-4
          top-4
          z-40
          flex
          items-center
          justify-between
          gap-3
        "
      >

        <div
          className="
            rounded-2xl
            bg-white/80
            px-4
            py-2
            text-lg
            font-bold
            text-purple-900
            shadow-lg
            backdrop-blur
          "
        >

          ❤️ {score}

        </div>


        <div
          className="
            rounded-2xl
            bg-white/80
            px-4
            py-2
            text-lg
            font-bold
            text-purple-900
            shadow-lg
            backdrop-blur
          "
        >

          ⏱ {timeRemaining}s

        </div>

      </div>



      {/* Falling objects */}

      {
        objects.map(
          object=>(

            <motion.button

              key={
                object.id
              }

              type="button"

              initial={{
                scale:0,
                opacity:0
              }}

              animate={{
                scale:1,
                opacity:1
              }}

              whileTap={{
                scale:0.8
              }}

              transition={{
                duration:0.15
              }}

              onPointerDown={
                event=>{

                  event.preventDefault();

                  collectObject(
                    object.id
                  );

                }
              }

              className="
                absolute
                z-30
                flex
                items-center
                justify-center
                border-0
                bg-transparent
                p-0
                outline-none
                touch-none
              "

              style={{

                left:
                  `${object.x}%`,

                top:
                  `${object.y}%`,

                width:
                  "clamp(52px, 12vw, 82px)",

                height:
                  "clamp(52px, 12vw, 82px)",

                transform:
                  "translate(-50%, -50%)"

              }}

              aria-label={
                object.config.name
              }

            >

              {
                object.config.visualType ===
                "image" &&
                object.config.media
                ?

                <img

                  src={
                    object.config.media.url
                  }

                  alt={
                    object.config.media.alt_text ??
                    object.config.name
                  }

                  draggable={false}

                  className="
                    h-full
                    w-full
                    rounded-full
                    object-cover
                    shadow-2xl
                    ring-4
                    ring-white/50
                  "

                />

                :

                <span
                  className="
                    text-5xl
                    drop-shadow-2xl
                  "
                >

                  {
                    object.config.emoji ??
                    "❤️"
                  }

                </span>

              }


            </motion.button>

          )
        )
      }



      {/* Score popups */}

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
                y:-45
              }}

              transition={{
                duration:0.8
              }}

              className="
                pointer-events-none
                absolute
                z-50
                text-xl
                font-bold
                text-white
                drop-shadow-lg
              "

              style={{

                left:
                  `${popup.x}%`,

                top:
                  `${popup.y}%`,

                transform:
                  "translate(-50%, -50%)"

              }}

            >

              {
                popup.value
              }

            </motion.div>

          )
        )
      }



      {/* Completion target indicator */}

      <div
        className="
          pointer-events-none
          absolute
          bottom-4
          left-1/2
          z-40
          -translate-x-1/2
          rounded-xl
          bg-black/40
          px-4
          py-2
          text-sm
          text-white
          backdrop-blur
        "
      >

        Target: {levelData.completionScore}

      </div>



      {/* Time-up overlay */}

      {
        gameOver &&

        <div
          className="
            absolute
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/55
            p-6
            backdrop-blur-sm
          "
        >

          <motion.div

            initial={{
              opacity:0,
              scale:0.8
            }}

            animate={{
              opacity:1,
              scale:1
            }}

            className="
              w-full
              max-w-sm
              rounded-3xl
              bg-white
              p-7
              text-center
              shadow-2xl
            "
          >

            <div
              className="
                text-5xl
              "
            >

              💘

            </div>


            <h2
              className="
                mt-4
                text-3xl
                font-bold
                text-purple-900
              "
            >

              Time's Up!

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

          </motion.div>

        </div>

      }

    </div>

  );

}