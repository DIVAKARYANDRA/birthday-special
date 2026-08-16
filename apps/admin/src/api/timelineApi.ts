import { apiRequest } from "./client";


export interface TimelineEntry {
  id: string;
  memory_id: string;
  section: string | null;
  display_order: number;
}


export interface TimelineChapter {

  id:string;

  title:string;

  description:string|null;

  display_order:number;

  entries:TimelineEntry[];

}


export interface TimelineRead {

  id: string;

  title: string;

  description: string | null;

  presentation_style: string;

  status: string;

  is_featured: boolean;

  chapters: TimelineChapter[] | [];
}


export interface TimelineCreate {

  title: string;

  description?: string;

  presentation_style: string;

}



export interface TimelineChapterCreate {

  title: string;

  description?: string;

  display_order?: number;

}



export interface TimelineEntryCreate {

  memory_id: string;

  section?: string;

  display_order?: number;

}



const BASE_URL =
  "/api/v1/admin/timelines";



export const timelineApi = {


  list: () =>

    apiRequest<TimelineRead[]>(

      BASE_URL

    ),



  create: (

    payload: TimelineCreate,

  ) =>

    apiRequest<TimelineRead>(

      BASE_URL,

      {
        method: "POST",
        body: payload,
      },

    ),



  addChapter: (

    timelineId: string,

    payload: TimelineChapterCreate,

  ) =>

    apiRequest<TimelineChapter>(

      `${BASE_URL}/${timelineId}/chapters`,

      {
        method: "POST",
        body: payload,
      },

    ),




  attachMemory: (

    chapterId: string,

    payload: TimelineEntryCreate,

  ) =>

    apiRequest<TimelineEntry>(

      `${BASE_URL}/chapters/${chapterId}/entries`,

      {
        method: "POST",
        body: payload,
      },

    ),




  publish: (

    timelineId: string,

  ) =>

    apiRequest<TimelineRead>(

      `${BASE_URL}/${timelineId}`,

      {
        method: "PATCH",
        body: {
          status: "published",
        },
      },

    ),




  archive: (

    timelineId: string,

  ) =>

    apiRequest<TimelineRead>(

      `${BASE_URL}/${timelineId}/archive`,

      {
        method: "POST",
      },

    ),


};