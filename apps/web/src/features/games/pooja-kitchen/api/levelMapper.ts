import type { Level, Food, KitchenStation } from "../data/types";


export function mapBackendLevel(data:any):Level {


    const foods: Food[] = Array.from(
        new Map<string, Food>(
            (data.orders ?? []).map((order: any) => [
                order.food.id,
                {
                    id: order.food.id,
                    name: order.food.name,
                    image: "",
                    cookTime: order.food.cook_time,
                    price: order.food.sell_price,
                } as Food,
            ])
        ).values()
    );


    const stations:KitchenStation[] = [
        {
            id:"main-station",
            name:"Kitchen Counter",
            supportedFoodIds:foods.map(
                food=>food.id
            ),
            capacity:3
        }
    ];



    return {

        id:data.id,

        levelNumber:data.level_number,


        theme:{
            id:data.theme.id,
            name:data.theme.name,
            description:data.theme.description ?? "",
            backgroundImage:""
        },


        difficulty:data.difficulty,

        timeLimit:data.time_limit,

        targetScore:data.target_score,

        customerCount:data.customer_count,


        stations,


        foods,


        customers:
            (data.customers ?? []).map(
                (c:any)=>({
                    id:c.id,
                    name:c.name,
                    avatar:"",
                    happyAvatar:"",
                    angryAvatar:"",
                    patienceSeconds:c.patience_seconds ?? 45
                })
            ),



        orderTemplates:
            (data.orders ?? []).map(
                (o:any)=>({
                    customerId:"",
                    lines:[
                        {
                            foodId:o.food.id,
                            quantity:o.quantity
                        }
                    ],
                    rewardPoints:o.reward_points
                })
            )

    };

}