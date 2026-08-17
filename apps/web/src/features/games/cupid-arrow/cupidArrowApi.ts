export interface CupidArrowLevelResponse {

    level:number;

    image:any;

    targets:any[];

    targetCount:number;

    movementSpeed:string;

    timeLimit:number;

    completionScore:number;

}



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