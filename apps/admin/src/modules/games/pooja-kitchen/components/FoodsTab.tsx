import { useEffect, useState } from "react";

import {
  foodApi,
  type PoojaKitchenFood,
} from "../poojaKitchenApi";



export default function FoodsTab() {


  const [foods, setFoods] =
    useState<PoojaKitchenFood[]>([]);


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState<string | null>(null);



  useEffect(
    () => {

      loadFoods();

    },
    []
  );



  async function loadFoods() {

    try {

      setLoading(true);

      const data =
        await foodApi.list();


      setFoods(data);

    }
    catch (err) {

      console.error(
        "Failed to load foods",
        err
      );

      setError(
        "Failed to load foods"
      );

    }
    finally {

      setLoading(false);

    }

  }



  if (loading) {

    return (
      <div>
        Loading foods...
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
        Kitchen Foods
      </h2>



      {
        foods.length === 0 && (

          <p>
            No foods available.
          </p>

        )
      }



      {
        foods.map(
          (food) => (

            <div

              key={food.id}

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
                {food.name}
              </h3>



              <p>

                <strong>
                  Cook Time:
                </strong>

                {" "}

                {food.cook_time}
                {" seconds"}

              </p>



              <p>

                <strong>
                  Sell Price:
                </strong>

                {" "}

                {food.sell_price}

              </p>



              <p>

                <strong>
                  Image Media ID:
                </strong>

                {" "}

                {
                  food.image_media_id
                    ??
                    "Not assigned"
                }

              </p>


            </div>

          )
        )
      }


    </div>

  );

}