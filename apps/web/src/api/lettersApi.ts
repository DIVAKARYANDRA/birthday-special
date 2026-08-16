const API_BASE_URL =
 import.meta.env.VITE_API_BASE_URL ?? "";


export interface PublicLetter {

 id:string;

 title:string;

 written_date:string|null;

}



export async function getLetters()
:Promise<PublicLetter[]> {


 const response =
 await fetch(
 `${API_BASE_URL}/api/v1/experience/letters`
 );


 if(!response.ok){

 throw new Error(
 "Failed loading letters"
 );

 }


 const data =
 await response.json();


 return data;

}