import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { mediaApi } from "@/api/mediaApi";
import { getCloudinaryUrl } from "@/utils/mediaUrl";


interface Props {

  title: string;

  onSelect: (mediaId: string) => Promise<void>;

  onClose: () => void;

  usage?: string;

  category?: string;

}



export default function MediaSelector({

  title,

  onSelect,

  onClose,

  usage = "game",

  category = "pooja-kitchen",

}: Props) {


  const [selecting, setSelecting] =
    useState(false);



  const {
    data: media = [],
    isLoading

  } = useQuery({

    queryKey: [
      "media-selector",
      usage,
      category
    ],

    queryFn: () =>
      mediaApi.list(),

  });





  const filtered =
    media.filter(

      (item) =>

        item.media_type === "image"

        &&

        item.usage === usage

        &&

        item.category === category

    );





  async function handleSelect(
    mediaId: string
  ){

    try{

      setSelecting(true);

      await onSelect(mediaId);

    }
    finally{

      setSelecting(false);

    }

  }





  if(isLoading){

    return (

      <div
        className="
        fixed
        inset-0
        bg-black/50
        flex
        items-center
        justify-center
        z-50
        "
      >

        <div
          className="
          bg-white
          rounded-xl
          p-6
          "
        >

          Loading media...

        </div>


      </div>

    );

  }





  return (

    <div

      className="
      fixed
      inset-0
      bg-black/50
      flex
      items-center
      justify-center
      z-50
      "

    >



      <div

        className="
        bg-white
        rounded-xl
        p-6
        w-[700px]
        max-h-[80vh]
        overflow-auto
        "

      >



        {/* Header */}

        <div
          className="
          flex
          justify-between
          items-center
          mb-4
          "
        >


          <h2
            className="
            text-xl
            font-bold
            "
          >

            {title}

          </h2>



          <button

            onClick={onClose}

            disabled={selecting}

            className="
            rounded
            bg-gray-200
            px-3
            py-1
            text-sm
            "

          >

            Close

          </button>


        </div>





        {
          filtered.length === 0 && (

            <div
              className="
              text-center
              text-gray-500
              py-10
              "
            >

              No matching media found.

            </div>

          )
        }





        <div

          className="
          grid
          grid-cols-3
          gap-4
          "

        >



          {
            filtered.map(

              (media) => (


                <button


                  key={media.id}


                  disabled={selecting}


                  onClick={() =>
                    handleSelect(
                      media.id
                    )
                  }


                  className="
                  border
                  rounded-lg
                  overflow-hidden
                  hover:ring-2
                  hover:ring-purple-600
                  disabled:opacity-50
                  "

                >



                  <img


                    src={
                      getCloudinaryUrl(
                        media.external_reference
                      )
                    }


                    alt={
                      media.alt_text ??
                      "media"
                    }


                    className="
                    w-full
                    h-32
                    object-cover
                    "


                  />



                  <div

                    className="
                    p-2
                    text-xs
                    "

                  >

                    {
                      selecting
                      ?
                      "Saving..."
                      :
                      "Select"
                    }


                  </div>



                </button>


              )

            )

          }



        </div>



      </div>



    </div>

  );

}