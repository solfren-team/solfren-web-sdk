import got from 'got';

export default class MagicEden {
  endpoint: string = 'https://api-mainnet.magiceden.dev/v2';

  async getTokenMetadata(mintAddress: string): Promise<TokenMetadata | null> {
    return got({
      method: 'get',
      url: `${this.endpoint}/tokens/${mintAddress}`
    }).json<TokenMetadata>();
  }

  async getCollection(symbol: string): Promise<Collection | null> {
    return got({
      method: 'get',
      url: `${this.endpoint}/collections/${symbol}`
    }).json<Collection>();
  }
}

export interface TokenMetadata {
  mintAddress: string;
  owner: string;
  supply: number;
  collection: string;
  name: string;
  updateAuthority: string;
  primarySaleHappened: number;
  sellerFeeBasisPoints: number;
  image: string;
  animationUrl: string;
  externalUrl: string;
  attributes: Attribute[];
  properties: Properties;
}

export interface Attribute {
  trait_type: string;
  value: string;
}

export interface File {
  uri: string;
  type: string;
}

export interface Creator {
  address: string;
  share: number;
}

export interface Properties {
  files: File[];
  category: string;
  creators: Creator[];
}

export interface Collection {
  symbol: string
  name: string
  description: string
  image: string
  twitter: string
  discord: string
  website: string
  isFlagged: boolean
  flagMessage: string
  categories: string[]
  floorPrice: number
  listedCount: number
  avgPrice24hr: number
  volumeAll: number
}
