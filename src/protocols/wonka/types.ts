export interface Nft {
  id: string;
  name: string;
  symbol: string;
  owner: {
    address: string;
    sol_domain: string;
  };
  image: {
    orig: string;
  };
  metaplex_metadata: {
    mint: string;
    creators: {
      address: string;
      verified: boolean;
      share: number;
    }[];
  }
}

export interface NftEdge {
  node: Nft;
  cursor: string;
}
