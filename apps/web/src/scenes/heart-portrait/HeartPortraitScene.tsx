/**
 * HeartPortraitScene
 *
 * Romantic surprise scene.
 *
 * Displays an interactive heart particle portrait reveal.
 *
 * The actual animation engine lives inside:
 * features/heart-portrait/HeartPortraitReveal.tsx
 *
 * Future:
 * imageSrc will come from Media API:
 *
 * media_assets
 *      |
 * usage = portrait
 * category = birthday
 *
 */


import SceneLayout from "@/components/global/SceneLayout";

import HeartPortraitReveal from "@/features/heart-portrait/HeartPortraitReveal";


export default function HeartPortraitScene() {


  return (

    <SceneLayout
      mode="night"
      showFireflies
    >


      <div
        className="
        relative
        flex
        min-h-screen
        w-full
        items-center
        justify-center
        overflow-hidden
        px-4
        "
      >


        <HeartPortraitReveal

          /*
            Temporary image.

            Replace later with:
            Cloudinary URL from Media API.

            Example:
            const portrait =
              await getPortraitImage();

          */

          imageSrc="
          https://res.cloudinary.com/demo/image/upload/v1690000000/sample.jpg
          "


          title="
          A Little Surprise For You ❤️
          "


        />


      </div>


    </SceneLayout>

  );

}