import { motion } from "framer-motion";

import type { TimelineStation } from "@/api/timelineApi";


interface StationModalProps {
  station: TimelineStation;
  onClose: () => void;
}


export default function StationModal({
  station,
  onClose,
}: StationModalProps) {


  return (

    <motion.div

      initial={{
        opacity:0,
      }}

      animate={{
        opacity:1,
      }}

      exit={{
        opacity:0,
      }}

      className="
        fixed
        inset-0
        z-50
        flex
        items-end
        justify-center
        bg-black/60
        backdrop-blur-sm
        sm:items-center
      "

      onClick={onClose}

    >


      <motion.div

        initial={{
          y:40,
          opacity:0,
        }}

        animate={{
          y:0,
          opacity:1,
        }}

        className="
          w-full
          max-w-md
          rounded-t-3xl
          bg-[#1d1533]
          p-6
          text-white
          sm:rounded-3xl
        "

        onClick={(e)=>
          e.stopPropagation()
        }

      >


        {
          station.image && (

            <img

              src={station.image}

              alt={station.title}

              className="
                mb-4
                h-48
                w-full
                rounded-xl
                object-cover
              "

            />

          )
        }



        <h2
          className="
            mb-2
            font-display
            text-xl
          "
        >

          {station.title}

        </h2>



        <p
          className="
            mb-4
            text-sm
            text-white/60
          "
        >

          {station.memoryTitle}

        </p>




        <button

          onClick={onClose}

          className="
            w-full
            rounded-full
            bg-purple-700
            px-5
            py-3
            text-sm
            text-white
          "

        >

          Close

        </button>



      </motion.div>


    </motion.div>

  );

}