import { useRef, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { ApiError } from "@/api/client";
import { mediaApi } from "@/api/mediaApi";
import { getCloudinaryUrl } from "@/utils/mediaUrl";
const mediaTypes = [
  "image",
  "video",
  "audio",
  "document",
  "animation",
];

const mediaUsages = [
  {
    value: "",
    label: "General Media",
  },
  {
    value: "intro",
    label: "Intro / Chapter One",
  },
  {
    value: "gallery",
    label: "Gallery",
  },
  {
 value:"game",
 label:"Game Images"
},
{
 value:"game-music",
 label:"Game Music"
},
  {
    value: "background",
    label: "Background",
  },
];

const galleryCategories = [
  {
    value: "first_moments",
    label: "First Moments ❤️",
  },
  {
    value: "trips",
    label: "Trips ✈️",
  },
  {
    value: "celebrations",
    label: "Celebrations 🎂",
  },
  {
    value: "random_us",
    label: "Random Us 😂",
  },
  {
    value: "family",
    label: "Family 👨‍👩‍👧",
  },
];

export default function MediaListPage() {
  const queryClient = useQueryClient();

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [mediaType, setMediaType] =
    useState("image");

  const [usage, setUsage] =
    useState("");

  const [category, setCategory] =
useState("");

  const [altText, setAltText] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const mediaQuery = useQuery({
    queryKey: ["media"],
    queryFn: () => mediaApi.list(),
  });

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!selectedFile) {
        throw new Error("Please select a file.");
      }

      return mediaApi.upload(
  selectedFile,
  mediaType,
  altText,
  0,
  usage || undefined,
  category || undefined,
);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["media"],
      });

      setSelectedFile(null);
      setAltText("");
      setUsage("");
      setCategory("");
      setMediaType("image");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) =>
      mediaApi.archive(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["media"],
      });
    },
  });

  const publishMutation = useMutation({

  mutationFn: (id:string)=>
    mediaApi.update(
      id,
      {
        status:"published"
      }
    ),

  onSuccess:()=>{

    queryClient.invalidateQueries({
      queryKey:["media"]
    });

  },

});

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0] ?? null;

    setSelectedFile(file);

    if (file?.type.startsWith("audio/")) {
      setMediaType("audio");
    } else if (
      file?.type.startsWith("image/")
    ) {
      setMediaType("image");
    } else if (
      file?.type.startsWith("video/")
    ) {
      setMediaType("video");
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">
          Media
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Upload and manage images, videos, audio
          and other media used throughout the
          experience.
        </p>
      </div>

      {/* Upload */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold">
          Upload Media
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Files are securely uploaded to
          Cloudinary.
        </p>

        <div className="mt-5 space-y-4">
          {/* File */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              File
            </label>

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="block w-full rounded-lg border p-2"
            />
          </div>

          {/* Media Type */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Media Type
            </label>

            <select
              value={mediaType}
              onChange={(event) =>
                setMediaType(
                  event.target.value,
                )
              }
              className="w-full rounded-lg border p-2"
            >
              {mediaTypes.map((type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Usage */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Usage
            </label>

            <select
              value={usage}
              onChange={(event) =>
                setUsage(event.target.value)
              }
              className="w-full rounded-lg border p-2"
            >
              {mediaUsages.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </select>

           {
(usage === "game" || usage === "game-music") && (

<>

<label className="mt-4 block">
Game Category / Music Target
</label>


<select

value={category}

onChange={(e)=>
setCategory(e.target.value)
}


className="
w-full
rounded-md
border
p-2
"

>


<option value="">
Select Game
</option>

<option value="memory-match">
Memory Match ❤️
</option>


<option value="story-puzzle">
Our Story Puzzle 🧩
</option>


<option value="love-quiz">
Love Quiz 💌
</option>


<option value="hidden-objects">
Hidden Objects 🔍
</option>


<option value="treasure-hunt">
Treasure Hunt 🔐
</option>


</select>


</>

)
}

            <p className="mt-1 text-xs text-gray-400">
              Choose where this media should be
              used in the experience.
            </p>

            {/* Gallery Category */}

{
usage === "gallery" && (

<div>

<label className="mb-1 block text-sm font-medium">
Gallery Category
</label>


<select

value={category}

onChange={(event)=>
setCategory(event.target.value)
}

className="w-full rounded-lg border p-2"

>

<option value="">
Select Category
</option>


{
galleryCategories.map(item=>(

<option

key={item.value}

value={item.value}

>

{item.label}

</option>

))

}


</select>


<p className="mt-1 text-xs text-gray-400">

Used to organize gallery memories.

</p>


</div>

)

}
          </div>

          {/* Alt Text */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Alt Text
            </label>

            <input
              type="text"
              value={altText}
              onChange={(event) =>
                setAltText(
                  event.target.value,
                )
              }
              placeholder="Describe this media..."
              className="w-full rounded-lg border p-2"
            />
          </div>

          {/* Selected File */}
          {selectedFile && (
            <div className="rounded-lg bg-gray-50 p-3 text-sm">
              <strong>Selected:</strong>{" "}
              {selectedFile.name}

              <br />

              <strong>Size:</strong>{" "}
              {(
                selectedFile.size /
                1024 /
                1024
              ).toFixed(2)}{" "}
              MB

              <br />

              <strong>Usage:</strong>{" "}
              <br />

<strong>Category:</strong>{" "}

{
category
?
category
:
"None"
}
              {usage
                ? mediaUsages.find(
                    (item) =>
                      item.value === usage,
                  )?.label
                : "General Media"}
            </div>
          )}

          {/* Error */}
          {uploadMutation.isError && (
            <p className="text-sm text-red-600">
              {uploadMutation.error instanceof
              ApiError
                ? uploadMutation.error.message
                : uploadMutation.error instanceof
                    Error
                  ? uploadMutation.error.message
                  : "Upload failed."}
            </p>
          )}

          {/* Success */}
          {uploadMutation.isSuccess && (
            <p className="text-sm text-green-600">
              Media uploaded successfully.
            </p>
          )}

          {/* Upload button */}
          <button
            type="button"
            disabled={
              !selectedFile ||
              uploadMutation.isPending
            }
            onClick={() =>
              uploadMutation.mutate()
            }
            className="rounded-lg bg-purple-700 px-5 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploadMutation.isPending
              ? "Uploading..."
              : "Upload Media"}
          </button>
        </div>
      </div>

      {/* Existing media */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">
          Uploaded Media
        </h2>

        {mediaQuery.isLoading && (
          <p>Loading media...</p>
        )}

        {mediaQuery.isError && (
          <p className="text-red-600">
            {mediaQuery.error instanceof
            ApiError
              ? mediaQuery.error.message
              : "Failed to load media."}
          </p>
        )}

       {
mediaQuery.data &&
mediaQuery.data.length > 0 && (

<div
className="
grid
grid-cols-1
sm:grid-cols-2
lg:grid-cols-3
gap-6
"
>

{
mediaQuery.data.map(
(media)=>(


<div

key={media.id}

className="
rounded-xl
border
bg-white
overflow-hidden
shadow-sm
"

>


{/* Preview */}

<div
className="
h-56
bg-gray-100
overflow-hidden
"
>

{
media.media_type==="image" &&

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
h-full
w-full
object-cover
"
/>

}


</div>




<div
className="
p-4
space-y-3
"
>


<h3
className="
font-semibold
truncate
"
>

{
media.original_filename
}

</h3>



<div
className="
flex
gap-2
flex-wrap
"
>


{
media.category &&

<span
className="
rounded-full
bg-purple-100
px-3
py-1
text-xs
"
>

{
media.category
}

</span>

}



{
media.usage &&

<span
className="
rounded-full
bg-blue-100
px-3
py-1
text-xs
"
>

{
media.usage
}

</span>

}


</div>




<p
className="text-sm text-gray-500"
>

Status:
{" "}
{media.status}

</p>

{
media.status === "draft" &&

<button

type="button"

onClick={()=>
publishMutation.mutate(
media.id
)
}

className="
w-full
rounded-lg
bg-green-600
px-3
py-2
text-sm
text-white
"

>

Publish

</button>

}


<button

type="button"

onClick={()=>

mediaApi.update(
media.id,
{
is_featured:
!media.is_featured
}
)
.then(
()=>queryClient.invalidateQueries(
{
queryKey:["media"]
}
)
)

}

className="
w-full
rounded-lg
border
px-3
py-2
text-sm
"

>

{
media.is_featured
?
"⭐ Featured"
:
"☆ Make Featured"
}

</button>





{
media.status !== "archived" &&

<button

type="button"

onClick={()=>
archiveMutation.mutate(
media.id
)
}

className="
w-full
rounded-lg
bg-red-600
px-3
py-2
text-sm
text-white
"

>

Archive

</button>

}


</div>


</div>


)

)

}


</div>

)

}
      </div>
    </div>
  );
}