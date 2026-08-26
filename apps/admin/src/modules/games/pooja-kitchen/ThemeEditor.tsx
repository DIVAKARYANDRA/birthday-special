import { useEffect, useState } from "react";

import MediaSelector from "@/modules/media/MediaSelector";

import {
  themeApi,
  type PoojaKitchenTheme,
} from "./poojaKitchenApi";



export default function ThemeEditor() {



  const [
    themes,
    setThemes
  ] = useState<PoojaKitchenTheme[]>([]);



  const [
    loading,
    setLoading
  ] = useState(true);



  const [
    selectedTheme,
    setSelectedTheme
  ] = useState<PoojaKitchenTheme | null>(null);



  const [
    mediaOpen,
    setMediaOpen
  ] = useState(false);




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
              space-y-3
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



              onClick={()=>{

                setSelectedTheme(theme);

                setMediaOpen(true);

              }}



            >

              Assign Background


            </button>





          </div>


        ))

      }



{
  mediaOpen && selectedTheme && (

    <MediaSelector

      title="Select background for Pooja Kitchen"


      onClose={()=>{
        setMediaOpen(false);
        setSelectedTheme(null);
      }}


      onSelect={async(mediaId)=>{


        await themeApi.update(

          selectedTheme.id,

          {
            background_media_id: mediaId
          }

        );


        setMediaOpen(false);

        setSelectedTheme(null);


        await loadThemes();


        alert(
          "Background updated successfully"
        );


      }}

    />

  )
}





    </div>

  );

}