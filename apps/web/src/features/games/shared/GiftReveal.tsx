import { motion } from "framer-motion";

import type {
  GameGift,
} from "./gifts";


interface GiftRevealProps {

  gift: GameGift;

  onContinue?: () => void;

}


const CELEBRATION_PARTICLES = [
  "❤️",
  "💖",
  "💕",
  "✨",
  "⭐",
  "💗",
  "🌸",
  "✨",
  "❤️",
  "💫",
  "💖",
  "💕",
];


export default function GiftReveal(
{
  gift,
  onContinue

}: GiftRevealProps
){


  return (

    <div

      className="
        relative
        flex
        min-h-full
        flex-1
        items-center
        justify-center
        overflow-hidden
        px-5
        py-10
      "

    >


      {/* =====================================================
          Ambient background glow
          ===================================================== */}

      <motion.div

        initial={{
          opacity: 0
        }}

        animate={{
          opacity: 1
        }}

        transition={{
          duration: 1.2
        }}

        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-[420px]
          w-[420px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-pink-500/20
          blur-3xl
        "

      />



      {/* =====================================================
          Celebration particles
          ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          overflow-hidden
        "
      >

        {
          CELEBRATION_PARTICLES.map(
            (
              particle,
              index
            ) => (

              <motion.div

                key={`${particle}-${index}`}

                initial={{
                  opacity: 0,
                  scale: 0,
                  x: 0,
                  y: 80
                }}

                animate={{
                  opacity: [
                    0,
                    1,
                    0.8,
                    0
                  ],

                  scale: [
                    0,
                    1.2,
                    1,
                    0.8
                  ],

                  x:
                    (
                      index % 2 === 0
                        ? 1
                        : -1
                    )
                    *
                    (
                      40 +
                      (index * 13)
                    ),

                  y:
                    -(
                      160 +
                      (index * 22)
                    ),

                  rotate: [
                    0,
                    90,
                    180
                  ]

                }}

                transition={{

                  duration:
                    2.8 +
                    (
                      index % 3
                    )
                    *
                    0.4,

                  delay:
                    index * 0.08,

                  ease:
                    "easeOut"

                }}

                className="
                  absolute
                  left-1/2
                  top-1/2
                  text-2xl
                  sm:text-3xl
                "

                style={{

                  marginLeft:
                    (
                      (
                        index * 73
                      )
                      %
                      240
                    )
                    - 120,

                  marginTop:
                    (
                      (
                        index * 47
                      )
                      %
                      180
                    )
                    - 90

                }}

              >

                {particle}

              </motion.div>

            )

          )
        }

      </div>



      {/* =====================================================
          Main reward card
          ===================================================== */}

      <motion.div

        initial={{
          opacity: 0,
          y: 50,
          scale: 0.82
        }}

        animate={{
          opacity: 1,
          y: 0,
          scale: 1
        }}

        transition={{
          duration: 0.75,
          ease: "easeOut"
        }}

        className="
          relative
          z-10
          w-full
          max-w-md
          overflow-hidden
          rounded-[2rem]
          border
          border-white/20
          bg-white/10
          p-6
          text-center
          shadow-2xl
          backdrop-blur-xl
          sm:p-8
        "

      >


        {/* =================================================
            Top shine
            ================================================= */}

        <motion.div

          initial={{
            x: "-120%"
          }}

          animate={{
            x: "120%"
          }}

          transition={{
            duration: 1.2,
            delay: 0.8,
            ease: "easeInOut"
          }}

          className="
            pointer-events-none
            absolute
            inset-y-0
            left-0
            w-1/3
            -skew-x-12
            bg-gradient-to-r
            from-transparent
            via-white/20
            to-transparent
          "

        />



        {/* =================================================
            Celebration icon
            ================================================= */}

        <motion.div

          initial={{
            opacity: 0,
            scale: 0.4,
            rotate: -15
          }}

          animate={{
            opacity: 1,
            scale: [
              0.4,
              1.15,
              0.95,
              1
            ],
            rotate: [
              -15,
              8,
              -4,
              0
            ]
          }}

          transition={{
            duration: 0.9,
            delay: 0.25,
            ease: "easeOut"
          }}

          className="
            relative
            mx-auto
            mb-4
            flex
            h-24
            w-24
            items-center
            justify-center
            rounded-full
            bg-white/10
            text-6xl
            shadow-xl
          "

        >

          {gift.emoji}


          <motion.div

            animate={{
              rotate: 360
            }}

            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "linear"
            }}

            className="
              pointer-events-none
              absolute
              inset-0
              rounded-full
              border
              border-dashed
              border-white/30
            "

          />

        </motion.div>



        {/* =================================================
            Completion heading
            ================================================= */}

        <motion.p

          initial={{
            opacity: 0,
            y: 10
          }}

          animate={{
            opacity: 1,
            y: 0
          }}

          transition={{
            delay: 0.55,
            duration: 0.45
          }}

          className="
            text-xs
            font-semibold
            uppercase
            tracking-[0.3em]
            text-pink-200
          "

        >

          Journey Completed

        </motion.p>



        <motion.h1

          initial={{
            opacity: 0,
            y: 15
          }}

          animate={{
            opacity: 1,
            y: 0
          }}

          transition={{
            delay: 0.7,
            duration: 0.5
          }}

          className="
            mt-2
            font-display
            text-3xl
            font-semibold
            leading-tight
            text-white
            sm:text-4xl
          "

        >

          {gift.title}

        </motion.h1>



        {/* =================================================
            Subtitle
            ================================================= */}

        {
          gift.subtitle &&

          <motion.p

            initial={{
              opacity: 0
            }}

            animate={{
              opacity: 1
            }}

            transition={{
              delay: 0.9,
              duration: 0.5
            }}

            className="
              mt-2
              text-sm
              font-medium
              text-white/60
            "

          >

            {gift.subtitle}

          </motion.p>

        }



        {/* =================================================
            Divider
            ================================================= */}

        <motion.div

          initial={{
            scaleX: 0
          }}

          animate={{
            scaleX: 1
          }}

          transition={{
            delay: 1,
            duration: 0.5
          }}

          className="
            my-6
            h-px
            origin-center
            bg-gradient-to-r
            from-transparent
            via-white/30
            to-transparent
          "

        />



        {/* =================================================
            Reward image
            ================================================= */}

        {
          gift.image &&

          <motion.div

            initial={{
              opacity: 0,
              scale: 0.75,
              y: 20
            }}

            animate={{
              opacity: 1,
              scale: 1,
              y: 0
            }}

            transition={{
              delay: 1.05,
              duration: 0.7,
              ease: "easeOut"
            }}

            className="
              relative
              mx-auto
              w-fit
            "

          >

            <motion.div

              animate={{
                opacity: [
                  0.25,
                  0.6,
                  0.25
                ],
                scale: [
                  0.95,
                  1.05,
                  0.95
                ]
              }}

              transition={{
                duration: 2.5,
                repeat: Infinity
              }}

              className="
                absolute
                -inset-3
                rounded-3xl
                bg-pink-400/30
                blur-xl
              "

            />

            <img

              src={
                gift.image
              }

              alt={
                gift.title
              }

              className="
                relative
                h-52
                w-52
                rounded-2xl
                border
                border-white/30
                object-cover
                shadow-2xl
                sm:h-56
                sm:w-56
              "

            />

          </motion.div>

        }



        {/* =================================================
            Message
            ================================================= */}

        <motion.p

          initial={{
            opacity: 0,
            y: 12
          }}

          animate={{
            opacity: 1,
            y: 0
          }}

          transition={{
            delay:
              gift.image
                ? 1.45
                : 1.05,

            duration: 0.5
          }}

          className="
            mt-6
            text-sm
            leading-relaxed
            text-white/75
            sm:text-base
          "

        >

          {gift.message}

        </motion.p>



        {/* =================================================
            Reward unlocked panel
            ================================================= */}

        <motion.div

          initial={{
            opacity: 0,
            y: 15
          }}

          animate={{
            opacity: 1,
            y: 0
          }}

          transition={{
            delay:
              gift.image
                ? 1.75
                : 1.35,

            duration: 0.5
          }}

          className="
            relative
            mt-6
            overflow-hidden
            rounded-2xl
            border
            border-white/10
            bg-white/10
            p-4
          "

        >

          <motion.div

            animate={{
              x: [
                "-100%",
                "100%"
              ]
            }}

            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatDelay: 2
            }}

            className="
              pointer-events-none
              absolute
              inset-y-0
              w-1/3
              -skew-x-12
              bg-gradient-to-r
              from-transparent
              via-white/10
              to-transparent
            "

          />

          <p
            className="
              relative
              text-sm
              font-semibold
              text-white
            "
          >

            {gift.rewardLabel ??
              "🎁 Your reward is unlocked"}

          </p>


          <p
            className="
              relative
              mt-2
              text-xs
              leading-relaxed
              text-white/50
            "
          >

            Take a screenshot and send it to me ❤️

          </p>

        </motion.div>



        {/* =================================================
            Continue
            ================================================= */}

        {
          onContinue &&

          <motion.button

            initial={{
              opacity: 0,
              y: 15
            }}

            animate={{
              opacity: 1,
              y: 0
            }}

            transition={{
              delay:
                gift.image
                  ? 2.05
                  : 1.65,

              duration: 0.45
            }}

            onClick={
              onContinue
            }

            whileHover={{
              scale: 1.02
            }}

            whileTap={{
              scale: 0.96
            }}

            className="
              mt-6
              w-full
              rounded-xl
              bg-purple-700
              py-3
              font-medium
              text-white
              shadow-lg
              shadow-purple-900/30
              transition
            "

          >

            Continue Journey ❤️

          </motion.button>

        }


      </motion.div>

    </div>

  );

}