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
