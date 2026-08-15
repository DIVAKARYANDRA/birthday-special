export interface ActiveMusic {
  id: string;
  media_asset_id: string;
  title: string;
  mood: string | null;
  default_volume: number;
  loop: boolean;
  is_active: boolean;
  audio_url: string;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "";

export async function getActiveMusic(): Promise<ActiveMusic | null> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/experience/music/active`,
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to load background music.");
  }

  return response.json();
}