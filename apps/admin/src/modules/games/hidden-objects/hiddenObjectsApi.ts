import {
  apiRequest,
} from "@/api/client";


export interface HiddenObjectTarget {

  id:string;

  media_id:string;

  level:number;

  name:string;

  emoji:string;

  x_position:number;

  y_position:number;

  radius:number;

}




export async function createHiddenObjectTarget(
  payload:any
){

  return apiRequest(
    "/api/v1/admin/games/hidden-objects",
    {
      method:"POST",
      body:payload,
    }
  );

}




export async function getHiddenObjectTargets(
  mediaId:string
){

  return apiRequest<HiddenObjectTarget[]>(
    `/api/v1/admin/games/hidden-objects/${mediaId}`,
    {
      method:"GET",
    }
  );

}




export async function deleteHiddenObjectTarget(
  id:string
){

  return apiRequest(
    `/api/v1/admin/games/hidden-objects/${id}`,
    {
      method:"DELETE",
    }
  );

}