import type {
  HeartRushLevel,
} from "./heartRushTypes";


// ============================================================
// Get Heart Rush Level
// ============================================================

export async function getHeartRushLevel(
  level:number
):Promise<HeartRushLevel>{

  const response =
    await fetch(
      `${
        import.meta.env.VITE_API_BASE_URL ?? ""
      }/api/v1/experience/heart-rush/${level}`
    );


  if(!response.ok){

    throw new Error(
      "Unable to load Heart Rush level"
    );

  }


  return response.json()
    as Promise<HeartRushLevel>;

}