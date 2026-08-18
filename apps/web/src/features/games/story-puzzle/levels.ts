export interface StoryPuzzleLevel {

 level:number;

 gridSize:number;

 points:number;

}


export const STORY_PUZZLE_LEVELS:
StoryPuzzleLevel[] = [


{
 level:1,
 gridSize:3,
 points:50
},


{
 level:2,
 gridSize:3,
 points:60
},


{
 level:3,
 gridSize:3,
 points:70
},


{
 level:4,
 gridSize:4,
 points:80
},


{
 level:5,
 gridSize:4,
 points:90
},


{
 level:6,
 gridSize:4,
 points:100
},


{
 level:7,
 gridSize:5,
 points:120
},


{
 level:8,
 gridSize:5,
 points:140
},


{
 level:9,
 gridSize:6,
 points:160
},


{
 level:10,
 gridSize:6,
 points:200
}

];



export function getStoryPuzzleLevel(
level:number
){

return STORY_PUZZLE_LEVELS[
level-1
];

}