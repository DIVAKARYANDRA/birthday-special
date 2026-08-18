import { apiRequest } from "@/api/client";


export interface HeartRushLevel {

  id:string;

  media_id:string;

  level:number;

  time_limit:number;

  completion_score:number;

  spawn_speed:string;

  spawn_frequency:number;

  max_objects:number;

}


export interface HeartRushObject {

  id:string;

  level_id:string;

  visual_type:string;

  emoji:string | null;

  media_id:string | null;

  behavior_type:string;

  name:string;

  points:number;

  fall_speed:number;

  rarity:string;

  is_active:boolean;

}


/* ============================================================
   LEVELS
   ============================================================ */

export async function listHeartRushLevels(){

  return apiRequest<HeartRushLevel[]>(
    "/api/v1/admin/games/heart-rush"
  );

}


export async function createHeartRushLevel(
  payload:Partial<HeartRushLevel>
){

  return apiRequest<HeartRushLevel>(
    "/api/v1/admin/games/heart-rush",
    {
      method:"POST",
      body:payload
    }
  );

}


export async function deleteHeartRushLevel(
  levelId:string
){

  return apiRequest(
    `/api/v1/admin/games/heart-rush/${levelId}`,
    {
      method:"DELETE"
    }
  );

}


/* ============================================================
   OBJECTS
   ============================================================ */

export async function listHeartRushObjects(
  levelId:string
){

  return apiRequest<HeartRushObject[]>(
    `/api/v1/admin/games/heart-rush/${levelId}/objects`
  );

}


export async function createHeartRushObject(
  levelId:string,
  payload:Partial<HeartRushObject>
){

  return apiRequest<HeartRushObject>(
    `/api/v1/admin/games/heart-rush/${levelId}/objects`,
    {
      method:"POST",
      body:payload
    }
  );

}


export async function deleteHeartRushObject(
  objectId:string
){

  return apiRequest(
    `/api/v1/admin/games/heart-rush/objects/${objectId}`,
    {
      method:"DELETE"
    }
  );

}