import type { Level, Food, KitchenStation } from "../data/types";
import { getCloudinaryUrl } from "../../../utils/mediaUrls";


export function mapBackendLevel(data:any):Level {


    const foods: Food[] = Array.from(
        new Map<string, Food>(

            (data.orders ?? []).map((order:any)=>[

                order.food.id,

                {
                    id: order.food.id,

                    name: order.food.name,


                    image:
                        order.food.image_media?.external_reference
                        ?
                        getCloudinaryUrl(
                            order.food.image_media.external_reference
                        )
                        :
                        "",


                    cookTime:
                        order.food.cook_time,


                    price:
                        order.food.sell_price,

                } as Food,

            ])

        ).values()
    );



    const stations:KitchenStation[] = [

        {
            id:"main-station",

            name:"Kitchen Counter",

            supportedFoodIds:
                foods.map(
                    food=>food.id
                ),

            capacity:3
        }

    ];



    return {


        id:data.id,


        levelNumber:
            data.level_number,



        theme:{


            id:
                data.theme.id,


            name:
                data.theme.name,


            description:
                data.theme.description ?? "",


            backgroundImage:

                data.theme.background_media?.external_reference

                ?

                getCloudinaryUrl(
                    data.theme.background_media.external_reference
                )

                :

                "",

        },



        difficulty:
            data.difficulty,


        timeLimit:
            data.time_limit,


        targetScore:
            data.target_score,


        customerCount:
            data.customer_count,



        stations,



        foods,



        customers:

            data.customers?.map((c:any)=>({


                id:
                    c.id,


                name:
                    c.name,



                avatar:

                    c.avatar_media?.external_reference

                    ?

                    getCloudinaryUrl(
                        c.avatar_media.external_reference
                    )

                    :

                    "",



                happyAvatar:

                    c.happy_media?.external_reference

                    ?

                    getCloudinaryUrl(
                        c.happy_media.external_reference
                    )

                    :

                    "",



                angryAvatar:

                    c.angry_media?.external_reference

                    ?

                    getCloudinaryUrl(
                        c.angry_media.external_reference
                    )

                    :

                    "",



                patienceSeconds:
                    c.patience_seconds,


            }))

            ??

            [],




        orderTemplates:


            data.orders?.map((o:any,index:number)=>({


                customerId:

                    data.customers?.[index]?.id ?? "",



                lines:[

                    {

                        foodId:
                            o.food.id,


                        quantity:
                            o.quantity,

                    }

                ],



                rewardPoints:
                    o.reward_points,


            }))


            ??

            []

    };

}