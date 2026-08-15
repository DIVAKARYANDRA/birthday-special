import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/api/client";
import { mediaApi } from "@/api/mediaApi";

const mediaTypes = [
  "image",
  "video",
  "audio",
  "document",
  "animation",
];

export default function MediaListPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [mediaType, setMediaType] = useState("image");
  const [altText, setAltText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["media"],
      });

      setSelectedFile(null);
      setAltText("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => mediaApi.archive(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["media"],
      });
    },
  });

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0] ?? null;

    setSelectedFile(file);

    if (file?.type.startsWith("audio/")) {
      setMediaType("audio");
    } else if (file?.type.startsWith("image/")) {
      setMediaType("image");
    } else if (file?.type.startsWith("video/")) {
      setMediaType("video");
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Media
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Upload and manage images, videos, audio and other
          media used throughout the experience.
        </p>
      </div>

      {/* Upload */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold">
          Upload Media
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Files are securely uploaded to Cloudinary.
        </p>

        <div className="mt-5 space-y-4">
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

          <div>
            <label className="mb-1 block text-sm font-medium">
              Media Type
            </label>

            <select
              value={mediaType}
              onChange={(event) =>
                setMediaType(event.target.value)
              }
              className="w-full rounded-lg border p-2"
            >
              {mediaTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Alt Text
            </label>

            <input
              type="text"
              value={altText}
              onChange={(event) =>
                setAltText(event.target.value)
              }
              placeholder="Describe this media..."
              className="w-full rounded-lg border p-2"
            />
          </div>

          {selectedFile && (
            <div className="rounded-lg bg-gray-50 p-3 text-sm">
              <strong>Selected:</strong>{" "}
              {selectedFile.name}
              <br />
              <strong>Size:</strong>{" "}
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </div>
          )}

          {uploadMutation.isError && (
            <p className="text-sm text-red-600">
              {uploadMutation.error instanceof ApiError
                ? uploadMutation.error.message
                : uploadMutation.error instanceof Error
                  ? uploadMutation.error.message
                  : "Upload failed."}
            </p>
          )}

          {uploadMutation.isSuccess && (
            <p className="text-sm text-green-600">
              Media uploaded successfully.
            </p>
          )}

          <button
            type="button"
            disabled={
              !selectedFile ||
              uploadMutation.isPending
            }
            onClick={() => uploadMutation.mutate()}
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
            {mediaQuery.error instanceof ApiError
              ? mediaQuery.error.message
              : "Failed to load media."}
          </p>
        )}

        {mediaQuery.data &&
          mediaQuery.data.length === 0 && (
            <div className="rounded-xl border bg-white p-6">
              <p className="text-gray-500">
                No media uploaded yet.
              </p>
            </div>
          )}

        {mediaQuery.data &&
          mediaQuery.data.length > 0 && (
            <div className="overflow-hidden rounded-xl border bg-white">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left text-sm">
                    <th className="px-4 py-3">
                      Type
                    </th>

                    <th className="px-4 py-3">
                      Filename
                    </th>

                    <th className="px-4 py-3">
                      Status
                    </th>

                    <th className="px-4 py-3">
                      Featured
                    </th>

                    <th className="px-4 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {mediaQuery.data.map((media) => (
                    <tr
                      key={media.id}
                      className="border-t"
                    >
                      <td className="px-4 py-3">
                        {media.media_type}
                      </td>

                      <td className="px-4 py-3">
                        {media.original_filename ??
                          "-"}
                      </td>

                      <td className="px-4 py-3">
                        {media.status}
                      </td>

                      <td className="px-4 py-3">
                        {media.is_featured
                          ? "Yes"
                          : "No"}
                      </td>

                      <td className="px-4 py-3">
                        {media.status !==
                          "archived" && (
                          <button
                            type="button"
                            onClick={() =>
                              archiveMutation.mutate(
                                media.id,
                              )
                            }
                            className="rounded border px-3 py-1 text-sm"
                          >
                            Archive
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  );
}