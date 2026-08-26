import { useEffect, useState } from "react";

import {
  levelApi,
  foodApi,
  orderApi,
  type PoojaKitchenLevel,
  type PoojaKitchenFood,
  type PoojaKitchenOrder,
} from "./poojaKitchenApi";



export default function OrderEditor(){


  const [
    levels,
    setLevels
  ] = useState<PoojaKitchenLevel[]>([]);



  const [
    foods,
    setFoods
  ] = useState<PoojaKitchenFood[]>([]);



  const [
    selectedLevel,
    setSelectedLevel
  ] = useState<string>("");



  const [
    orders,
    setOrders
  ] = useState<PoojaKitchenOrder[]>([]);



  const [
    loading,
    setLoading
  ] = useState(true);



  const [
    newFood,
    setNewFood
  ] = useState("");



  const [
    quantity,
    setQuantity
  ] = useState(1);



  const [
    reward,
    setReward
  ] = useState(100);





  async function loadInitial(){

    try{

      const levelData =
        await levelApi.list();


      const foodData =
        await foodApi.list();


      setLevels(levelData);

      setFoods(foodData);



      if(levelData.length){

        setSelectedLevel(
          levelData[0].id
        );

      }

    }
    finally{

      setLoading(false);

    }

  }




  async function loadOrders(){

    if(!selectedLevel){

      return;

    }


    const data =
      await orderApi.list(
        selectedLevel
      );


    setOrders(data);

  }





  useEffect(()=>{

    loadInitial();

  },[]);




  useEffect(()=>{

    loadOrders();

  },[
    selectedLevel
  ]);





  async function createOrder(){


    if(!newFood){

      return;

    }



    await orderApi.create(

      selectedLevel,

      {

        food_id:newFood,

        quantity,

        reward_points:reward

      }

    );


    setNewFood("");

    setQuantity(1);

    setReward(100);


    await loadOrders();

  }





  async function deleteOrder(
    id:string
  ){

    await orderApi.delete(
      id
    );


    await loadOrders();

  }






  if(loading){

    return (
      <div>
        Loading orders...
      </div>
    );

  }






  return (

    <div className="space-y-6">


      <h2 className="text-xl font-bold">
        Pooja Kitchen Orders
      </h2>





      <div className="
        rounded-lg
        border
        p-4
        space-y-4
      ">


        <label>

          Select Level


          <select

            className="
              ml-3
              border
              rounded
              p-2
            "

            value={selectedLevel}

            onChange={
              e=>
              setSelectedLevel(
                e.target.value
              )
            }

          >

            {
              levels.map(level=>(

                <option
                  key={level.id}
                  value={level.id}
                >

                  Level {level.level_number}

                </option>

              ))

            }


          </select>


        </label>




        <div className="
          grid
          grid-cols-3
          gap-3
        ">



          <select

            className="
              border
              rounded
              p-2
            "

            value={newFood}

            onChange={
              e=>
              setNewFood(
                e.target.value
              )
            }

          >

            <option value="">
              Select Food
            </option>


            {
              foods.map(food=>(

                <option
                  key={food.id}
                  value={food.id}
                >

                  {food.name}

                </option>

              ))

            }


          </select>





          <input

            type="number"

            value={quantity}

            onChange={
              e=>
              setQuantity(
                Number(e.target.value)
              )
            }

            className="
              border
              rounded
              p-2
            "

            placeholder="Quantity"

          />





          <input

            type="number"

            value={reward}

            onChange={
              e=>
              setReward(
                Number(e.target.value)
              )
            }

            className="
              border
              rounded
              p-2
            "

            placeholder="Reward"

          />


        </div>




        <button

          onClick={createOrder}

          className="
            bg-purple-600
            text-white
            rounded
            px-4
            py-2
          "

        >

          Add Order

        </button>



      </div>








      <div className="space-y-3">


        {
          orders.map(order=>(


            <div

              key={order.id}

              className="
                border
                rounded-lg
                p-4
                flex
                justify-between
              "

            >


              <div>


                <div className="font-semibold">

                  {
                    order.food?.name
                    ??
                    order.food_id
                  }

                </div>


                <div>

                  Quantity:
                  {" "}
                  {order.quantity}

                </div>


                <div>

                  Reward:
                  {" "}
                  {order.reward_points}

                </div>


              </div>




              <button

                onClick={()=>
                  deleteOrder(
                    order.id
                  )
                }

                className="
                  bg-red-600
                  text-white
                  rounded
                  px-3
                  py-1
                "

              >

                Delete

              </button>



            </div>


          ))

        }


      </div>


    </div>

  );

}