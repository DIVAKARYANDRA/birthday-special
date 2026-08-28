import { useState } from "react";
import { setAuthTokens } from "../api/authToken";

interface Props {
  onSuccess: () => void;
}


export function PoojaKitchenLogin({
  onSuccess,
}: Props) {

  const [username,setUsername] =
    useState("");

  const [password,setPassword] =
    useState("");

  const [error,setError] =
    useState("");

  const [loading,setLoading] =
    useState(false);


  async function login(){

    try {

      setLoading(true);
      setError("");

      const response =
  await fetch(
`${import.meta.env.VITE_API_BASE_URL ?? "https://journey-to-my-heart-api.onrender.com"}/api/v1/games/pooja-kitchen/auth/login`,
        {
          method:"POST",

          headers:{
            "Content-Type":
            "application/json",
          },

          body:JSON.stringify({
            username,
            password,
          }),
        });


      if(!response.ok){
        throw new Error(
          "Invalid credentials"
        );
      }


      const data =
  await response.json();

console.log(
  "[PoojaKitchen Login] Response keys:",
  Object.keys(data)
);

console.log(
  "[PoojaKitchen Login] Has access_token:",
  !!data.access_token
);

setAuthTokens(
  data.access_token,
  data.refresh_token
);

      onSuccess();


    }catch(err){

      setError(
        err instanceof Error
        ? err.message
        :"Login failed"
      );

    }finally{

      setLoading(false);

    }

  }


return (

<div
className="
h-screen
w-screen
flex
items-center
justify-center
bg-[#1F4D45]
"
>

<div
className="
bg-white
rounded-3xl
p-8
w-80
"
>

<h1
className="
text-2xl
font-bold
mb-5
"
>
🍳 Pooja Kitchen
</h1>


<input
className="
border
p-3
rounded-xl
w-full
mb-3
"
placeholder="Username"
value={username}
onChange={
e=>setUsername(e.target.value)
}
/>


<input
className="
border
p-3
rounded-xl
w-full
mb-3
"
type="password"
placeholder="Password"
value={password}
onChange={
e=>setPassword(e.target.value)
}
/>


{
error &&
<p className="text-red-500 mb-2">
{error}
</p>
}


<button

onClick={login}

disabled={loading}

className="
bg-yellow-400
rounded-xl
px-5
py-3
w-full
font-bold
"

>

{
loading
?
"Entering Kitchen..."
:
"Start Cooking"
}

</button>


</div>

</div>

);

}