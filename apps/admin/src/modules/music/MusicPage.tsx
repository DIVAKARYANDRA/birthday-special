import { useEffect, useState } from "react";

import { apiRequest } from "@/api/client";
import {
  musicApi,
  type MusicTrackCreate,
  type MusicTrackRead,
} from "@/api/musicApi";

interface AudioMediaAsset {
  id: string;
  media_type: string;
  original_filename: string | null;
  external_reference: string | null;
  mime_type: string | null;
  status: string;
  is_visible: boolean;
}

export default function MusicPage() {
  const [tracks, setTracks] = useState<MusicTrackRead[]>([]);
  const [audioAssets, setAudioAssets] = useState<AudioMediaAsset[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [selectedMediaAssetId, setSelectedMediaAssetId] = useState("");
  const [title, setTitle] = useState("");
  const [mood, setMood] = useState("");
  const [volume, setVolume] = useState(0.7);
  const [loop, setLoop] = useState(true);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const [trackData, mediaData] = await Promise.all([
        musicApi.list(),
        apiRequest<AudioMediaAsset[]>(
            "/api/v1/admin/media?media_type=audio",
        ),
        ]);

       const audioOnlyAssets = mediaData.filter(
        (asset) =>
            asset.media_type === "audio" ||
            asset.mime_type?.startsWith("audio/"),
        );

        setTracks(trackData);
        setAudioAssets(audioOnlyAssets);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load music data.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleCreateAndActivate() {
    if (!selectedMediaAssetId) {
      setError("Please select an audio file.");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a music title.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const payload: MusicTrackCreate = {
        media_asset_id: selectedMediaAssetId,
        title: title.trim(),
        mood: mood.trim() || undefined,
        default_volume: volume,
        loop,
      };

      const createdTrack = await musicApi.create(payload);

      await musicApi.activate(createdTrack.id);

      setSuccess("Music track created and activated successfully.");

      setTitle("");
      setMood("");
      setSelectedMediaAssetId("");
      setVolume(0.7);
      setLoop(true);

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create music track.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleActivate(id: string) {
    try {
      setError(null);
      setSuccess(null);

      await musicApi.activate(id);

      setSuccess("Music track activated successfully.");

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to activate music track.",
      );
    }
  }

  async function handleDeactivate(id: string) {
    try {
      setError(null);
      setSuccess(null);

      await musicApi.deactivate(id);

      setSuccess("Music track deactivated successfully.");

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to deactivate music track.",
      );
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading music...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">
          Background Music
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage the music played on the visitor experience.
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Current tracks */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">
            Configured Music
          </h2>

          <p className="text-sm text-gray-500">
            Music tracks currently configured for the website.
          </p>
        </div>

        {tracks.length === 0 ? (
          <div className="rounded-lg border p-6">
            <p className="text-gray-600">
              No music tracks configured yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="rounded-lg border p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">
                      {track.title}
                    </h3>

                    {track.mood && (
                      <p className="mt-1 text-sm text-gray-500">
                        {track.mood}
                      </p>
                    )}
                  </div>

                  <span
                    className={
                      track.is_active
                        ? "rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                        : "rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500"
                    }
                  >
                    {track.is_active
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-6 text-sm text-gray-600">
                  <span>
                    Volume:{" "}
                    {Math.round(
                      track.default_volume * 100,
                    )}
                    %
                  </span>

                  <span>
                    Loop: {track.loop ? "Yes" : "No"}
                  </span>
                </div>

                <div className="mt-4 flex gap-3">
                  {!track.is_active && (
                    <button
                      type="button"
                      onClick={() =>
                        void handleActivate(track.id)
                      }
                      className="rounded-md bg-black px-4 py-2 text-sm text-white"
                    >
                      Activate
                    </button>
                  )}

                  {track.is_active && (
                    <button
                      type="button"
                      onClick={() =>
                        void handleDeactivate(track.id)
                      }
                      className="rounded-md border px-4 py-2 text-sm"
                    >
                      Deactivate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Create music */}
      <section className="space-y-6 rounded-lg border p-6">
        <div>
          <h2 className="text-lg font-semibold">
            Add Music
          </h2>

          <p className="text-sm text-gray-500">
            Select an audio file already uploaded to Media.
          </p>
        </div>

        {/* Audio */}
        <div className="space-y-2">
          <label
            htmlFor="music-audio"
            className="block text-sm font-medium"
          >
            Audio File
          </label>

          <select
            id="music-audio"
            value={selectedMediaAssetId}
            onChange={(event) =>
              setSelectedMediaAssetId(event.target.value)
            }
            className="w-full rounded-md border px-3 py-2"
          >
            <option value="">
              Select an audio file
            </option>

            {audioAssets.map((asset) => (
              <option
                key={asset.id}
                value={asset.id}
              >
                {asset.original_filename ||
                  "Untitled audio"}
              </option>
            ))}
          </select>

          {audioAssets.length === 0 && (
            <p className="text-sm text-amber-600">
              No audio files are available. Upload an audio
              file from the Media page first.
            </p>
          )}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label
            htmlFor="music-title"
            className="block text-sm font-medium"
          >
            Title
          </label>

          <input
            id="music-title"
            type="text"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder="Our Special Song"
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        {/* Mood */}
        <div className="space-y-2">
          <label
            htmlFor="music-mood"
            className="block text-sm font-medium"
          >
            Mood
          </label>

          <input
            id="music-mood"
            type="text"
            value={mood}
            onChange={(event) =>
              setMood(event.target.value)
            }
            placeholder="Romantic"
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        {/* Volume */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label
              htmlFor="music-volume"
              className="text-sm font-medium"
            >
              Default Volume
            </label>

            <span className="text-sm text-gray-500">
              {Math.round(volume * 100)}%
            </span>
          </div>

          <input
            id="music-volume"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(event) =>
              setVolume(Number(event.target.value))
            }
            className="w-full"
          />
        </div>

        {/* Loop */}
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={loop}
            onChange={(event) =>
              setLoop(event.target.checked)
            }
          />

          <span className="text-sm">
            Loop continuously
          </span>
        </label>

        {/* Save */}
        <button
          type="button"
          disabled={
            saving ||
            !selectedMediaAssetId ||
            !title.trim()
          }
          onClick={() =>
            void handleCreateAndActivate()
          }
          className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : "Create & Activate Music"}
        </button>
      </section>
    </div>
  );
}