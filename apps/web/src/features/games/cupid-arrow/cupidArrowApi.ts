import {
  apiRequest,
} from "@/api/client";



export interface CupidArrowTargetResponse {


  id:string;


  level_id:string;


  media_id?:string | null;


  target_type:string;


  target_emoji?:string | null;


  target_name:string;


  x_position:number;


  y_position:number;


  velocity_x:number;


  velocity_y:number;


  target_size:number;


  points:number;

}



export interface CupidArrowLevelResponse {


  id:string;


  level:number;


  media_id:string;


}




/*
 Create Cupid Arrow Level
*/

export async function createCupidArrowLevel(
payload:any
){


return apiRequest<CupidArrowLevelResponse>(

"/api/v1/admin/games/cupid-arrow",

{

method:"POST",

body:payload

}

);


}



/*
 List Levels
*/

export async function listCupidArrowLevels(){


return apiRequest<CupidArrowLevelResponse[]>(

"/api/v1/admin/games/cupid-arrow"

);


}



/*
 Delete Level
*/

export async function deleteCupidArrowLevel(
id:string
){


return apiRequest(

`/api/v1/admin/games/cupid-arrow/${id}`,

{

method:"DELETE"

}

);


}





/*
 Add Target To Level
*/

export async function createCupidArrowTarget(

levelId:string,

payload:any

){


return apiRequest<CupidArrowTargetResponse>(

`/api/v1/admin/games/cupid-arrow/${levelId}/targets`,

{

method:"POST",

body:payload

}

);


}





/*
 List Targets For Level
*/

export async function listCupidArrowTargets(

levelId:string

){


return apiRequest<CupidArrowTargetResponse[]>(

`/api/v1/admin/games/cupid-arrow/${levelId}/targets`

);


}




/*
 Delete Target
*/

export async function deleteCupidArrowTarget(

targetId:string

){


return apiRequest(

`/api/v1/admin/games/cupid-arrow/targets/${targetId}`,

{

method:"DELETE"

}

);


}