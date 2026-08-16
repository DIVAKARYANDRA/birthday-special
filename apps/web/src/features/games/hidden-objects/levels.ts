import type {
  HiddenObjectTarget,
} from "./types";


export const DEFAULT_HIDDEN_TARGETS:
HiddenObjectTarget[] =
[

{
id:"heart",

name:"Hidden Heart",

emoji:"❤️",

x:70,

y:65,

radius:8,

found:false

},


{
id:"star",

name:"Hidden Star",

emoji:"⭐",

x:30,

y:35,

radius:8,

found:false

},


{
id:"gift",

name:"Hidden Gift",

emoji:"🎁",

x:50,

y:80,

radius:8,

found:false

}

];



export const POINTS_PER_OBJECT = 50;