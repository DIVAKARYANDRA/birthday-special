/**
 * TimelineScene — "Timeline Train"
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import SceneLayout from "@/components/global/SceneLayout";
import Breadcrumb from "@/components/ui/Breadcrumb";

import TrainStation from "@/features/timeline/TrainStation";
import StationModal from "@/features/timeline/StationModal";

import {
  getTimeline,
  type TimelineChapter,
  type TimelineStation,
} from "@/api/timelineApi";

import { EASE_OUT } from "@/animations/motionPrimitives";


export default function TimelineScene() {


  const [chapters, setChapters] =
    useState<TimelineChapter[]>([]);


  const [activeChapter, setActiveChapter] =
    useState("");


  const [selectedStation, setSelectedStation] =
    useState<TimelineStation | null>(null);


  const [loading, setLoading] =
    useState(true);



  useEffect(() => {

    async function loadTimeline() {

      try {

        const data = await getTimeline();


        if (data.length > 0) {

          setChapters(
            data[0].chapters
          );


          setActiveChapter(
            data[0].chapters[0]?.title ?? ""
          );

        }

      } finally {

        setLoading(false);

      }

    }


    void loadTimeline();


  }, []);



  /*
   * Loading screen
   * Must be outside JSX return
   */
  if (loading) {

    return (

      <SceneLayout mode="twilight">

        <div
          className="
            flex
            h-full
            items-center
            justify-center
            text-white
          "
        >

          Loading our journey 🚂

        </div>

      </SceneLayout>

    );

  }



  return (

    <SceneLayout mode="twilight">


      <Breadcrumb label="Timeline Train" />



      {/* Header */}

      <motion.div

        initial={{
          y: -30,
          opacity: 0,
        }}

        animate={{
          y: 0,
          opacity: 1,
        }}

        className="
          mb-6
          text-center
        "

      >

        <div
          className="
            text-5xl
            animate-pulse
          "
        >
          🚂
        </div>


        <h1
          className="
            font-display
            text-2xl
            text-white
          "
        >

          Our Journey

        </h1>


        <p
          className="
            text-sm
            text-white/50
          "
        >

          Every station holds a memory

        </p>


      </motion.div>




      {/* Active chapter */}

      <div
        className="
          sticky
          top-0
          z-10
          -mt-1
          bg-gradient-to-b
          from-[#1d1533]
          to-transparent
          px-5
          pb-3
          pt-2
          text-center
        "
      >

        <p
          className="
            text-xs
            uppercase
            tracking-[0.3em]
            text-white/40
          "
        >

          Now Arriving

        </p>


        <h1
          className="
            font-display
            text-lg
            text-white
          "
        >

          {activeChapter}

        </h1>


      </div>





      {/* Train Timeline */}

      <div
        className="
          flex-1
          px-6
          pb-8
        "
      >


        <div
          className="
            relative
            ml-4
            border-l-2
            border-white/15
            pl-8
          "
        >


          {
            chapters.map(
              (chapter) => (

                <motion.section

                  key={chapter.id}

                  onViewportEnter={() =>
                    setActiveChapter(
                      chapter.title
                    )
                  }

                  viewport={{
                    margin:
                    "-45% 0px -45% 0px",
                  }}

                  className="mb-10"

                >


                  <h2
                    className="
                      mb-4
                      text-sm
                      font-medium
                      uppercase
                      tracking-wide
                      text-white/50
                    "
                  >

                    {chapter.title}

                  </h2>



                  <div
                    className="
                      flex
                      flex-col
                      gap-6
                    "
                  >


                    {
                      chapter.stations.map(
                        (station) => (

                          <motion.div

                            key={station.id}

                            initial={{
                              opacity:0,
                              x:-12,
                            }}

                            whileInView={{
                              opacity:1,
                              x:0,
                            }}

                            viewport={{
                              once:true,
                              margin:
                              "-10% 0px -10% 0px",
                            }}

                            transition={{
                              duration:0.5,
                              ease:EASE_OUT,
                            }}

                            className="
                              relative
                              flex
                              items-center
                              gap-3
                            "

                          >


                            <span

                              aria-hidden="true"

                              className="
                                absolute
                                -left-[2.55rem]
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-full
                                border-2
                                border-white/30
                                bg-[#1d1533]
                                text-sm
                              "

                            >

                              {
                                station.image
                                ? "📸"
                                : "🚉"
                              }


                            </span>




                            <button

                              onClick={() =>
                                setSelectedStation(
                                  station
                                )
                              }

                              className="
                                w-full
                                text-left
                              "

                            >

                              <TrainStation

                                title={
                                  station.title
                                }

                                memoryTitle={
                                  station.memoryTitle
                                }

                              />


                            </button>



                          </motion.div>


                        )
                      )
                    }


                  </div>


                </motion.section>


              )
            )
          }


        </div>




        {/* Modal outside map */}

        {
          selectedStation && (

            <StationModal

              station={
                selectedStation
              }

              onClose={() =>
                setSelectedStation(null)
              }

            />

          )
        }





        <Link

          to="/memories"

          className="
            mt-2
            block
            min-h-[44px]
            rounded-full
            border
            border-white/15
            px-4
            py-2
            text-center
            text-sm
            text-white/70
            active:scale-95
          "

        >

          Browse Memories Instead →

        </Link>



      </div>



    </SceneLayout>

  );

}