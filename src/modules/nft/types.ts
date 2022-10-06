export interface CollectionItem {
  id: string;
  name: string;
  symbol: string;
  description: string;
  image: string;
  website?: string;
  discord?: string;
  twitter?: string;
  categories?: string[];
  floorPrice?: number
  listedCount?: number
  avgPrice24hr?: number
  volumeAll?: number
  createdAt: Date;
}

export interface NFTItem {
  // NFT mint address.
  mintAddress: string;
  // name is the NFT name.
  name: string;
  // image is the image url of NFT.
  image?: string;
  // description of NFT.
  description: string;
  // owner is the owner of NFT.
  owner?: OwnerInfo | null;
  // collected indicates if collected by present member.
  collected?: boolean;
  // categories is inherited from collection.
  categories?: string[];
  // metaplex metadata
  metaplexMetadata: MetaplexMetadata;
  // external metadata
  externalMetadata?: ExternalMetadata;
}

export interface MetaplexMetadata {
  name?: string;
  symbol?: string;
  primarySaleHappened?: boolean;
  sellerFeeBasisPoints?: number;
  isMutable?: boolean;
  tokenStandard?: string;
  uses?: MetaplexMetadataNFTUses;
  collection?: {
    verified: boolean;
    key: string;
  };
  creators: {
    address: string;
    verified: boolean;
    share: number
  }[];
}

export interface MetaplexMetadataNFTUses {
  useMethod: string;
  remaining: number;
  total: number
}

export interface ExternalMetadata {
  description?: string;
  externalUrl?: string;
  animationUrl?: string;
  collection?: {
    name?: string;
    family?: string;
  };
  attributes?: {
    traitType?: string;
    value?: string;
    displayType?: string;
  }[];
}

export interface ExternalMetadataAttribute {
  traitType: string;
  value: string;
  displayType: string;
}

export interface OwnerInfo {
  // public address of owner.
  address: string;
  // Bonfida Solana Domain
  solanaDomain?: string;
  // Twitter handle
  twitterHandle?: string;
  // avatar is the avatar of owner.
  avatar?: string;
  // followed indicates if you followed this account or not.
  followed?: boolean;
}

export interface ActivityItem {
  id: string;
  item: NFTItem;
  price: number;
  buyer: OwnerInfo;
  seller: OwnerInfo;
  timestamp: Date;
}

export interface ListActivitiesResponse {
  activities: ActivityItem[];
  cursor: string;
}

export interface ListCollectionsResponse {
  collections: CollectionItem[];
  hasNextPage: boolean;
}
