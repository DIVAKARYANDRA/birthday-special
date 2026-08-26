import { useEffect, useState } from "react";

import {
  levelApi,
  type PoojaKitchenLevel,
} from "./poojaKitchenApi";



export default function LevelEditor(){


  const [
    levels,
    setLevels
  ] =
  useState<PoojaKitchenLevel[]>([]);



  const [
    loading,
    setLoading
  ] =
  useState(true);




  async function loadLevels(){

    try{

      const data =
        await levelApi.list();

      setLevels(data);

    }
    finally{

      setLoading(false);

    }

  }



  useEffect(()=>{

    loadLevels();

  },[]);





  async function updateLevel(
    level:PoojaKitchenLevel
  ){



    await levelApi.update(

      level.id,

      {

        difficulty:
          level.difficulty,


        time_limit:
          level.time_limit,


        target_score:
          level.target_score,


        customer_count:
          level.customer_count,


        unlock_level:
          level.unlock_level

      }

    );


    await loadLevels();

  }






  function updateLocal(

    id:string,

    field:string,

    value:any

  ){


    setLevels(
      previous =>

      previous.map(level =>

        level.id === id

        ?

        {
          ...level,
          [field]:
            value
        }

        :

        level

      )

    );

  }






  if(loading){

    return (
      <div>
        Loading levels...
      </div>
    );

  }





  return (

    <div className="space-y-5">


      <h2 className="text-xl font-bold">

        Pooja Kitchen Levels

      </h2>



      {
        levels.map(level=>(


          <div

            key={level.id}

            className="
              rounded-lg
              border
              p-5
              space-y-3
            "

          >


            <h3 className="font-semibold">

              Level {level.level_number}

            </h3>



            <label>

              Difficulty

              <select

                className="
                  ml-2
                  border
                  rounded
                  p-1
                "

                value={
                  level.difficulty
                }

                onChange={
                  e=>
                  updateLocal(
                    level.id,
                    "difficulty",
                    e.target.value
                  )
                }

              >

                <option value="easy">
                  Easy
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="hard">
                  Hard
                </option>


              </select>


            </label>




            <label className="block">

              Time Limit

              <input

                type="number"

                className="
                  ml-2
                  border
                  rounded
                  p-1
                "

                value={
                  level.time_limit
                }

                onChange={
                  e=>
                  updateLocal(
                    level.id,
                    "time_limit",
                    Number(
                      e.target.value
                    )
                  )
                }

              />

              seconds

            </label>





            <label className="block">

              Target Score

              <input

                type="number"

                className="
                  ml-2
                  border
                  rounded
                  p-1
                "

                value={
                  level.target_score
                }


                onChange={
                  e=>
                  updateLocal(
                    level.id,
                    "target_score",
                    Number(
                      e.target.value
                    )
                  )
                }

              />

            </label>





            <label className="block">

              Customers

              <input

                type="number"

                className="
                  ml-2
                  border
                  rounded
                  p-1
                "

                value={
                  level.customer_count
                }


                onChange={
                  e=>
                  updateLocal(
                    level.id,
                    "customer_count",
                    Number(
                      e.target.value
                    )
                  )
                }

              />


            </label>






            <button

              className="
                rounded
                bg-purple-600
                px-4
                py-2
                text-white
              "


              onClick={()=>
                updateLevel(level)
              }


            >

              Save Level

            </button>



          </div>


        ))

      }


    </div>

  );

}