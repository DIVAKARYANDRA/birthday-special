import type {
  MemoryLevel,
} from "./types";



export const MEMORY_MATCH_LEVELS:MemoryLevel[] = [


  {
    level:1,
    pairs:2,
    pointsPerMatch:50,
  },


  {
    level:2,
    pairs:3,
    pointsPerMatch:60,
  },


  {
    level:3,
    pairs:4,
    pointsPerMatch:70,
  },


  {
    level:4,
    pairs:5,
    pointsPerMatch:80,
  },


  {
    level:5,
    pairs:6,
    pointsPerMatch:100,
  },


  {
    level:6,
    pairs:7,
    pointsPerMatch:120,
  },


  {
    level:7,
    pairs:8,
    pointsPerMatch:140,
  },


  {
    level:8,
    pairs:9,
    pointsPerMatch:160,
  },


  {
    level:9,
    pairs:10,
    pointsPerMatch:180,
  },


  {
    level:10,
    pairs:12,
    pointsPerMatch:250,
  },


];



export function getMemoryLevel(
level:number
):MemoryLevel{


return (
  MEMORY_MATCH_LEVELS.find(
    item =>
    item.level === level
  )
  ??
  MEMORY_MATCH_LEVELS[0]
);


}