export interface Previews {
  image_small_url: string;
  image_medium_url: string;
  image_large_url: string;
  image_opengraph_url: string;
  blurhash: string;
}

export interface Owner {
  owner_address: string;
  quantity: number;
  first_acquired_date: Date;
  last_acquired_date: Date;
}

export interface Contract {
  type: string;
  name: string;
  symbol: string;
}

export interface MarketplacePage {
  marketplace_id: string;
  marketplace_name: string;
  marketplace_collection_id: string;
  nft_url: string;
  collection_url: string;
  verified: boolean;
}

export interface Collection {
  collection_id: string;
  name: string;
  description: string;
  image_url: string;
  banner_image_url: string;
  external_url: string;
  twitter_username: string;
  discord_url: string;
  marketplace_pages: MarketplacePage[];
  metaplex_mint?: any;
  metaplex_first_verified_creator?: any;
  floor_prices: any[];
  distinct_owner_count: number;
}

export interface Attribute {
  key: string;
  trait_type: string;
  value: string;
}

export interface ExtraMetadata {
  attributes: Attribute[];
  image_original_url: string;
  animation_original_url: string;
  is_mutable: boolean;
  seller_fee_basis_points: number;
  creators: {
    address: string;
    verified: boolean;
    share: number;
  }[]
}

export interface LastSale {
  from_address: string;
  to_address: string;
  quantity: number;
  timestamp: string;
  transaction: string;
  marketplace_id: string;
  marketplace_name: string;
  is_bundle_sale: boolean;
  payment_token: {
    payment_token_id: string;
    name: string;
    symbol: string;
    address: string | null;
    decimals: number;
  }
  unit_price: number;
  total_price: number;
}

export interface Nft {
  nft_id: string;
  chain: string;
  contract_address: string;
  token_id: string;
  name: string;
  description: string;
  image_url: string;
  video_url: string;
  audio_url?: any;
  model_url?: any;
  previews: Previews;
  background_color?: any;
  external_url: string;
  created_date: Date;
  status: string;
  token_count: number;
  owner_count: number;
  owners: Owner[];
  last_sale?: LastSale;
  contract: Contract;
  collection: Collection;
  extra_metadata: ExtraMetadata;
}
