export interface GamePasswordConfig {
  password: string;
  title: string;
  hint: string;
}


export const GAME_PASSWORDS: Record<string, GamePasswordConfig> = {


  "memory-match": {

    password: "LOVE123",

    title:
      "Memory Match ❤️",

    hint:
      "A secret from our journey"

  },

  "story-puzzle":{

    password:"PUZZLE000",

    title:"Our Story Puzzle",

    hint:"Put our memories back together ❤️"

    },

    "hidden-objects":{

  password:"DIVA000",

  title:"Hidden Objects 🔍",

  hint:"Find the hidden memories inside our special photos ❤️"

},

"cupid-arrow": {

  password: "CUPID777",

  title:
    "Cupid Arrow Challenge 💘",

  hint:
    "Aim carefully and hit every heart ❤️"

},


  "guess-memory": {

    password: "HEART456",

    title:
      "Guess The Memory 📸",

    hint:
      "Something only we know"

  },


  "love-quiz": {

    password: "FOREVER789",

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