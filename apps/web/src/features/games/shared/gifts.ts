// ============================================================
// Game Gift Configuration
// ============================================================


export interface GameGift {


  title:string;


  subtitle?:string;


  message:string;


  emoji:string;


  image?:string;


  rewardLabel?:string;


}



// ============================================================
// Final Game Rewards
// ============================================================


export const GAME_GIFTS:
Record<string,GameGift>
={



  // ==========================================================
  // GAME 1 — MEMORY MATCH
  // ==========================================================

  "memory-match":{


    title:
      "You Remember Us Perfectly ❤️",


    subtitle:
      "Every memory found its matching heart.",


    message:
      "You made it through every level and matched the memories hidden throughout our journey. Some moments may be small, but together they make our story unforgettable. ❤️",


    emoji:
      "💝",


    rewardLabel:
      "🎁 Memory Master Reward Unlocked"


  },



  // ==========================================================
  // GAME 2 — OUR STORY PUZZLE
  // ==========================================================

  "story-puzzle":{


    title:
      "You Rebuilt Our Story 🧩❤️",


    subtitle:
      "Piece by piece, our story came back together.",


    message:
      "Every piece belonged somewhere, just like every moment in our journey. You put them all back together and completed another chapter of our story. ❤️",


    emoji:
      "🧩",


    rewardLabel:
      "🎁 Story Keeper Reward Unlocked"


  },



  // ==========================================================
  // GAME 3 — HIDDEN OBJECTS
  // ==========================================================

  "hidden-objects":{


    title:
      "You Found Every Hidden Memory 🔍❤️",


    subtitle:
      "Nothing escaped your eyes.",


    message:
      "You searched through every scene and discovered all the little memories hiding inside. Sometimes the most beautiful moments are the ones we almost miss. ❤️",


    emoji:
      "🔎",


    rewardLabel:
      "🎁 Memory Explorer Reward Unlocked"


  },



  // ==========================================================
  // GAME 4 — CUPID ARROW
  // ==========================================================

  "cupid-arrow":{


    title:
      "Cupid Has Chosen You 💘",


    subtitle:
      "Every shot found its mark.",


    message:
      "Your aim was true and every heart was waiting for your arrow. Cupid would definitely approve of that performance. Keep that heart aimed in the right direction. ❤️",


    emoji:
      "🏹",


    rewardLabel:
      "🎁 Cupid Champion Reward Unlocked"


  },



  // ==========================================================
  // GAME 5 — HEART RUSH
  // ==========================================================

  "heart-rush":{


    title:
      "You Conquered the Heart Rush 💖",


    subtitle:
      "You caught the hearts and survived the danger.",


    message:
      "You raced against time, collected precious hearts, survived the bombs and made it through the entire challenge. That heart definitely knows how to handle pressure. ❤️",


    emoji:
      "💖",


    rewardLabel:
      "🎁 Heart Rush Champion Reward Unlocked"


  },



  // ==========================================================
  // FUTURE GAME — GUESS MEMORY
  // ==========================================================

  "guess-memory":{


    title:
      "Memory Master 📸",


    subtitle:
      "You remembered what mattered most.",


    message:
      "You remembered the moments that make our journey special. Some memories never really fade. ❤️",


    emoji:
      "📸",


    rewardLabel:
      "🎁 Memory Master Reward Unlocked"


  },



  // ==========================================================
  // FUTURE GAME — LOVE QUIZ
  // ==========================================================

  "love-quiz":{


    title:
      "Heart Keeper 💌",


    subtitle:
      "You know our story by heart.",


    message:
      "You know the little details, the big moments and the memories that make our journey ours. ❤️",


    emoji:
      "💌",


    rewardLabel:
      "🎁 Heart Keeper Reward Unlocked"


  },



  // ==========================================================
  // FUTURE GAME — TREASURE HUNT
  // ==========================================================

  "treasure-hunt":{


    title:
      "Treasure Found 🔐",


    subtitle:
      "The greatest treasure was waiting at the end.",


    message:
      "You followed the clues, discovered the secret and reached the treasure. But perhaps the real treasure was the journey itself. ❤️",


    emoji:
      "🏆",


    rewardLabel:
      "🎁 Treasure Hunter Reward Unlocked"


  }


};



// ============================================================
// Get Gift
// ============================================================


export function getGameGift(
  gameId:string
):GameGift{


  return (

    GAME_GIFTS[gameId]

    ??

    {


      title:
        "Surprise Unlocked",


      subtitle:
        "You completed the journey ❤️",


      message:
        "Congratulations! You made it to the end of this adventure. ❤️",


      emoji:
        "🎉",


      rewardLabel:
        "🎁 Your Reward Is Unlocked"


    }

  );

}