import { useEffect, useState } from "react";


import {
  customerApi,
  type PoojaKitchenCustomer,
} from "./poojaKitchenApi";



export default function CustomerEditor(){


  const [
    customers,
    setCustomers
  ] =
  useState<PoojaKitchenCustomer[]>([]);



  const [
    loading,
    setLoading
  ] =
  useState(true);




  async function loadCustomers(){


    try{

      const data =
        await customerApi.list();


      setCustomers(data);

    }
    finally{

      setLoading(false);

    }

  }




  useEffect(()=>{

    loadCustomers();

  },[]);




  async function assignMedia(

    customerId:string,

    field:
      |"avatar_media_id"
      |"happy_media_id"
      |"angry_media_id"

  ){



    const mediaId =
      window.prompt(
        `Enter ${field} media UUID`
      );



    if(!mediaId){

      return;

    }



    await customerApi.update(

      customerId,

      {
        [field]:
          mediaId
      }

    );


    await loadCustomers();

  }





  if(loading){

    return (
      <div>
        Loading customers...
      </div>
    );

  }




  return (

    <div className="space-y-4">


      <h2 className="text-xl font-bold">
        Pooja Kitchen Customers
      </h2>



      {
        customers.map(customer=>(


          <div

            key={customer.id}

            className="
              rounded-lg
              border
              p-4
              space-y-3
            "

          >


            <h3 className="font-semibold">

              {customer.name}

            </h3>




            <button

              className="
                rounded
                bg-blue-600
                px-3
                py-2
                text-white
              "

              onClick={()=>assignMedia(
                customer.id,
                "avatar_media_id"
              )}

            >

              Assign Normal Avatar

            </button>



            <button

              className="
                rounded
                bg-green-600
                px-3
                py-2
                text-white
              "

              onClick={()=>assignMedia(
                customer.id,
                "happy_media_id"
              )}

            >

              Assign Happy Avatar

            </button>




            <button

              className="
                rounded
                bg-red-600
                px-3
                py-2
                text-white
              "

              onClick={()=>assignMedia(
                customer.id,
                "angry_media_id"
              )}

            >

              Assign Angry Avatar

            </button>



          </div>


        ))

      }


    </div>

  );

}