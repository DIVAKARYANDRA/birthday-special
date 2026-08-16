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