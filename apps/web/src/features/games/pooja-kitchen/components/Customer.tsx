/**
 * Customer
 *
 * Renders a customer character at the counter.
 *
 * Supports:
 * - normal avatar
 * - happy avatar
 * - angry avatar
 * - future patience based mood switching
 *
 * Uses transparent character PNGs.
 * No circular avatar clipping.
 */

import { motion } from "framer-motion";

import type { CustomerState } from "../data/types";

import {
  customerContainerTransition,
  customerContainerVariants,
  resolveCustomerMotion,
} from "../animations/customerAnimations";



export interface CustomerProps {

  name: string;

  avatar: string;

  happyAvatar: string;

  angryAvatar: string;


  /**
   * Total patience allowed for this customer
   */
  patienceSeconds: number;


  /**
   * Current remaining patience
   */
  patienceRemaining: number;


  /**
   * Current customer state
   */
  state: CustomerState;


  onSelect?: () => void;

  onExitComplete?: () => void;

}





function resolveAvatar(
  props: CustomerProps
): string {


  if (props.state === "happy") {

    return (
      props.happyAvatar ||
      props.avatar
    );

  }


  if (props.state === "angry") {

    return (
      props.angryAvatar ||
      props.avatar
    );

  }


  return props.avatar;

}





function AvatarImage(
{
  src,
  name,
}: {
  src: string;
  name: string;
}) {


  if (!src) {

    return (

      <div
        className="
        flex
        h-full
        w-full
        items-center
        justify-center
        text-4xl
        font-bold
        text-white
        "
      >

        {
          name
            .charAt(0)
            .toUpperCase()
        }

      </div>

    );

  }



  return (

    <img

      src={src}

      alt={name}

      className="
      h-28
w-20

object-contain
object-bottom

      "

      draggable={false}

    />

  );

}





export function Customer(
props: CustomerProps
) {


  const {

    name,

    state,

    onSelect,

    onExitComplete,

  } = props;



  return (

    <motion.button

      type="button"

      layout

      onClick={onSelect}


      onAnimationComplete={() => {

        if (
          state === "leaving"
        ) {

          onExitComplete?.();

        }

      }}


      initial="entering"

      animate={state}

      exit="leaving"


      variants={
        customerContainerVariants
      }


      transition={
        customerContainerTransition
      }


      className="
      relative
flex
w-20
h-28
flex-shrink-0
flex-col
items-center
justify-end

      "


      aria-label={
        `Customer ${name}`
      }

    >



      <motion.div


        className="
        relative
w-24
h-32
overflow-visible
flex
items-end
justify-center

        "


        {...resolveCustomerMotion(state)}

      >



        <AvatarImage

          src={
            resolveAvatar(props)
          }

          name={name}

        />


      </motion.div>





    </motion.button>

  );

}