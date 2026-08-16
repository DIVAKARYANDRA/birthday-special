/** Letters admin API */

import { apiRequest } from "./client";
import { createResourceApi } from "./resource";


export interface LetterRead {

  id:string;

  title:string;

  body:string;

  written_date:string|null;

  status:string;

  unlock_condition_id:string|null;

  media_asset_id:string|null;

}



export interface LetterCreate {

  title:string;

  body:string;

  written_date?:string;

  unlock_condition_id?:string;

  media_asset_id?:string;

}



export interface LetterUpdate {

  title?:string;

  body?:string;

  written_date?:string;

  unlock_condition_id?:string;

  media_asset_id?:string;

  status?:string;

}



const resourceApi =
createResourceApi<
  LetterRead,
  LetterCreate,
  LetterUpdate
>(
  "/api/v1/admin/letters"
);



export const lettersApi = {


  list:
    resourceApi.list,


  get:
    resourceApi.get,


  create:
    resourceApi.create,


  update:
    resourceApi.update,


  archive:
    resourceApi.archive,



  listSecretMessages: () =>

    apiRequest<unknown[]>(
      "/api/v1/admin/letters/secret-messages"
    ),


};