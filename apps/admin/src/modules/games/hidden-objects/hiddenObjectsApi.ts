import { apiClient } from "@/api/client";


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

return apiClient.post(
"/admin/games/hidden-objects",
payload
);

}




export async function getHiddenObjectTargets(
mediaId:string
){

return apiClient.get<HiddenObjectTarget[]>(
`/admin/games/hidden-objects/${mediaId}`
);

}



export async function deleteHiddenObjectTarget(
id:string
){

return apiClient.delete(
`/admin/games/hidden-objects/${id}`
);

}