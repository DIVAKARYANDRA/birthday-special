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
  getHeartRushLevel,
} from "@/features/games/heart-rush/heartRushApi";


import type {
  HeartRushLevel,
} from "@/features/games/heart-rush/heartRushTypes";


import HeartRushBoard
from "@/features/games/heart-rush/HeartRushBoard";


import GamePasswordGate
from "@/features/games/shared/GamePasswordGate";


import GameHeader
from "@/features/games/shared/GameHeader";


import GameMusicPlayer
from "@/features/games/shared/GameMusicPlayer";


import GiftReveal
from "@/features/games/shared/GiftReveal";


import SceneLayout
from "@/components/global/SceneLayout";


import Breadcrumb
from "@/components/ui/Breadcrumb";



export default function HeartRushScene(){


  const gameId =
    "heart-rush";


  const progress =
    getGameProgress(
      gameId
    );


  const [
    level,
    setLevel
  ] =
  useState(
    progress.level
  );


  const [
    totalScore,
    setTotalScore
  ] =
  useState(
    progress.score
  );


  const [
    completed,
    setCompleted
  ] =
  useState(false);


  const [
    currentLevelData,
    setCurrentLevelData
  ] =
  useState<HeartRushLevel | null>(
    null
  );


  const [
    loading,
    setLoading
  ] =
  useState(true);


  const [
    loadError,
    setLoadError
  ] =
  useState(false);



  // ==========================================================
  // Load level
  // ==========================================================

  useEffect(()=>{

    let cancelled = false;


    async function loadLevel(){

      setLoading(true);

      setLoadError(false);

      setCurrentLevelData(null);


      try{

        const data =
          await getHeartRushLevel(
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
          "Heart Rush level loading failed",
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

      cancelled = true;

    };

  },[level]);



  // ==========================================================
  // Level completion
  // ==========================================================

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



  // ==========================================================
  // Reset complete game
  // ==========================================================

  function resetGame(){

    sessionStorage.removeItem(
      `game-progress-${gameId}`
    );


    window.location.reload();

  }



  // ==========================================================
  // Retry current level
  // ==========================================================

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


    void getHeartRushLevel(
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
          "Heart Rush retry failed",
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

  }



  return (

    <SceneLayout
      mode="twilight"
    >


      <Breadcrumb
        label="Heart Rush ❤️"
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
              level
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

                  ❤️ Heart Rush

                </h1>



                {
                  loading &&

                  <p
                    className="
                      text-center
                      text-white/60
                    "
                  >

                    Preparing Heart Rush ❤️

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

                    <p
                      className="
                        mb-4
                      "
                    >

                      Cupid could not prepare
                      this Heart Rush level. ❤️

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

                  <HeartRushBoard

                    levelData={
                      currentLevelData
                    }

                    onLevelComplete={
                      handleLevelComplete
                    }

                  />

                }

              </>

            )

          }


        </div>


      </GamePasswordGate>


    </SceneLayout>

  );

}