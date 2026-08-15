import { useEffect, useRef, useState } from "react";

import { getActiveMusic, type ActiveMusic } from "@/api/musicApi";

const MUSIC_PLAY_EVENT = "journey:music-play";
const MUSIC_PAUSE_EVENT = "journey:music-pause";

export default function BackgroundMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
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
    if (!music?.audio_url) {
      return;
    }

    const audio = new Audio(music.audio_url);

    audio.loop = music.loop;
    audio.volume = Math.max(0, Math.min(1, music.default_volume));
    audio.preload = "auto";

    audioRef.current = audio;

    const handlePlay = () => {
      void audio.play().catch((error) => {
        console.error("Unable to play background music:", error);
      });
    };

    const handlePause = () => {
      audio.pause();
    };

    window.addEventListener(MUSIC_PLAY_EVENT, handlePlay);
    window.addEventListener(MUSIC_PAUSE_EVENT, handlePause);

    return () => {
      window.removeEventListener(MUSIC_PLAY_EVENT, handlePlay);
      window.removeEventListener(MUSIC_PAUSE_EVENT, handlePause);

      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [music]);

  return null;
}