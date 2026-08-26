import { useEffect, useState } from "react";

import {
  foodApi,
  type PoojaKitchenFood,
} from "./poojaKitchenApi";


export default function FoodEditor() {


  const [foods,setFoods] =
    useState<PoojaKitchenFood[]>([]);


  const [loading,setLoading] =
    useState(true);



  async function loadFoods(){

    try{

      const data =
        await foodApi.list();

      setFoods(data);

    }
    finally{

      setLoading(false);

    }

  }



  useEffect(()=>{

    loadFoods();

  },[]);



  async function assignImage(
    foodId:string
  ){


    const mediaId =
      window.prompt(
        "Enter uploaded Media Asset UUID"
      );


    if(!mediaId){

      return;

    }



    await foodApi.update(

      foodId,

      {
        image_media_id:
          mediaId
      }

    );


    await loadFoods();

  }




  if(loading){

    return (
      <div>
        Loading foods...
      </div>
    );

  }



  return (

    <div className="space-y-4">


      <h2 className="text-xl font-bold">
        Pooja Kitchen Foods
      </h2>



      {
        foods.map(food=>(


          <div

            key={food.id}

            className="
              rounded-lg
              border
              p-4
              space-y-2
            "

          >


            <h3 className="font-semibold">
              {food.name}
            </h3>



            <div>
              Cook time:
              {" "}
              {food.cook_time}
              {" "}
              seconds
            </div>



            <div>
              Sell price:
              {" "}
              {food.sell_price}
            </div>



            <div className="text-sm">

              Image Media:
              {" "}

              {
                food.image_media_id
                ??
                "Not assigned"
              }

            </div>



            <button

              className="
                rounded
                bg-green-600
                px-3
                py-2
                text-white
              "

              onClick={()=>assignImage(food.id)}

            >

              Assign Food Image

            </button>


          </div>


        ))

      }


    </div>

  );

}