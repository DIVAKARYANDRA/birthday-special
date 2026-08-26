import { useEffect, useState } from "react";

import MediaSelector from "@/modules/media/MediaSelector";
import {
  foodApi,
  type PoojaKitchenFood,
} from "./poojaKitchenApi";


export default function FoodEditor() {


  const [
    foods,
    setFoods
  ] = useState<PoojaKitchenFood[]>([]);



  const [
    loading,
    setLoading
  ] = useState(true);



  const [
    selectedFood,
    setSelectedFood
  ] = useState<PoojaKitchenFood | null>(null);



  const [
    mediaOpen,
    setMediaOpen
  ] = useState(false);




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
              space-y-3
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


              onClick={()=>{

                setSelectedFood(food);

                setMediaOpen(true);

              }}

            >

              Assign Food Image

            </button>



          </div>


        ))

      }




      {
        mediaOpen && selectedFood && (

          <MediaSelector


            title={
              `Select image for ${selectedFood.name}`
            }



            onSelect={
              async(mediaId)=>{


                await foodApi.update(

                  selectedFood.id,

                  {

                    image_media_id:
                      mediaId

                  }

                );


                setMediaOpen(false);

                setSelectedFood(null);


                loadFoods();


              }

            }


          />

        )
      }



    </div>

  );

}