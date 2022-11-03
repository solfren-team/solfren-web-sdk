import { Nft } from "./types";

export interface listNftsResponse {
  nfts: Nft[];
  next?: string;
}
