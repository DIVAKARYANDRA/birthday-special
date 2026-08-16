export interface MemoryImage {
  id: string;
  url: string;
  caption: string | null;
}


export interface MemoryRead {
  id: string;
  title: string;
  description: string | null;
  story: string | null;
  memory_date: string | null;
  approximate_date_label: string | null;
  location: string | null;
  category: string;
  importance: string;
  is_featured: boolean;
  images: MemoryImage[];
}


const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "";


export async function getMemories(): Promise<MemoryRead[]> {

  const response = await fetch(
    `${API_BASE_URL}/api/v1/experience/memories`,
  );


  if (!response.ok) {
    throw new Error(
      "Failed to load memories.",
    );
  }


  return response.json();

}