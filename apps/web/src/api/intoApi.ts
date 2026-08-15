import { apiRequest } from "./client";

export interface IntroImage {
  id: string;
  media_asset_id: string;
  url: string;
  alt_text: string | null;
  display_order: number;
}

export async function getIntroImages(): Promise<IntroImage[]> {
  return apiRequest<IntroImage[]>(
    "/api/v1/experience/intro/images",
  );
}