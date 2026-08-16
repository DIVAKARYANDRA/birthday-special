export interface TimelineStation {

 id:string;

 memory_id:string;

 title:string;

 memoryTitle:string;

 description:string|null;

 story:string|null;

 date:string|null;

 location:string|null;

 image:string|null;

 section:string|null;

 display_order:number;

}

export interface TimelineChapter {
  id:string;
  title:string;
  description:string|null;
  stations:TimelineStation[];
}


export interface TimelineRead {
  id:string;
  title:string;
  chapters:TimelineChapter[];
}



const API_BASE_URL =
 import.meta.env.VITE_API_BASE_URL ?? "";


export async function getTimeline():
Promise<TimelineRead[]> {


 const response =
 await fetch(
 `${API_BASE_URL}/api/v1/experience/timeline`
 );


 if(!response.ok){
   throw new Error(
    "Failed to load timeline"
   );
 }


 return response.json();

}