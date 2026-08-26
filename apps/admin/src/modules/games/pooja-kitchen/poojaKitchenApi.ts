/**
 * Pooja Kitchen Admin API
 *
 * Handles admin CRUD operations for:
 * - Themes
 * - Foods
 * - Customers
 * - Levels
 *
 * Media upload remains handled by mediaApi.ts.
 * This file only assigns media IDs to game entities.
 */


import { apiRequest } from "../../../api/client";


// ============================================================
// Types
// ============================================================


export interface PoojaKitchenTheme {

  id:string;

  name:string;

  description:string | null;

  background_media_id:string | null;

  is_active:boolean;

}



export interface PoojaKitchenFood {

  id:string;

  name:string;

  image_media_id:string | null;

  cook_time:number;

  sell_price:number;

}



export interface PoojaKitchenCustomer {

  id:string;

  name:string;

  description:string | null;

  avatar_media_id:string | null;

  happy_media_id:string | null;

  angry_media_id:string | null;

  customer_type:string;

  patience_seconds:number;

  is_active:boolean;

}



export interface PoojaKitchenLevel {

  id:string;

  level_number:number;

  difficulty:string;

  time_limit:number;

  target_score:number;

  customer_count:number;

  theme_id:string;

  unlock_level:number | null;

}



// ============================================================
// Theme API
// ============================================================


export const themeApi = {


  list(){

    return apiRequest<PoojaKitchenTheme[]>(

      "/api/v1/admin/games/pooja-kitchen/admin/themes"

    );

  },



  get(
    id:string
  ){

    return apiRequest<PoojaKitchenTheme>(

      `/api/v1/admin/games/pooja-kitchen/admin/themes/${id}`

    );

  },



  update(
    id:string,
    payload:Partial<PoojaKitchenTheme>
  ){

    return apiRequest<PoojaKitchenTheme>(

      `/api/v1/admin/games/pooja-kitchen/admin/themes/${id}`,

      {

        method:"PATCH",

        body:JSON.stringify(payload),

      }

    );

  },


};



// ============================================================
// Food API
// ============================================================


export const foodApi = {


  list(){

    return apiRequest<PoojaKitchenFood[]>(

      "/api/v1/admin/games/pooja-kitchen/admin/foods"

    );

  },



  create(
    payload:Partial<PoojaKitchenFood>
  ){

    return apiRequest<PoojaKitchenFood>(

      "/api/v1/admin/games/pooja-kitchen/admin/foods",

      {

        method:"POST",

        body:JSON.stringify(payload),

      }

    );

  },



  update(
    id:string,
    payload:Partial<PoojaKitchenFood>
  ){

    return apiRequest<PoojaKitchenFood>(

      `/api/v1/admin/games/pooja-kitchen/admin/foods/${id}`,

      {

        method:"PATCH",

        body:JSON.stringify(payload),

      }

    );

  },


};



// ============================================================
// Customer API
// ============================================================


export const customerApi = {


  list(){

    return apiRequest<PoojaKitchenCustomer[]>(

      "/api/v1/admin/games/pooja-kitchen/customers"

    );

  },



  create(
    payload:Partial<PoojaKitchenCustomer>
  ){

    return apiRequest<PoojaKitchenCustomer>(

      "/api/v1/admin/games/pooja-kitchen/customers",

      {

        method:"POST",

        body:JSON.stringify(payload),

      }

    );

  },



  update(
    id:string,
    payload:Partial<PoojaKitchenCustomer>
  ){

    return apiRequest<PoojaKitchenCustomer>(

      `/api/v1/admin/games/pooja-kitchen/customers/${id}`,

      {

        method:"PATCH",

        body:JSON.stringify(payload),

      }

    );

  },


};



// ============================================================
// Level API
// ============================================================


export const levelApi = {


  list(){

    return apiRequest<PoojaKitchenLevel[]>(

      "/api/v1/admin/games/pooja-kitchen/admin/levels"

    );

  },



  update(
    id:string,
    payload:Partial<PoojaKitchenLevel>
  ){

    return apiRequest<PoojaKitchenLevel>(

      `/api/v1/admin/games/pooja-kitchen/admin/levels/${id}`,

      {

        method:"PATCH",

        body:JSON.stringify(payload),

      }

    );

  },


};