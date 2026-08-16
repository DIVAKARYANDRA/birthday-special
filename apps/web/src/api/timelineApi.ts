export interface TimelineStation {
  id: string;
  memory_id: string;
  title: string;
  memoryTitle: string;
  description: string | null;
  story: string | null;
  date: string | null;
  location: string | null;
  image: string | null;
  section: string | null;
  display_order: number;
}


export interface TimelineChapter {
  id: string;
  title: string;
  description: string | null;
  stations: TimelineStation[];
}


export interface TimelineRead {
  id: string;
  title: string;
  chapters: TimelineChapter[];
}


const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "";



export async function getTimeline(): Promise<TimelineRead[]> {


  const response = await fetch(
    `${API_BASE_URL}/api/v1/experience/timeline`,
  );


  if (!response.ok) {
    throw new Error(
      "Failed to load timeline"
    );
  }


  const timelines = await response.json();



  return timelines.map(
    (timeline: any) => ({

      id: timeline.id,

      title: timeline.title,


      chapters:
        timeline.chapters?.map(
          (chapter:any)=>({

            id:chapter.id,

            title:chapter.title,

            description:
              chapter.description ?? null,


            stations:
              chapter.stations?.map(
                (station:any)=>({

                  id:station.id,

                  memory_id:
                    station.memory_id,


                  title:
                    station.title,


                  memoryTitle:
                    station.memoryTitle,


                  description:
                    station.description ?? null,


                  story:
                    station.story ?? null,


                  date:
                    station.date ?? null,


                  location:
                    station.location ?? null,


                  image:
                    station.image ?? null,


                  section:
                    station.section ?? null,


                  display_order:
                    station.display_order ?? 0,

                })
              ) ?? []

          })
        ) ?? []

    })
  );

}