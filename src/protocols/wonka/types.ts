export interface Nft {
  id: string;
  name: string;
  symbol: string;
  owner?: {
    address: string;
    sol_domain?: string;
    twitter_handle?: string;
  };
  image?: {
    orig?: string;
  };
  metaplex_metadata: {
    mint: string;
    name?: string;
    symbol?: string;
    primary_sale_happened?: boolean;
    seller_fee_basis_points?: number;
    is_mutable?: boolean;
    token_standard?: string;
    uses?: {
      use_method: string;
      remaining: number;
      total: number;
    };
    collection?: {
      verified: boolean;
      key: string;
    }
    creators: {
      address: string;
      verified: boolean;
      share: number;
    }[];
  };
  external_metadata?: {
    description: string;
    externalUrl: string;
    animationUrl: string;
    collection: {
      name: string;
      family: string;
    };
    attributes?: {
      trait_type: string;
      value: string;
      display_type: string;
    }[];
  };
  token_account: {
    id: string;
    mint: string;
    owner: string;
  }
}

export interface NftEdge {
  node: Nft;
  cursor: string;
}
