import { useEffect, useState } from "react";
import MediaSelector from "@/modules/media/MediaSelector";
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

const [mediaTarget, setMediaTarget] = useState<
  "avatar" | "happy" | "angry" | null
>(null);

const [
 selectedCustomer,
 setSelectedCustomer
] = useState<PoojaKitchenCustomer | null>(null);

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
onClick={()=>{
  setSelectedCustomer(customer);
  setMediaTarget("avatar");
}}
className="
bg-blue-600
text-white
px-3
py-2
rounded
"
>
Assign Normal Avatar
</button>



<button
onClick={()=>{
  setSelectedCustomer(customer);
  setMediaTarget("happy");
}}
className="
bg-green-600
text-white
px-3
py-2
rounded
"
>
Assign Happy Avatar
</button>



<button
onClick={()=>{
  setSelectedCustomer(customer);
  setMediaTarget("angry");
}}
className="
bg-red-600
text-white
px-3
py-2
rounded
"
>
Assign Angry Avatar
</button>


          </div>


        ))

      }

    {
mediaTarget && (

<MediaSelector

title={
`Select ${mediaTarget} avatar`
}

onClose={()=>{

setMediaTarget(null);

setSelectedCustomer(null);

}}



onSelect={
async(mediaId)=>{

if(!selectedCustomer){
  return;
}

await customerApi.update(

selectedCustomer.id,

{

[`${mediaTarget}_media_id`]:
mediaId

}

);


setMediaTarget(null);

setSelectedCustomer(null);

loadCustomers();

}

}

/>

)

}


    </div>

  );

}