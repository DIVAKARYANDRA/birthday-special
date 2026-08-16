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



export interface TimelineEntry {

  id: string;

  memory_id: string;

  section: string | null;

  display_order: number;

}



export interface TimelineChapter {

  id: string;

  title: string;

  entries: TimelineEntry[];

  stations: TimelineStation[];

}



export interface TimelineRead {

  id: string;

  title: string;

  description?: string | null;

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
      "Failed to load timeline",
    );

  }



  const data = await response.json();



  return data.map(
    (timeline: any) => ({

      ...timeline,


      chapters:
        timeline.chapters.map(
          (chapter: any) => ({


            ...chapter,


            stations:
              chapter.entries.map(
                (entry: any) => ({


                  id: entry.id,


                  memory_id:
                    entry.memory_id,


                  title:
                    entry.section ??
                    "Memory Station",


                  memoryTitle:
                    entry.memory_title ??
                    "Beautiful Memory",


                  description:
                    entry.description ??
                    null,


                  story:
                    entry.story ??
                    null,


                  date:
                    entry.memory_date ??
                    null,


                  location:
                    entry.location ??
                    null,


                  image:
                    entry.image ??
                    null,


                  section:
                    entry.section ??
                    null,


                  display_order:
                    entry.display_order ??
                    0,


                })
              )


          })
        )


    })
  );

}