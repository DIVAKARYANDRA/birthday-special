import {
  useEffect,
  useState,
} from "react";


import {
  mediaApi,
} from "@/api/mediaApi";


import {
  getCloudinaryUrl,
} from "@/utils/mediaUrl";


import {
  createHeartRushLevel,
  listHeartRushLevels,
  deleteHeartRushLevel,

  createHeartRushObject,
  listHeartRushObjects,
  deleteHeartRushObject,

  type HeartRushLevel,
  type HeartRushObject,
} from "./heartRushApi";



export default function HeartRushEditorPage(){


  /* ==========================================================
     MEDIA
     ========================================================== */

  const [
    media,
    setMedia
  ] =
  useState<any[]>([]);


  const [
    selectedBackground,
    setSelectedBackground
  ] =
  useState<any>(null);


  const [
    selectedObjectImage,
    setSelectedObjectImage
  ] =
  useState<any>(null);



  /* ==========================================================
     LEVELS
     ========================================================== */

  const [
    levels,
    setLevels
  ] =
  useState<HeartRushLevel[]>([]);


  const [
    selectedLevel,
    setSelectedLevel
  ] =
  useState<HeartRushLevel | null>(null);


  const [
    objects,
    setObjects
  ] =
  useState<HeartRushObject[]>([]);



  /* ==========================================================
     LEVEL FORM
     ========================================================== */

  const [
    level,
    setLevel
  ] =
  useState(1);


  const [
    timeLimit,
    setTimeLimit
  ] =
  useState(60);


  const [
    completionScore,
    setCompletionScore
  ] =
  useState(500);


  const [
    spawnSpeed,
    setSpawnSpeed
  ] =
  useState("medium");


  const [
    spawnFrequency,
    setSpawnFrequency
  ] =
  useState(1500);


  const [
    maxObjects,
    setMaxObjects
  ] =
  useState(5);



  /* ==========================================================
     OBJECT FORM
     ========================================================== */

  const [
    visualType,
    setVisualType
  ] =
  useState("emoji");


  const [
    emoji,
    setEmoji
  ] =
  useState("❤️");


  const [
    behaviorType,
    setBehaviorType
  ] =
  useState("normal");


  const [
    objectName,
    setObjectName
  ] =
  useState("Love Heart");


  const [
    points,
    setPoints
  ] =
  useState(10);


  const [
    fallSpeed,
    setFallSpeed
  ] =
  useState(2);


  const [
    rarity,
    setRarity
  ] =
  useState("common");


  const [
    isActive,
    setIsActive
  ] =
  useState(true);



  /* ==========================================================
     INITIAL LOAD
     ========================================================== */

  useEffect(()=>{

    async function load(){

      try{

        const mediaData =
          await mediaApi.list();


        setMedia(
          mediaData.filter(
            (item:any)=>
              item.usage === "game"
          )
        );


        const levelData =
          await listHeartRushLevels();


        setLevels(
          levelData
        );

      }
      catch(error){

        console.error(
          "Heart Rush admin loading failed",
          error
        );

      }

    }


    void load();

  },[]);



  /* ==========================================================
     CREATE LEVEL
     ========================================================== */

  async function saveLevel(){

    if(!selectedBackground){

      alert(
        "Please select a background image."
      );

      return;

    }


    if(level <= 0){

      alert(
        "Level must be greater than zero."
      );

      return;

    }


    if(timeLimit <= 0){

      alert(
        "Time limit must be greater than zero."
      );

      return;

    }


    if(completionScore < 0){

      alert(
        "Completion score cannot be negative."
      );

      return;

    }


    if(spawnFrequency <= 0){

      alert(
        "Spawn frequency must be greater than zero."
      );

      return;

    }


    if(maxObjects <= 0){

      alert(
        "Maximum objects must be greater than zero."
      );

      return;

    }


    try{

      await createHeartRushLevel({

        media_id:
          selectedBackground.id,

        level,

        time_limit:
          timeLimit,

        completion_score:
          completionScore,

        spawn_speed:
          spawnSpeed,

        spawn_frequency:
          spawnFrequency,

        max_objects:
          maxObjects,

      });


      const updated =
        await listHeartRushLevels();


      setLevels(
        updated
      );


      alert(
        `Heart Rush Level ${level} created successfully.`
      );

    }
    catch(error){

      console.error(
        "Heart Rush level creation failed",
        error
      );


      alert(
        "Unable to create level. Please check the server logs."
      );

    }

  }



  /* ==========================================================
     SELECT LEVEL
     ========================================================== */

  async function selectLevel(
    item:HeartRushLevel
  ){

    setSelectedLevel(
      item
    );


    const background =
      media.find(
        image =>
          image.id === item.media_id
      );


    if(background){

      setSelectedBackground(
        background
      );

    }


    try{

      const data =
        await listHeartRushObjects(
          item.id
        );


      setObjects(
        data
      );

    }
    catch(error){

      console.error(
        "Heart Rush objects loading failed",
        error
      );


      setObjects([]);

    }

  }



  /* ==========================================================
     CREATE OBJECT
     ========================================================== */

  async function addObject(){

    if(!selectedLevel){

      alert(
        "Please select a level first."
      );

      return;

    }


    if(
      visualType === "image"
      &&
      !selectedObjectImage
    ){

      alert(
        "Please select an image for this object."
      );

      return;

    }


    if(
      visualType === "emoji"
      &&
      !emoji.trim()
    ){

      alert(
        "Please enter an emoji."
      );

      return;

    }


    if(!objectName.trim()){

      alert(
        "Please enter an object name."
      );

      return;

    }


    if(fallSpeed <= 0){

      alert(
        "Fall speed must be greater than zero."
      );

      return;

    }


    try{

      await createHeartRushObject(

        selectedLevel.id,

        {

          visual_type:
            visualType,

          emoji:
            visualType === "emoji"
              ? emoji
              : null,

          media_id:
            visualType === "image"
              ? selectedObjectImage?.id
              : null,

          behavior_type:
            behaviorType,

          name:
            objectName,

          points,

          fall_speed:
            fallSpeed,

          rarity,

          is_active:
            isActive,

        }

      );


      const updated =
        await listHeartRushObjects(
          selectedLevel.id
        );


      setObjects(
        updated
      );


      setSelectedObjectImage(
        null
      );

    }
    catch(error){

      console.error(
        "Heart Rush object creation failed",
        error
      );


      alert(
        "Unable to create object. Please check the server logs."
      );

    }

  }



  /* ==========================================================
     DELETE OBJECT
     ========================================================== */

  async function removeObject(
    objectId:string
  ){

    if(
      !window.confirm(
        "Delete this Heart Rush object?"
      )
    ){

      return;

    }


    try{

      await deleteHeartRushObject(
        objectId
      );


      if(selectedLevel){

        const updated =
          await listHeartRushObjects(
            selectedLevel.id
          );


        setObjects(
          updated
        );

      }

    }
    catch(error){

      console.error(
        "Heart Rush object deletion failed",
        error
      );


      alert(
        "Unable to delete object."
      );

    }

  }



  /* ==========================================================
     DELETE LEVEL
     ========================================================== */

  async function removeLevel(
    levelId:string
  ){

    if(
      !window.confirm(
        "Delete this Heart Rush level and all its objects?"
      )
    ){

      return;

    }


    try{

      await deleteHeartRushLevel(
        levelId
      );


      const updated =
        await listHeartRushLevels();


      setLevels(
        updated
      );


      if(
        selectedLevel?.id === levelId
      ){

        setSelectedLevel(
          null
        );

        setObjects(
          []
        );

      }

    }
    catch(error){

      console.error(
        "Heart Rush level deletion failed",
        error
      );


      alert(
        "Unable to delete level."
      );

    }

  }



  /* ==========================================================
     IMAGE HELPER
     ========================================================== */

  function imageUrl(
    image:any
  ){

    return getCloudinaryUrl(
      image.external_reference
    );

  }



  /* ==========================================================
     RENDER
     ========================================================== */

  return (

    <div
      className="
        space-y-8
        p-6
      "
    >


      <h1
        className="
          text-2xl
          font-semibold
        "
      >

        ❤️ Heart Rush

      </h1>


      <p
        className="
          text-sm
          text-gray-500
        "
      >

        Configure falling hearts, bonuses,
        penalties and bombs for each level.

      </p>



      {/* ======================================================
          BACKGROUND
          ====================================================== */}

      <div
        className="
          rounded-xl
          border
          bg-white
          p-5
          space-y-4
        "
      >

        <h2
          className="
            font-semibold
          "
        >

          Select Background Image

        </h2>


        <div
          className="
            grid
            grid-cols-1
            gap-4
            md:grid-cols-4
          "
        >

          {

            media.map(
              (image:any)=>(

                <div

                  key={
                    image.id
                  }

                  onClick={()=>{

                    setSelectedBackground(
                      image
                    );

                  }}

                  className={`
                    cursor-pointer
                    rounded-xl
                    border
                    bg-white
                    p-3

                    ${
                      selectedBackground?.id === image.id

                      ?

                      "border-purple-600 ring-2 ring-purple-300"

                      :

                      "border-gray-200"
                    }
                  `}

                >

                  <img

                    src={
                      imageUrl(image)
                    }

                    alt={
                      image.alt_text ??
                      image.original_filename
                    }

                    className="
                      h-40
                      w-full
                      rounded-lg
                      object-cover
                    "

                  />


                  <p
                    className="
                      mt-2
                      truncate
                      text-sm
                    "
                  >

                    {
                      image.original_filename
                    }

                  </p>

                </div>

              )
            )

          }

        </div>

      </div>



      {/* ======================================================
          LEVEL CREATION
          ====================================================== */}

      <div
        className="
          rounded-xl
          border
          bg-white
          p-5
          space-y-5
        "
      >

        <h2
          className="
            font-semibold
          "
        >

          Create Heart Rush Level

        </h2>


        <div
          className="
            grid
            grid-cols-1
            gap-4
            md:grid-cols-2
          "
        >

          <label
            className="
              space-y-1
            "
          >

            <span
              className="
                text-sm
                font-medium
              "
            >

              Level Number

            </span>

            <input

              type="number"

              min="1"

              value={
                level
              }

              onChange={
                e =>
                  setLevel(
                    Number(
                      e.target.value
                    )
                  )
              }

              className="
                w-full
                rounded
                border
                p-2
              "

            />

          </label>



          <label
            className="
              space-y-1
            "
          >

            <span
              className="
                text-sm
                font-medium
              "
            >

              Time Limit (seconds)

            </span>

            <input

              type="number"

              min="1"

              value={
                timeLimit
              }

              onChange={
                e =>
                  setTimeLimit(
                    Number(
                      e.target.value
                    )
                  )
              }

              className="
                w-full
                rounded
                border
                p-2
              "

            />

          </label>



          <label
            className="
              space-y-1
            "
          >

            <span
              className="
                text-sm
                font-medium
              "
            >

              Completion Score

            </span>

            <input

              type="number"

              min="0"

              value={
                completionScore
              }

              onChange={
                e =>
                  setCompletionScore(
                    Number(
                      e.target.value
                    )
                  )
              }

              className="
                w-full
                rounded
                border
                p-2
              "

            />

          </label>



          <label
            className="
              space-y-1
            "
          >

            <span
              className="
                text-sm
                font-medium
              "
            >

              Spawn Speed

            </span>

            <select

              value={
                spawnSpeed
              }

              onChange={
                e =>
                  setSpawnSpeed(
                    e.target.value
                  )
              }

              className="
                w-full
                rounded
                border
                p-2
              "

            >

              <option value="slow">
                Slow
              </option>

              <option value="medium">
                Medium
              </option>

              <option value="fast">
                Fast
              </option>

            </select>

          </label>



          <label
            className="
              space-y-1
            "
          >

            <span
              className="
                text-sm
                font-medium
              "
            >

              Spawn Frequency (ms)

            </span>

            <input

              type="number"

              min="100"

              value={
                spawnFrequency
              }

              onChange={
                e =>
                  setSpawnFrequency(
                    Number(
                      e.target.value
                    )
                  )
              }

              className="
                w-full
                rounded
                border
                p-2
              "

            />

            <span
              className="
                text-xs
                text-gray-500
              "
            >

              Lower = objects appear more frequently.

            </span>

          </label>



          <label
            className="
              space-y-1
            "
          >

            <span
              className="
                text-sm
                font-medium
              "
            >

              Maximum Objects

            </span>

            <input

              type="number"

              min="1"

              value={
                maxObjects
              }

              onChange={
                e =>
                  setMaxObjects(
                    Number(
                      e.target.value
                    )
                  )
              }

              className="
                w-full
                rounded
                border
                p-2
              "

            />

          </label>

        </div>



        <button

          type="button"

          onClick={
            saveLevel
          }

          className="
            rounded
            bg-purple-700
            px-5
            py-2
            text-white
          "

        >

          Save Level

        </button>

      </div>



      {/* ======================================================
          EXISTING LEVELS
          ====================================================== */}

      <div
        className="
          rounded-xl
          border
          bg-white
          p-5
          space-y-4
        "
      >

        <h2
          className="
            font-semibold
          "
        >

          Existing Levels

        </h2>


        {

          levels.length === 0

          ?

          <p
            className="
              text-sm
              text-gray-500
            "
          >

            No Heart Rush levels configured yet.

          </p>

          :

          levels.map(
            item=>(

              <div

                key={
                  item.id
                }

                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                  rounded
                  border
                  p-3
                "

              >

                <button

                  type="button"

                  onClick={() =>
                    selectLevel(item)
                  }

                  className="
                    font-medium
                    text-purple-700
                  "

                >

                  Level {item.level}

                </button>


                <div
                  className="
                    flex
                    items-center
                    gap-4
                    text-sm
                    text-gray-500
                  "
                >

                  <span>

                    {item.time_limit}s

                  </span>

                  <span>

                    Target {item.completion_score}

                  </span>

                  <button

                    type="button"

                    onClick={() =>
                      removeLevel(
                        item.id
                      )
                    }

                    className="
                      rounded
                      bg-red-600
                      px-3
                      py-1
                      text-white
                    "

                  >

                    Delete

                  </button>

                </div>

              </div>

            )
          )

        }

      </div>



      {/* ======================================================
          OBJECT EDITOR
          ====================================================== */}

      {

        selectedLevel &&

        <div
          className="
            rounded-xl
            border
            bg-white
            p-5
            space-y-6
          "
        >

          <div>

            <h2
              className="
                font-semibold
              "
            >

              Add Object to Level {selectedLevel.level}

            </h2>

            <p
              className="
                mt-1
                text-sm
                text-gray-500
              "
            >

              Visual appearance and behavior are independent.
              An image can therefore be configured as a bomb.

            </p>

          </div>



          {/* ==================================================
              VISUAL TYPE
              ================================================== */}

          <label
            className="
              block
              space-y-1
            "
          >

            <span
              className="
                text-sm
                font-medium
              "
            >

              Visual Type

            </span>

            <select

              value={
                visualType
              }

              onChange={
                e => {

                  const value =
                    e.target.value;

                  setVisualType(
                    value
                  );

                  if(
                    value === "emoji"
                  ){

                    setSelectedObjectImage(
                      null
                    );

                  }

                }
              }

              className="
                w-full
                rounded
                border
                p-2
              "

            >

              <option value="emoji">
                Emoji
              </option>

              <option value="image">
                Image
              </option>

            </select>

          </label>



          {/* ==================================================
              EMOJI
              ================================================== */}

          {

            visualType === "emoji" &&

            <label
              className="
                block
                space-y-1
              "
            >

              <span
                className="
                  text-sm
                  font-medium
                "
              >

                Emoji

              </span>

              <input

                value={
                  emoji
                }

                onChange={
                  e =>
                    setEmoji(
                      e.target.value
                    )
                }

                className="
                  w-full
                  rounded
                  border
                  p-2
                "

                placeholder="❤️"

              />

            </label>

          }



          {/* ==================================================
              IMAGE SELECTOR
              ================================================== */}

          {

            visualType === "image" &&

            <div
              className="
                space-y-3
              "
            >

              <p
                className="
                  text-sm
                  font-medium
                "
              >

                Select Object Image

              </p>


              <div
                className="
                  grid
                  grid-cols-2
                  gap-3
                  md:grid-cols-4
                "
              >

                {

                  media.map(
                    (image:any)=>(

                      <div

                        key={
                          image.id
                        }

                        onClick={() =>
                          setSelectedObjectImage(
                            image
                          )
                        }

                        className={`

                          cursor-pointer
                          rounded
                          border
                          p-2

                          ${
                            selectedObjectImage?.id === image.id

                            ?

                            "border-purple-600 ring-2 ring-purple-300"

                            :

                            "border-gray-200"
                          }

                        `}

                      >

                        <img

                          src={
                            imageUrl(image)
                          }

                          alt={
                            image.alt_text ??
                            image.original_filename
                          }

                          className="
                            h-28
                            w-full
                            rounded
                            object-cover
                          "

                        />

                        <p
                          className="
                            mt-1
                            truncate
                            text-xs
                          "
                        >

                          {
                            image.original_filename
                          }

                        </p>

                      </div>

                    )
                  )

                }

              </div>

            </div>

          }



          {/* ==================================================
              BEHAVIOR
              ================================================== */}

          <label
            className="
              block
              space-y-1
            "
          >

            <span
              className="
                text-sm
                font-medium
              "
            >

              Behavior

            </span>

            <select

              value={
                behaviorType
              }

              onChange={
                e =>
                  setBehaviorType(
                    e.target.value
                  )
              }

              className="
                w-full
                rounded
                border
                p-2
              "

            >

              <option value="normal">
                Normal ❤️
              </option>

              <option value="bonus">
                Bonus 💖
              </option>

              <option value="penalty">
                Penalty 💔
              </option>

              <option value="bomb">
                Bomb 💣
              </option>

            </select>

          </label>



          {/* ==================================================
              NAME
              ================================================== */}

          <label
            className="
              block
              space-y-1
            "
          >

            <span
              className="
                text-sm
                font-medium
              "
            >

              Object Name

            </span>

            <input

              value={
                objectName
              }

              onChange={
                e =>
                  setObjectName(
                    e.target.value
                  )
              }

              className="
                w-full
                rounded
                border
                p-2
              "

              placeholder="Golden Heart"

            />

          </label>



          {/* ==================================================
              OBJECT SETTINGS
              ================================================== */}

          <div
            className="
              grid
              grid-cols-1
              gap-4
              md:grid-cols-3
            "
          >

            <label
              className="
                space-y-1
              "
            >

              <span
                className="
                  text-sm
                  font-medium
                "
              >

                Points

              </span>

              <input

                type="number"

                value={
                  points
                }

                onChange={
                  e =>
                    setPoints(
                      Number(
                        e.target.value
                      )
                    )
                }

                className="
                  w-full
                  rounded
                  border
                  p-2
                "

              />

            </label>



            <label
              className="
                space-y-1
              "
            >

              <span
                className="
                  text-sm
                  font-medium
                "
              >

                Fall Speed

              </span>

              <input

                type="number"

                min="0.1"

                step="0.1"

                value={
                  fallSpeed
                }

                onChange={
                  e =>
                    setFallSpeed(
                      Number(
                        e.target.value
                      )
                    )
                }

                className="
                  w-full
                  rounded
                  border
                  p-2
                "

              />

            </label>



            <label
              className="
                space-y-1
              "
            >

              <span
                className="
                  text-sm
                  font-medium
                "
              >

                Rarity

              </span>

              <select

                value={
                  rarity
                }

                onChange={
                  e =>
                    setRarity(
                      e.target.value
                    )
                }

                className="
                  w-full
                  rounded
                  border
                  p-2
                "

              >

                <option value="common">
                  Common
                </option>

                <option value="rare">
                  Rare
                </option>

                <option value="special">
                  Special
                </option>

              </select>

            </label>

          </div>



          {/* ==================================================
              ACTIVE
              ================================================== */}

          <label
            className="
              flex
              items-center
              gap-2
            "
          >

            <input

              type="checkbox"

              checked={
                isActive
              }

              onChange={
                e =>
                  setIsActive(
                    e.target.checked
                  )
              }

            />

            <span
              className="
                text-sm
              "
            >

              Object is active

            </span>

          </label>



          <button

            type="button"

            onClick={
              addObject
            }

            className="
              rounded
              bg-purple-700
              px-5
              py-2
              text-white
            "

          >

            Add Object

          </button>



          {/* ==================================================
              EXISTING OBJECTS
              ================================================== */}

          <div
            className="
              space-y-3
            "
          >

            <h3
              className="
                font-semibold
              "
            >

              Existing Objects

            </h3>


            {

              objects.length === 0

              ?

              <p
                className="
                  text-sm
                  text-gray-500
                "
              >

                No objects configured for this level.

              </p>

              :

              objects.map(
                object=>(

                  <div

                    key={
                      object.id
                    }

                    className="
                      flex
                      items-center
                      justify-between
                      gap-4
                      rounded
                      border
                      p-3
                    "

                  >

                    <div
                      className="
                        flex
                        min-w-0
                        items-center
                        gap-3
                      "
                    >

                      {

                        object.visual_type === "emoji"

                        ?

                        <span
                          className="
                            text-3xl
                          "
                        >

                          {
                            object.emoji
                          }

                        </span>

                        :

                        object.media_id

                        ?

                        <img

                          src={

                            (()=>{

                              const image =
                                media.find(
                                  item =>
                                    item.id ===
                                    object.media_id
                                );

                              return image
                                ? imageUrl(image)
                                : "";

                            })()

                          }

                          alt={
                            object.name
                          }

                          className="
                            h-12
                            w-12
                            rounded
                            object-cover
                          "

                        />

                        :

                        <span
                          className="
                            text-3xl
                          "
                        >

                          ❤️

                        </span>

                      }


                      <div
                        className="
                          min-w-0
                        "
                      >

                        <p
                          className="
                            truncate
                            font-medium
                          "
                        >

                          {
                            object.name
                          }

                        </p>

                        <p
                          className="
                            text-xs
                            text-gray-500
                          "
                        >

                          {
                            object.behavior_type
                          }

                          {" • "}

                          {
                            object.points
                          }

                          {" points • "}

                          {
                            object.rarity
                          }

                        </p>

                      </div>

                    </div>


                    <button

                      type="button"

                      onClick={() =>
                        removeObject(
                          object.id
                        )
                      }

                      className="
                        shrink-0
                        rounded
                        bg-red-600
                        px-3
                        py-1
                        text-white
                      "

                    >

                      Delete

                    </button>

                  </div>

                )
              )

            }

          </div>

        </div>

      }

    </div>

  );

}