import {
  useEffect,
  useState,
} from "react";


import {
  getGameGift,
} from "@/features/games/shared/gifts";


import {
  getGameProgress,
  updateGameProgress,
} from "@/features/games/shared/gameStorage";


import {
  getCupidArrowLevel,
} from "@/features/games/cupid-arrow/cupidArrowApi";


import type {
  CupidArrowLevel,
} from "@/features/games/cupid-arrow/cupidArrowTypes";


import GamePasswordGate from "@/features/games/shared/GamePasswordGate";

import GameHeader from "@/features/games/shared/GameHeader";

import GameMusicPlayer from "@/features/games/shared/GameMusicPlayer";

import GiftReveal from "@/features/games/shared/GiftReveal";


import SceneLayout from "@/components/global/SceneLayout";

import Breadcrumb from "@/components/ui/Breadcrumb";


import CupidArrowBoard
from "@/features/games/cupid-arrow/CupidArrowBoard";



export default function CupidArrowScene(){


  const gameId =
    "cupid-arrow";


  const progress =
    getGameProgress(
      gameId
    );


  const [
    level,
    setLevel
  ]
  =
  useState(
    progress.level
  );


  const [
    totalScore,
    setTotalScore
  ]
  =
  useState(
    progress.score
  );


  const [
    completed,
    setCompleted
  ]
  =
  useState(false);


  const [
    currentLevelData,
    setCurrentLevelData
  ]
  =
  useState<CupidArrowLevel | null>(
    null
  );


  const [
    loading,
    setLoading
  ]
  =
  useState(true);


  const [
    loadError,
    setLoadError
  ]
  =
  useState(false);



  useEffect(()=>{

    let cancelled = false;


    async function loadLevel(){

      setLoading(true);

      setLoadError(false);

      setCurrentLevelData(null);


      try{

        const data =
          await getCupidArrowLevel(
            level
          );


        if(cancelled)
          return;


        setCurrentLevelData(
          data
        );

      }
      catch(error){

        console.error(
          "Cupid Arrow level loading failed",
          error
        );


        if(!cancelled){

          setLoadError(
            true
          );

        }

      }
      finally{

        if(!cancelled){

          setLoading(
            false
          );

        }

      }

    }


    void loadLevel();


    return ()=>{

      cancelled=true;

    };


  },[level]);



  function handleLevelComplete(
    score:number
  ){

    if(!currentLevelData)
      return;


    const updatedScore =
      totalScore +
      score;


    setTotalScore(
      updatedScore
    );


    if(
      currentLevelData.isFinalLevel
    ){

      updateGameProgress(

        gameId,

        {

          level:
          level,

          score:
          updatedScore

        }

      );


      setCompleted(
        true
      );


      return;

    }



    const nextLevel =
      level + 1;


    updateGameProgress(

      gameId,

      {

        level:
        nextLevel,

        score:
        updatedScore

      }

    );


    setLevel(
      nextLevel
    );

  }



  function resetGame(){

    sessionStorage.removeItem(
      `game-progress-${gameId}`
    );


    window.location.reload();

  }



  function retryLevel(){

    setCurrentLevelData(
      null
    );

    setLoading(
      true
    );

    setLoadError(
      false
    );


    /*
     Changing the level is intentionally
     avoided here because retrying should
     reload the same Admin-configured level.
    */

    setTimeout(()=>{

      void getCupidArrowLevel(
        level
      )
      .then(
        data=>{

          setCurrentLevelData(
            data
          );

          setLoading(
            false
          );

        }
      )
      .catch(
        error=>{

          console.error(
            "Cupid Arrow retry failed",
            error
          );

          setLoadError(
            true
          );

          setLoading(
            false
          );

        }
      );

    },50);

  }



  return (

    <SceneLayout mode="twilight">


      <Breadcrumb
        label="Cupid Arrow 💘"
      />



      <GamePasswordGate
        gameId={gameId}
      >


        <div
          className="
            flex
            flex-1
            flex-col
            overflow-y-auto
            px-5
            pb-20
            pt-6
          "
        >


          <GameHeader

             level={
    currentLevelData?.level ?? level
  }

            totalScore={
              totalScore
            }

            music={

              <GameMusicPlayer
                gameId={gameId}
              />

            }

            onReset={
              resetGame
            }

          />



          {
            completed

            ?

            (

              <GiftReveal
                gift={
                  getGameGift(
                    gameId
                  )
                }
              />

            )

            :

            (

              <>

                <h1
                  className="
                    mb-6
                    text-center
                    text-3xl
                    font-semibold
                    text-white
                  "
                >

                  🏹 Cupid Arrow Challenge 💘

                </h1>



                {
                  loading &&

                  <p
                    className="
                      text-center
                      text-white/60
                    "
                  >

                    Preparing Cupid arrows ❤️

                  </p>

                }



                {
                  !loading &&
                  loadError &&

                  <div
                    className="
                      mx-auto
                      mt-8
                      max-w-md
                      rounded-2xl
                      bg-white/10
                      p-6
                      text-center
                      text-white
                    "
                  >

                    <p className="mb-4">

                      Cupid could not prepare
                      this level. ❤️

                    </p>


                    <button
                      type="button"
                      onClick={
                        retryLevel
                      }
                      className="
                        rounded-xl
                        bg-white
                        px-5
                        py-2
                        font-semibold
                        text-purple-700
                      "
                    >

                      Try Again

                    </button>

                  </div>

                }



                {
                  !loading &&
                  !loadError &&
                  currentLevelData &&
                  currentLevelData.targets.length > 0 &&

                  <CupidArrowBoard

                    levelData={
                      currentLevelData
                    }

                    onLevelComplete={
                      handleLevelComplete
                    }

                  />

                }



                {
                  !loading &&
                  !loadError &&
                  currentLevelData &&
                  currentLevelData.targets.length === 0 &&

                  <p
                    className="
                      mt-8
                      text-center
                      text-white/60
                    "
                  >

                    Cupid is preparing more
                    surprises ❤️

                  </p>

                }

              </>

            )

          }


        </div>


      </GamePasswordGate>


    </SceneLayout>

  );

}