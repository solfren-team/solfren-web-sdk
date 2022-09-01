export interface CollectionResource {
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

export interface ItemResource {
  // id is the NFT mint address.
  id: string;
  // name is the NFT name.
  name: string;
  // image is the image url of NFT.
  image: string;
  // owner is the owner of NFT.
  owner: ItemOwnerResource | null;
  // collected indicates if collected by present member.
  collected?: boolean;
  // categories is inherited from collection.
  categories?: string[];
}

export interface ItemOwnerResource {
  // id is the public address of owner.
  id: string;
  // avatar is the avatar of owner.
  avatar?: string;
  // followed indicates if you followed this account or not.
  followed?: boolean;
}

export interface ActivityResource {
  id: string;
  item: ItemResource;
  price: number;
  buyer: ItemOwnerResource;
  seller: ItemOwnerResource;
  timestamp: Date;
}

export interface ListActivitiesResponse {
  activities: ActivityResource[];
  cursor: string;
}
