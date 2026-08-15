import { useEffect, useRef, useState } from "react";

import { getActiveMusic, type ActiveMusic } from "@/api/musicApi";
import { useUIStore } from "@/stores/uiStore";

export default function BackgroundMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isMuted = useUIStore((state) => state.isMuted);

  const [music, setMusic] = useState<ActiveMusic | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMusic() {
      try {
        const activeMusic = await getActiveMusic();

        if (!cancelled) {
          setMusic(activeMusic);
        }
      } catch (error) {
        console.error("Failed to load background music:", error);
      }
    }

    void loadMusic();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!music) {
      return;
    }

    const audio = new Audio(music.audio_url);

    audio.loop = music.loop;
    audio.volume = music.default_volume;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [music]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (isMuted) {
      audio.pause();
      return;
    }

    void audio.play().catch((error) => {
      console.debug(
        "Browser prevented background music playback:",
        error,
      );
    });
  }, [isMuted, music]);

  return null;
}