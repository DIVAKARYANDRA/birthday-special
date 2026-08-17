import type {
  CupidArrowLevelResponse,
} from "./cupidArrowTypes";


export async function getCupidArrowLevel(
  level:number
){

  const response =
    await fetch(
      `${import.meta.env.VITE_API_BASE_URL ?? ""}/api/v1/experience/cupid-arrow/${level}`
    );


  if(!response.ok){

    throw new Error(
      "Unable to load Cupid Arrow level"
    );

  }


  return response.json() as Promise<CupidArrowLevelResponse>;

}