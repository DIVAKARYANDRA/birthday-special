import { useEffect, useState } from "react";

import {
  musicApi,
  type MusicTrackRead,
} from "@/api/musicApi";

export default function MusicPage() {
  const [tracks, setTracks] = useState<MusicTrackRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadTracks() {
    try {
      setLoading(true);
      setError(null);

      const data = await musicApi.list();
      setTracks(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load music tracks.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTracks();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading music...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Background Music
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage the music played on the visitor experience.
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
                  <h2 className="font-medium">
                    {track.title}
                  </h2>

                  {track.mood && (
                    <p className="text-sm text-gray-500">
                      {track.mood}
                    </p>
                  )}
                </div>

                <span
                  className={
                    track.is_active
                      ? "text-green-600"
                      : "text-gray-400"
                  }
                >
                  {track.is_active
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>

              <div className="mt-4 text-sm">
                <p>
                  Volume:{" "}
                  {Math.round(
                    track.default_volume * 100,
                  )}
                  %
                </p>

                <p>
                  Loop: {track.loop ? "Yes" : "No"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}