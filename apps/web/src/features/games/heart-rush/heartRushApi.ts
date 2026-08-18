import type {
  HeartRushLevel,
} from "./heartRushTypes";


// ============================================================
// Get Heart Rush Level
// ============================================================

export async function getHeartRushLevel(
  level: number
): Promise<HeartRushLevel> {

  const baseUrl =
    import.meta.env.VITE_API_BASE_URL ?? "";

  const response =
    await fetch(
      `${baseUrl}/api/v1/experience/heart-rush/${level}`
    );


  if (!response.ok) {

    throw new Error(
      "Unable to load Heart Rush level"
    );

  }


  const data =
    await response.json();


  return data as HeartRushLevel;

}