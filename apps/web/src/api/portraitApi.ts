const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "";


export interface PortraitImage {
  id: string;
  url: string;
  title?: string | null;
}


export async function getPortraitImage(): Promise<PortraitImage | null> {

  const response = await fetch(
    `${API_BASE_URL}/api/v1/experience/media/portrait`,
  );


  if (response.status === 404) {
    return null;
  }


  if (!response.ok) {
    throw new Error(
      "Failed to load portrait image",
    );
  }


  return response.json();

}