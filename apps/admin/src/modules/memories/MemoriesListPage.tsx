import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { memoriesApi } from "@/api/memoriesApi";
import { mediaApi } from "@/api/mediaApi";


export default function MemoriesListPage() {

  const [selectedMemory,setSelectedMemory] =
    useState<string | null>(null);

  const [selectedMedia,setSelectedMedia] =
    useState<string>("");


  const memoriesQuery = useQuery({
    queryKey:["memories"],
    queryFn: memoriesApi.list,
  });


  const mediaQuery = useQuery({
    queryKey:["media"],
    queryFn: mediaApi.list,
  });


  async function attach(){

    if(!selectedMemory || !selectedMedia){
      return;
    }


    await memoriesApi.attachMediaItem(
      selectedMemory,
      {
        media_asset_id:selectedMedia,
        display_order:0,
      },
    );


    alert("Image attached successfully");

  }


  return (

    <div className="space-y-6 p-6">

      <h1 className="text-2xl font-semibold">
        Memories
      </h1>


      <div className="rounded-xl border p-5">

        <h2 className="mb-4 font-semibold">
          Attach Image To Memory
        </h2>


        <select
          className="mb-3 w-full rounded border p-2"
          onChange={(e)=>
            setSelectedMemory(e.target.value)
          }
        >

          <option value="">
            Select Memory
          </option>


          {
            memoriesQuery.data?.map(
              memory=>(
                <option
                  key={memory.id}
                  value={memory.id}
                >
                  {memory.title}
                </option>
              )
            )
          }

        </select>



        <select
          className="mb-3 w-full rounded border p-2"
          onChange={(e)=>
            setSelectedMedia(e.target.value)
          }
        >

          <option value="">
            Select Image
          </option>


          {
            mediaQuery.data
              ?.filter(
                m=>m.media_type==="image"
              )
              .map(
                media=>(
                  <option
                    key={media.id}
                    value={media.id}
                  >
                    {media.original_filename}
                  </option>
                )
              )
          }

        </select>


        <button
          onClick={attach}
          className="
          rounded
          bg-purple-700
          px-5
          py-2
          text-white
          "
        >
          Attach Image
        </button>


      </div>


      <div>

        <h2 className="mb-3 font-semibold">
          Existing Memories
        </h2>


        {
          memoriesQuery.data?.map(
            memory=>(
              <div
                key={memory.id}
                className="
                rounded-lg
                border
                p-4
                mb-3
                "
              >

                <h3>
                  {memory.title}
                </h3>

                <p className="text-sm text-gray-500">
                  {memory.category}
                </p>

              </div>
            )
          )
        }

      </div>


    </div>

  );

}