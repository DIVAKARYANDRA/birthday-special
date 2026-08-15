import { useRef, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { ApiError } from "@/api/client";
import { mediaApi } from "@/api/mediaApi";

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
    value: "background",
    label: "Background",
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
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["media"],
      });

      setSelectedFile(null);
      setAltText("");
      setUsage("");
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

            <p className="mt-1 text-xs text-gray-400">
              Choose where this media should be
              used in the experience.
            </p>
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left text-sm">
                      <th className="px-4 py-3">
                        Type
                      </th>

                      <th className="px-4 py-3">
                        Usage
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
                    {mediaQuery.data.map(
                      (media) => (
                        <tr
                          key={media.id}
                          className="border-t"
                        >
                          {/* Type */}
                          <td className="px-4 py-3">
                            {media.media_type}
                          </td>

                          {/* Usage */}
                          <td className="px-4 py-3">
                            {media.usage ===
                            "intro" ? (
                              <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
                                Intro
                              </span>
                            ) : media.usage ===
                              "gallery" ? (
                              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                                Gallery
                              </span>
                            ) : media.usage ===
                              "background" ? (
                              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                                Background
                              </span>
                            ) : (
                              <span className="text-gray-400">
                                General
                              </span>
                            )}
                          </td>

                          {/* Filename */}
                          <td className="px-4 py-3">
                            {media.original_filename ??
                              "-"}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            {media.status}
                          </td>

                          {/* Featured */}
                          <td className="px-4 py-3">
                            {media.is_featured
                              ? "Yes"
                              : "No"}
                          </td>

                          {/* Actions */}
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
                                disabled={
                                  archiveMutation.isPending
                                }
                                className="rounded border px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Archive
                              </button>
                            )}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}