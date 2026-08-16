import { useState } from "react";
import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { memoriesApi } from "@/api/memoriesApi";
import type {
  MemoryRead,
  MemoryCreate,
} from "@/api/memoriesApi";

import { mediaApi } from "@/api/mediaApi";
import type {
  MediaAssetRead,
} from "@/api/mediaApi";


export default function MemoriesListPage() {

  const queryClient = useQueryClient();


  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [story, setStory] =
    useState("");

  const [memoryDate, setMemoryDate] =
    useState("");

  const [category, setCategory] =
    useState("special_moment");


  const [selectedMemory, setSelectedMemory] =
    useState<string>("");

  const [selectedMedia, setSelectedMedia] =
    useState<string>("");



  const memoriesQuery = useQuery<MemoryRead[]>({
    queryKey: ["memories"],
    queryFn: () => memoriesApi.list(),
  });



  const mediaQuery = useQuery<MediaAssetRead[]>({
    queryKey: ["media"],
    queryFn: () => mediaApi.list(),
  });



  async function createMemory() {

    const payload: MemoryCreate = {
      title,
      description,
      story,
      memory_date: memoryDate,
      category,
      importance: "notable",
    };


    await memoriesApi.create(payload);


    alert(
      "Memory created successfully",
    );


    setTitle("");
    setDescription("");
    setStory("");
    setMemoryDate("");


    queryClient.invalidateQueries({
      queryKey: ["memories"],
    });

  }




  async function attachImage() {

    if (
      !selectedMemory ||
      !selectedMedia
    ) {
      return;
    }


    await memoriesApi.attachMediaItem(
      selectedMemory,
      {
        media_asset_id: selectedMedia,
        display_order: 0,
      },
    );


    alert(
      "Image attached successfully",
    );

  }




  async function publishMemory(
    id: string,
  ) {

    await memoriesApi.publish(id);


    alert(
      "Memory published",
    );


    queryClient.invalidateQueries({
      queryKey: ["memories"],
    });

  }



  return (

    <div className="space-y-6 p-6">


      <h1 className="text-2xl font-semibold">
        Memories
      </h1>



      {/* CREATE MEMORY */}

      <div className="rounded-xl border p-5">

        <h2 className="mb-4 font-semibold">
          Create New Memory
        </h2>


        <input
          className="mb-3 w-full rounded border p-2"
          placeholder="Title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
        />


        <textarea
          className="mb-3 w-full rounded border p-2"
          placeholder="Description"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
        />


        <textarea
          className="mb-3 w-full rounded border p-2"
          placeholder="Story"
          value={story}
          onChange={(e) =>
            setStory(e.target.value)
          }
        />


        <input
          type="date"
          className="mb-3 w-full rounded border p-2"
          value={memoryDate}
          onChange={(e) =>
            setMemoryDate(e.target.value)
          }
        />



        <select
          className="mb-3 w-full rounded border p-2"
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
        >

          <option value="special_moment">
            Special Moment
          </option>

          <option value="trip">
            Trip
          </option>

          <option value="anniversary">
            Anniversary
          </option>

          <option value="random_sweet_moment">
            Random Sweet Moment
          </option>

        </select>



        <button
          onClick={createMemory}
          className="
            rounded
            bg-purple-700
            px-5
            py-2
            text-white
          "
        >
          Create Memory
        </button>


      </div>




      {/* ATTACH IMAGE */}


      <div className="rounded-xl border p-5">


        <h2 className="mb-4 font-semibold">
          Attach Image To Memory
        </h2>



        <select
          className="mb-3 w-full rounded border p-2"
          value={selectedMemory}
          onChange={(e) =>
            setSelectedMemory(
              e.target.value,
            )
          }
        >

          <option value="">
            Select Memory
          </option>


          {
            memoriesQuery.data?.map(
              (memory) => (

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
          value={selectedMedia}
          onChange={(e) =>
            setSelectedMedia(
              e.target.value,
            )
          }
        >

          <option value="">
            Select Image
          </option>


          {
            mediaQuery.data
              ?.filter(
                (media) =>
                  media.media_type === "image",
              )
              .map(
                (media) => (

                  <option
                    key={media.id}
                    value={media.id}
                  >
                    {
                      media.original_filename
                    }
                  </option>

                )
              )
          }


        </select>



        <button
          onClick={attachImage}
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





      {/* EXISTING MEMORIES */}


      <div>

        <h2 className="mb-3 font-semibold">
          Existing Memories
        </h2>



        {
          memoriesQuery.data?.map(
            (memory) => (

              <div
                key={memory.id}
                className="
                  mb-3
                  rounded-lg
                  border
                  p-4
                "
              >

                <h3 className="font-semibold">
                  {memory.title}
                </h3>


                <p className="text-sm text-gray-500">
                  Category:
                  {" "}
                  {memory.category}
                </p>


                <p className="text-sm text-gray-500">
                  Status:
                  {" "}
                  {memory.status}
                </p>



                {
                  memory.status !==
                  "published" && (

                    <button
                      onClick={() =>
                        publishMemory(
                          memory.id,
                        )
                      }
                      className="
                        mt-3
                        rounded
                        bg-green-600
                        px-4
                        py-2
                        text-white
                      "
                    >
                      Publish
                    </button>

                  )
                }


              </div>

            )
          )
        }


      </div>



    </div>

  );
}