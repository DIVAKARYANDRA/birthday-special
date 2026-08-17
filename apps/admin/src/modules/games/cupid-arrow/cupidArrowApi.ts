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

}



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