/**
 * IntroSequence — Chapter One cinematic opening.
 *
 * Intro photographs are loaded dynamically from the public Media API.
 * Admin users can manage which images belong to the "intro" section
 * without changing this frontend code.
 *
 * The card automatically cycles through the configured intro photographs
 * and can be skipped by tapping anywhere.
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

import {
  getIntroImages,
  type IntroImage,
} from "@/api/introApi";

import AmbientBackground from "@/components/global/AmbientBackground";
import { EASE_OUT } from "@/animations/motionPrimitives";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const AUTO_ADVANCE_MS = 8500;
const PHOTO_INTERVAL_MS = 2100;

export default function IntroSequence() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();

  const [images, setImages] = useState<IntroImage[]>([]);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [imagesLoading, setImagesLoading] = useState(true);

  function continueToWorld() {
    navigate("/world");
  }

  /*
   * Load Intro images from the public Media API.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadImages() {
      try {
        setImagesLoading(true);

        const data = await getIntroImages();

        if (!cancelled) {
          setImages(data);
          setCurrentPhoto(0);
        }
      } catch (error) {
        console.error(
          "Failed to load intro images:",
          error,
        );

        if (!cancelled) {
          setImages([]);
        }
      } finally {
        if (!cancelled) {
          setImagesLoading(false);
        }
      }
    }

    void loadImages();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Automatically cycle through Admin-managed Intro images.
   */
  useEffect(() => {
    if (reducedMotion || images.length <= 1) {
      return;
    }

    const photoTimer = window.setInterval(() => {
      setCurrentPhoto((current) => {
        if (current >= images.length - 1) {
          return 0;
        }

        return current + 1;
      });
    }, PHOTO_INTERVAL_MS);

    return () => {
      window.clearInterval(photoTimer);
    };
  }, [reducedMotion, images.length]);

  /*
   * If the number of images changes, make sure the current index
   * is still valid.
   */
  useEffect(() => {
    if (images.length === 0) {
      setCurrentPhoto(0);
      return;
    }

    if (currentPhoto >= images.length) {
      setCurrentPhoto(0);
    }
  }, [images.length, currentPhoto]);

  /*
   * Automatically continue to the World Map.
   */
  useEffect(() => {
    const advanceTimer = window.setTimeout(
      continueToWorld,
      AUTO_ADVANCE_MS,
    );

    return () => {
      window.clearTimeout(advanceTimer);
    };
  }, []);

  const currentImage = images[currentPhoto];

  return (
    <AmbientBackground
      mode="twilight"
      showFireflies
    >
      <button
        type="button"
        onClick={continueToWorld}
        aria-label="Continue to the story"
        className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6 text-center"
      >
        {/* Atmospheric glow */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-400/10 blur-3xl"
          animate={
            reducedMotion
              ? undefined
              : {
                  scale: [1, 1.15, 1],
                  opacity: [0.35, 0.6, 0.35],
                }
          }
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Floating particles */}
        {!reducedMotion && (
          <>
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute left-[18%] top-[24%] text-xs text-white/50"
              animate={{
                y: [0, -14, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              ✦
            </motion.span>

            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute right-[20%] top-[30%] text-sm text-amber-200/60"
              animate={{
                y: [0, 12, 0],
                opacity: [0.25, 0.9, 0.25],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.8,
              }}
            >
              ✧
            </motion.span>

            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-[25%] left-[25%] text-xs text-white/40"
              animate={{
                y: [0, -10, 0],
                opacity: [0.15, 0.7, 0.15],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.2,
              }}
            >
              ·
            </motion.span>
          </>
        )}

        {/* Chapter heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: EASE_OUT,
          }}
          className="relative z-10 mb-8"
        >
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">
            Chapter One
          </p>

          <h1 className="mt-2 font-display text-3xl text-white sm:text-4xl">
            Our Story
          </h1>
        </motion.div>

        {/* Photo book */}
        <motion.div
          initial={
            reducedMotion
              ? { opacity: 1, scale: 1 }
              : {
                  opacity: 0,
                  scale: 0.82,
                  rotate: -2,
                }
          }
          animate={{
            opacity: 1,
            scale: 1,
            rotate: 0,
          }}
          transition={{
            duration: 1,
            delay: reducedMotion ? 0 : 0.35,
            ease: EASE_OUT,
          }}
          className="relative z-10"
        >
          {/* Outer glow */}
          <motion.div
            aria-hidden="true"
            className="absolute -inset-5 rounded-[2rem] bg-purple-300/10 blur-2xl"
            animate={
              reducedMotion
                ? undefined
                : {
                    opacity: [0.25, 0.5, 0.25],
                  }
            }
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Card */}
          <div
            className="relative h-[360px] w-[250px] overflow-hidden rounded-2xl border border-white/15 bg-[#211635]/80 p-2 shadow-2xl backdrop-blur-sm sm:h-[390px] sm:w-[275px]"
            style={{
              perspective: "1200px",
            }}
          >
            {imagesLoading ? (
              /* Loading state */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-[#30204b] to-[#171024]"
              >
                <div className="text-center">
                  <motion.div
                    animate={
                      reducedMotion
                        ? undefined
                        : {
                            rotate: [0, 360],
                          }
                    }
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="text-2xl"
                  >
                    ✨
                  </motion.div>

                  <p className="mt-3 text-xs text-white/40">
                    Opening our story...
                  </p>
                </div>
              </motion.div>
            ) : currentImage ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImage.id}
                  initial={
                    reducedMotion
                      ? { opacity: 1 }
                      : {
                          opacity: 0,
                          rotateY: 90,
                          scale: 0.92,
                        }
                  }
                  animate={{
                    opacity: 1,
                    rotateY: 0,
                    scale: 1,
                  }}
                  exit={
                    reducedMotion
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          rotateY: -90,
                          scale: 0.92,
                        }
                  }
                  transition={{
                    duration: reducedMotion
                      ? 0.2
                      : 0.7,
                    ease: EASE_OUT,
                  }}
                  className="relative h-full w-full overflow-hidden rounded-xl"
                  style={{
                    transformStyle: "preserve-3d",
                  }}
                >
                  <img
                    src={currentImage.url}
                    alt={
                      currentImage.alt_text ??
                      `Our story — memory ${
                        currentPhoto + 1
                      }`
                    }
                    className="h-full w-full object-cover"
                  />

                  {/* Image overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />

                  {/* Photo caption */}
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-white/65">
                      A moment to remember
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : (
              /* No Intro images configured */
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-[#30204b] to-[#171024]">
                <div className="px-6 text-center">
                  <div className="text-3xl">
                    ✨
                  </div>

                  <p className="mt-3 text-sm text-white/60">
                    Our story is waiting to be filled.
                  </p>

                  <p className="mt-2 text-xs text-white/30">
                    Add Intro images from the Admin panel.
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Progress dots */}
        {images.length > 0 && (
          <div className="relative z-10 mt-7 flex items-center gap-2">
            {images.map((image, index) => (
              <motion.span
                key={image.id}
                className="h-1.5 rounded-full bg-white/40"
                animate={{
                  width:
                    currentPhoto === index
                      ? 22
                      : 6,
                  opacity:
                    currentPhoto === index
                      ? 1
                      : 0.35,
                }}
                transition={{
                  duration: 0.3,
                }}
              />
            ))}
          </div>
        )}

        {/* Continue hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 1,
            delay: 1.4,
          }}
          className="relative z-10 mt-7 text-xs text-white/40"
        >
          Tap to continue
        </motion.p>
      </button>
    </AmbientBackground>
  );
}