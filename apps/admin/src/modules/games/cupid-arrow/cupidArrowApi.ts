import { apiRequest } from "@/api/client";


export interface CupidArrowLevel {

    id:string;

    media_id:string;

    level:number;

    target_type:string;

    target_emoji:string | null;

    target_name:string;

    target_size:number;

    start_x:number;

    start_y:number;

    velocity_x:number;

    velocity_y:number;

    points:number;

    is_face_level:boolean;

    movement_speed:string;

    time_limit:number;

    completion_score:number;

}



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



// -------------------------
// Levels
// -------------------------

export async function listCupidArrowLevels(){

    return apiRequest<CupidArrowLevel[]>(
        "/api/v1/admin/games/cupid-arrow"
    );

}



export async function createCupidArrowLevel(
    payload:Partial<CupidArrowLevel>
){

    return apiRequest<CupidArrowLevel>(
        "/api/v1/admin/games/cupid-arrow",
        {
            method:"POST",
            body:payload
        }
    );

}



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



// -------------------------
// Targets
// -------------------------

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



export async function listCupidArrowTargets(
    levelId:string
){

    return apiRequest<CupidArrowTargetResponse[]>(
        `/api/v1/admin/games/cupid-arrow/${levelId}/targets`
    );

}



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