export interface GamePasswordConfig {
  password: string;
  title: string;
  hint: string;
}


export const GAME_PASSWORDS: Record<string, GamePasswordConfig> = {


  "memory-match": {

    password: "MEMORY2006",

    title:
      "Memory Match ❤️",

    hint:
      "A secret from our journey"

  },

  "story-puzzle":{

    password:"STORY2006",

    title:"Our Story Puzzle",

    hint:"Put our memories back together ❤️"

    },

    "hidden-objects":{

  password:"HIDDEN2006",

  title:"Hidden Objects 🔍",

  hint:"Find the hidden memories inside our special photos ❤️"

},

"heart-rush": {

  password: "HEART2006",

  title:
    "Heart Rush 💖",

  hint:
    "Catch the hearts and avoid the bombs ❤️"

},

"cupid-arrow": {

  password: "CUPID2006",

  title:
    "Cupid Arrow Challenge 💘",

  hint:
    "Aim carefully and hit every heart ❤️"

},


  "guess-memory": {

    password: "GUESS2006",

    title:
      "Guess The Memory 📸",

    hint:
      "Something only we know"

  },


  "love-quiz": {

    password: "LOVE2006",

    title:
      "Love Quiz 💌",

    hint:
      "Our forever"

  },


  "treasure-hunt": {

    password: "SECRET999",

    title:
      "Secret Treasure 🔐",

    hint:
      "Find the hidden secret"

  }


};