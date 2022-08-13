export enum MarketplaceName {
  MagicEden = 'MagicEden',
  DigitalEyes = 'DigitalEys',
  SolanaArt = 'SolanaArt',
  AlphaArt = 'AlphaArt',
  ExchangeArt = 'ExchangeArt',
  SolSea = 'SolSea',
  OpenSea = 'OpenSea',
}

export interface API {
  endpoint: string;
  getStats: (id: string) => Promise<CollectionStats | null>;
}

export interface CollectionStats {
  floorPrice: number;
  listedCount: number;
  volumeAll: number;
}
