import { useEffect, useState } from "react";

import {
  levelApi,
  type PoojaKitchenLevel,
} from "../poojaKitchenApi";



export default function LevelsTab() {


  const [levels, setLevels] =
    useState<PoojaKitchenLevel[]>([]);


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState<string | null>(null);



  useEffect(
    () => {

      loadLevels();

    },
    []
  );



  async function loadLevels() {

    try {

      setLoading(true);


      const data =
        await levelApi.list();


      setLevels(data);

    }
    catch (err) {

      console.error(
        "Failed to load levels",
        err
      );


      setError(
        "Failed to load levels"
      );

    }
    finally {

      setLoading(false);

    }

  }



  if (loading) {

    return (
      <div>
        Loading levels...
      </div>
    );

  }



  if (error) {

    return (
      <div>
        {error}
      </div>
    );

  }



  return (

    <div>

      <h2>
        Kitchen Levels
      </h2>



      {
        levels.length === 0 && (

          <p>
            No levels configured.
          </p>

        )
      }



      {
        levels.map(
          (level) => (

            <div

              key={level.id}

              style={{
                border:
                  "1px solid #ddd",

                borderRadius:
                  "0.5rem",

                padding:
                  "1rem",

                marginBottom:
                  "1rem",

                background:
                  "#fff",
              }}

            >

              <h3>

                Level {level.level_number}

              </h3>



              <p>

                <strong>
                  Difficulty:
                </strong>

                {" "}

                {level.difficulty}

              </p>



              <p>

                <strong>
                  Time Limit:
                </strong>

                {" "}

                {level.time_limit}

                {" seconds"}

              </p>



              <p>

                <strong>
                  Target Score:
                </strong>

                {" "}

                {level.target_score}

              </p>



              <p>

                <strong>
                  Customers:
                </strong>

                {" "}

                {level.customer_count}

              </p>



              <p>

                <strong>
                  Theme:
                </strong>

                {" "}

                {level.theme_id}

              </p>


            </div>

          )
        )
      }


    </div>

  );

}