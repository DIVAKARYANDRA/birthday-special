const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL;

export interface IntroImage {
  id: string;
  url: string;
  title: string | null;
  alt_text: string | null;
  display_order: number;
}

export async function getIntroImages(): Promise<IntroImage[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/experience/media/intro`,
  );

  if (!response.ok) {
    throw new Error("Failed to load intro images.");
  }

  return response.json();
}