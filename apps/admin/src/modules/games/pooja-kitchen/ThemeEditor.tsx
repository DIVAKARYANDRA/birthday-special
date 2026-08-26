import { useEffect, useState } from "react";

import {
  themeApi,
  type PoojaKitchenTheme,
} from "./poojaKitchenApi";


export default function ThemeEditor() {


  const [themes,setThemes] =
    useState<PoojaKitchenTheme[]>([]);


  const [loading,setLoading] =
    useState(true);



  async function loadThemes(){

    try{

      const data =
        await themeApi.list();

      setThemes(data);

    }
    finally{

      setLoading(false);

    }

  }



  useEffect(()=>{

    loadThemes();

  },[]);



  async function updateBackground(
    themeId:string
  ){


    const mediaId =
      window.prompt(
        "Enter uploaded Media Asset UUID"
      );


    if(!mediaId){
      return;
    }



    await themeApi.update(
      themeId,
      {
        background_media_id:
          mediaId
      }
    );


    await loadThemes();

  }



  if(loading){

    return (
      <div>
        Loading themes...
      </div>
    );

  }



  return (

    <div className="space-y-4">


      <h2 className="text-xl font-bold">
        Pooja Kitchen Themes
      </h2>



      {
        themes.map(theme=>(


          <div
            key={theme.id}
            className="
              rounded-lg
              border
              p-4
              space-y-2
            "
          >


            <h3 className="font-semibold">
              {theme.name}
            </h3>


            <p>
              {theme.description}
            </p>



            <p className="text-sm">
              Background Media:
              {" "}
              {
                theme.background_media_id
                ??
                "Not assigned"
              }
            </p>



            <button

              className="
                rounded
                bg-purple-600
                px-3
                py-2
                text-white
              "

              onClick={()=> 
                updateBackground(theme.id)
              }

            >

              Assign Background

            </button>


          </div>


        ))
      }


    </div>

  );

}