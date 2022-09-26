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
  // id is the NFT mint address.
  id: string;
  // name is the NFT name.
  name: string;
  // image is the image url of NFT.
  image: string;
  // owner is the owner of NFT.
  owner?: OwnerInfo | null;
  // collected indicates if collected by present member.
  collected?: boolean;
  // categories is inherited from collection.
  categories?: string[];
}

export interface OwnerInfo {
  // id is the public address of owner.
  id: string;
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
