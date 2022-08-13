import { CollectionInfo, SolNFTTransSale } from "../solfren-nft/types"

export interface WalletInfo {
  walletAddress: string,
  name?: string,
  description?: string,
  twitterHandle?: string,
  twitterInfo?: TwitterInfo,
  solanaDomain?: string,
  followering?: Array<string>,
  followers?: number,
  achievements?: Array<string>,
  selectedAvatarNFT?: {
    name: string,
    image_url: string
  }
}

export interface TwitterInfo {
  name: string,
  description?: string,
  profile_image_url?: string,
  id: string,
  location?: string,
  username: string,
  verified?: boolean,
  public_metrics: {
    followers_count?: number,
    following_count?: number,
    tweet_count?: number,
    listed_count?: number
  }
}

export interface TopVolumeItem {
  ownerAddress: string,
  count: number,
  sum: number,
  avg: number,
  max: number,
  topHits: SolNFTTransSale[]
}

export interface TopDiversityItem {
  ownerAddress: string,
  nftCount: number,
  collectionCount: number,
  topHits: SolNFTTransSale[]
}

export interface TopTradingFreqItem {
  ownerAddress: string,
  count: number,
  sellCount: number,
  buyCount: number,
  collections: {
    collectionName: string,
    collectionImage?: string,
    count: number,
    topHit: CollectionInfo,
  }[],
}
