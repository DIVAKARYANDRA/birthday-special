export interface GameGift {


  title:string;


  message:string;


  emoji:string;


  image?:string;


}


export const GAME_GIFTS:
Record<string,GameGift>
={


  "memory-match":{


    title:
    "Your First Surprise ❤️",


    message:
    "You completed our beautiful memories journey. Take a screenshot and send it to me ❤️",


    emoji:
    "🎁",


    // Later you can add:
    // image:"/gifts/iphone.png"


  },

  "story-puzzle":{


  title:
  "Our Story Rebuilt 🧩❤️",


  message:
  "You successfully put our memories back together. A special surprise is waiting for you ❤️ Take a screenshot and send it to me 🎁",


  emoji:
  "🧩"


},


"hidden-objects":{

 title:"Memory Explorer 🔍",

 message:"You discovered every hidden moment ❤️",

 emoji:"🔍"

},


"cupid-arrow":{

  title:
  "Cupid Champion 💘",


  message:
  "You hit every heart and completed the Cupid challenge ❤️ Take a screenshot and send it to me 🎁",


  emoji:
  "🏹"

},

  "guess-memory":{


    title:
    "Memory Master 📸",


    message:
    "You remembered every special moment ❤️",


    emoji:
    "📸"


  },



  "love-quiz":{


    title:
    "Heart Keeper 💌",


    message:
    "You know our story better than anyone ❤️",


    emoji:
    "💖"


  },



  "treasure-hunt":{


    title:
    "Treasure Found 🔐",


    message:
    "You discovered the hidden surprise ❤️",


    emoji:
    "🏆"


  }


};





export function getGameGift(
gameId:string
):GameGift{


return (

GAME_GIFTS[gameId]

??

{

title:
"Surprise Unlocked",

message:
"Congratulations ❤️",

emoji:
"🎉"

}

);


}